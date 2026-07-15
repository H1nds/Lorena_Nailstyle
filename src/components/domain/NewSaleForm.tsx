// src/components/domain/NewSaleForm.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Sale } from '@/types';
import { uid as generarIdVenta } from '@/utils';
import { FaTimes, FaSave, FaSearch, FaUserPlus, FaCalendarAlt, FaPlus } from "react-icons/fa";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from '@/config/firebase';
import Modal from '@/components/ui/Modal';

const PRE_CITIES = ['Moquegua', 'Tacna'];
const PAYMENT_METHODS = [
    'Efectivo',
    'Yape (caja arequipa)',
    'Izipay',
    'Estilos',
    'Transferencia caja Arequipa',
    'Transferencia BCP'
];

type Props = {
    onSave: (s: Sale) => void;
    onCancel?: () => void;
    initial?: Sale | null;
};

export default function NewSaleForm({ onSave, onCancel, initial = null }: Props) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const focusRef = useRef<HTMLDivElement | null>(null);

    const [dateService, setDateService] = useState(initial ? initial.dateService : new Date().toISOString().slice(0, 10));
    
    // Services
    const [dbServices, setDbServices] = useState<string[]>([]);
    const [serviceType, setServiceType] = useState(initial ? initial.serviceType : '');
    const [serviceQuery, setServiceQuery] = useState('');
    const [isAddingService, setIsAddingService] = useState(false);

    const [description, setDescription] = useState(initial?.description ?? '');
    
    // Number state as strings to fix leading zero bug
    const [quantity, setQuantity] = useState<string>(initial ? String(initial.quantity) : "1");
    const [unitPrice, setUnitPrice] = useState<string>(initial ? String(initial.unitPrice) : "50");
    const [advance, setAdvance] = useState<string>(initial ? String((initial as any).advance ?? 0) : "0");

    // Cálculo financiero
    const numQuantity = Number(quantity) || 0;
    const numUnitPrice = Number(unitPrice) || 0;
    const numAdvance = Number(advance) || 0;

    const totalAmount = numQuantity * numUnitPrice;
    const balance = totalAmount - numAdvance;

    const [paymentMethod, setPaymentMethod] = useState(initial ? initial.paymentMethod : PAYMENT_METHODS[0]);
    const [city, setCity] = useState(initial ? initial.city : PRE_CITIES[0]);
    const [err, setErr] = useState('');

    // Estados Cliente
    const initialClient = (initial as any)?.client;
    const [clientDni, setClientDni] = useState(initialClient?.dni ?? '');
    const [clientName, setClientName] = useState(initialClient ? `${initialClient.nombres ?? ''} ${initialClient.apellidos ?? ''}` : '');
    const [clientId, setClientId] = useState<string | null>(initialClient?.id ?? null);
    const [clientSearching, setClientSearching] = useState(false);

    const [canRegister, setCanRegister] = useState(false);
    const [showQuickReg, setShowQuickReg] = useState(false);
    const [quickPhone, setQuickPhone] = useState('');
    const [quickLoading, setQuickLoading] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const snap = await getDocs(collection(db, 'servicios'));
                const s = snap.docs.map(doc => doc.data().name as string);
                setDbServices(s);
            } catch (e) {
                console.error("Error fetching services", e);
            }
        };
        fetchServices();
    }, []);

    const filteredServices = useMemo(() => {
        const q = serviceQuery.trim().toLowerCase();
        if (!q) return dbServices.slice(0, 20);
        return dbServices.filter(s => s.toLowerCase().includes(q)).slice(0, 20);
    }, [serviceQuery, dbServices]);

    const handleAddService = async () => {
        const newService = serviceQuery.trim();
        if (!newService) return;
        setIsAddingService(true);
        try {
            await addDoc(collection(db, 'servicios'), { name: newService });
            setDbServices(prev => [...prev, newService]);
            setServiceType(newService);
            setServiceQuery('');
        } catch (e) {
            console.error(e);
            alert("Error al agregar servicio");
        } finally {
            setIsAddingService(false);
        }
    };

    const buscarClienteEnDB = async (dni: string) => {
        const clean = dni.trim();
        setCanRegister(false);
        if (!/^\d{8}$/.test(clean)) { setClientId(null); setClientName(''); return; }
        setClientSearching(true);
        try {
            const col = collection(db, 'clientes');
            const q = query(col, where('dni', '==', clean));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const doc = snap.docs[0];
                const data = doc.data() as any;
                setClientId(doc.id);
                setClientName(`${data.nombres ?? ''} ${data.apellidos ?? ''}`.trim());
                setCanRegister(false);
            } else {
                setClientId(null); setClientName(''); setCanRegister(true);
            }
        } catch (e) { console.error(e); } finally { setClientSearching(false); }
    };

    const handleQuickRegister = async () => {
        setQuickLoading(true);
        try {
            const res = await fetch("/api/dni", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dni: clientDni }),
            });
            if (!res.ok) throw new Error("Error API DNI");
            const json = await res.json();
            const payload = json.data ?? json;
            const nombres = payload.nombres ?? payload.nombre ?? "";
            const apellidos = `${payload.apellido_paterno ?? ""} ${payload.apellido_materno ?? ""}`.trim();

            if (!nombres) throw new Error("Sin datos");

            const docRef = await addDoc(collection(db, "clientes"), {
                dni: clientDni, nombres, apellidos, phone: quickPhone || "", createdAt: new Date().toISOString()
            });
            setClientId(docRef.id); setClientName(`${nombres} ${apellidos}`);
            setCanRegister(false); setShowQuickReg(false); setQuickPhone("");
        } catch (e) { alert("Error registro rápido"); } finally { setQuickLoading(false); }
    };

    useEffect(() => { if (clientDni.trim().length === 8) buscarClienteEnDB(clientDni); else { setCanRegister(false); setClientId(null); setClientName(''); } }, [clientDni]);
    useEffect(() => { focusRef.current?.focus(); }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const uid = auth.currentUser?.uid;
        if (!uid) { alert('Debes iniciar sesión.'); return; }
        if (!serviceType) return setErr('Falta servicio');
        if (numQuantity <= 0) return setErr('Cantidad incorrecta');

        let clientObj: any = undefined;
        if (clientId) {
            clientObj = { id: String(clientId), dni: String(clientDni), nombres: clientName, apellidos: '' };
        }

        const sale: Sale & { client?: any } = {
            id: initial ? initial.id : generarIdVenta('s_'),
            dateService, 
            nailer: "-", // Default value for removed Nailer field
            serviceType, 
            description, 
            quantity: numQuantity, 
            unitPrice: numUnitPrice, 
            paymentMethod, 
            percentNailer: 0, // Default value for removed field
            city,
            createdAt: initial ? initial.createdAt : new Date().toISOString(),
            advance: numAdvance, 
            balance, 
            ...(clientObj ? { client: clientObj } : {})
        };

        try {
            onSave(sale as Sale);
            try {
                const title = `Cita — ${serviceType}`;
                const descriptionText = `Total: ${totalAmount}`;
                await fetch('/api/calendar/create-event', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid, saleId: sale.id, dateService, title, description: descriptionText, allDay: false })
                });
            } catch (err) { console.error('Calendar error', err); }
        } catch (err) { setErr('Error al guardar'); }
    };

    return (
        <div ref={rootRef} className="text-gray-700">
            <div ref={focusRef} tabIndex={-1} className="outline-none">

                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-3xl font-bold font-serif text-gray-800">
                        {initial ? 'Editar Cita' : 'Nueva Cita'}
                    </h3>
                    <div className="bg-babyblue-50 text-babyblue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {initial ? 'Modificando' : 'Registrando'}
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Fila 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                        <label className="block">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Fecha y Hora</span>
                            <div className="relative w-full md:w-1/2">
                                <input type="datetime-local" value={dateService} onChange={(e) => setDateService(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-300 outline-none transition-all font-medium" />
                                <FaCalendarAlt className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                            </div>
                        </label>
                    </div>

                    {/* Fila 2: Cliente */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <label className="block">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Cliente (DNI)</span>
                            <div className="flex gap-2">
                                <input
                                    value={clientDni}
                                    onChange={(e) => setClientDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                    placeholder="Ingrese 8 dígitos"
                                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-300 outline-none"
                                    maxLength={8}
                                />
                                <button type="button" onClick={() => buscarClienteEnDB(clientDni)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                    {clientSearching ? <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" /> : <FaSearch />}
                                </button>
                                {canRegister && (
                                    <button type="button" onClick={() => setShowQuickReg(true)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Registrar nuevo">
                                        <FaUserPlus />
                                    </button>
                                )}
                            </div>
                            <div className="mt-2 h-5 text-sm">
                                {clientId ? <span className="text-green-600 font-bold">✓ {clientName}</span> : canRegister ? <span className="text-orange-500 font-medium">Cliente nuevo, regístralo →</span> : <span className="text-gray-400">Buscar por DNI</span>}
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Método de Pago</span>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-300 outline-none transition-all font-medium">
                                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </label>
                    </div>

                    {/* Servicios */}
                    <div className="relative">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Servicio</span>
                        <div className="relative">
                            <input 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-t-xl focus:ring-2 focus:ring-babyblue-300 outline-none" 
                                placeholder={serviceType ? serviceType : "Buscar o crear un nuevo servicio..."} 
                                value={serviceQuery} 
                                onChange={(e) => setServiceQuery(e.target.value)} 
                                onFocus={() => setServiceType('')}
                            />
                            {serviceType && !serviceQuery && (
                                <div className="absolute top-0 left-0 bottom-0 right-0 p-3 pointer-events-none flex items-center bg-gray-50 border border-gray-200 rounded-xl font-bold text-babyblue-700">
                                    {serviceType}
                                </div>
                            )}
                        </div>
                        {(serviceQuery || dbServices.length > 0) && !serviceType && (
                            <div className="max-h-40 overflow-auto border border-t-0 border-gray-200 rounded-b-xl bg-white shadow-lg absolute w-full z-20">
                                {serviceQuery && !dbServices.find(s => s.toLowerCase() === serviceQuery.toLowerCase().trim()) && (
                                    <button type="button" onClick={handleAddService} disabled={isAddingService} className="w-full text-left p-3 flex items-center gap-2 text-babyblue-600 bg-babyblue-50 hover:bg-babyblue-100 font-bold border-b border-gray-100 transition-colors">
                                        <FaPlus /> {isAddingService ? 'Añadiendo...' : `Añadir "${serviceQuery.trim()}" como nuevo`}
                                    </button>
                                )}
                                {filteredServices.map(s => (
                                    <div key={s} onClick={() => { setServiceType(s); setServiceQuery(''); }} className="p-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0 transition-colors">
                                        {s}
                                    </div>
                                ))}
                                {filteredServices.length === 0 && !serviceQuery && (
                                    <div className="p-3 text-sm text-gray-400 text-center italic">
                                        No hay servicios registrados aún. Escribe uno nuevo.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <label className="block">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Notas / Descripción</span>
                        <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-300 outline-none resize-none h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </label>

                    {/* Cálculos */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-2">
                        <label className="block">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Cant.</span>
                            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-center font-bold outline-none focus:ring-1 focus:ring-babyblue-300" />
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-bold text-blue-500 uppercase">Adelanto</span>
                            <input type="number" min={0} value={advance} onChange={(e) => setAdvance(e.target.value)} className="w-full p-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-center font-bold outline-none focus:ring-1 focus:ring-babyblue-300" />
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Precio</span>
                            <input type="number" min={0} value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-center font-bold outline-none focus:ring-1 focus:ring-babyblue-300" />
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-bold text-red-500 uppercase">Pendiente</span>
                            <div className="w-full p-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-center font-bold flex items-center justify-center h-[38px]">
                                {balance.toFixed(2)}
                            </div>
                        </label>
                        <label className="block col-span-2 md:col-span-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Ciudad</span>
                            <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm h-[38px] outline-none">
                                {PRE_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </label>
                    </div>

                    {err && <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg">{err}</div>}

                    {/* Botones VISIBLES */}
                    <div className="flex gap-4 justify-end pt-4 border-t border-gray-100 mt-10">
                        {onCancel && (
                            <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-colors flex items-center gap-2">
                                <FaTimes /> Cancelar
                            </button>
                        )}
                        <button type="submit" className="px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-500 hover:via-gold-600 hover:to-gold-700 shadow-lg shadow-gold-200/50 transform hover:-translate-y-1 transition-all flex items-center gap-2">
                            <FaSave /> {initial ? 'Guardar Cambios' : 'Registrar Cita'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de Registro Rápido */}
            <Modal isOpen={showQuickReg} onClose={() => setShowQuickReg(false)} width="400px">
                <div className="text-gray-800">
                    <h4 className="text-xl font-serif font-bold mb-4">Registro Rápido</h4>
                    <p className="mb-4 text-sm text-gray-500">DNI: <strong>{clientDni}</strong>. Completaremos los datos automáticamente.</p>
                    <input autoFocus placeholder="Celular (Opcional)" value={quickPhone} onChange={(e) => setQuickPhone(e.target.value)} className="w-full p-3 border rounded-xl mb-6 outline-none focus:ring-2 focus:ring-green-400" />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowQuickReg(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                        <button onClick={handleQuickRegister} disabled={quickLoading} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold transition-colors">{quickLoading ? '...' : 'Registrar'}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}