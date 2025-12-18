// src/components/NewSaleForm.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Sale } from '../types';
import { uid as generarIdVenta } from '../utils';
import { FaTimes, FaSave, FaSearch, FaUserPlus, FaCalendarAlt } from "react-icons/fa";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import Modal from "./Modal";

// ... (Tus constantes TYPES, PRE_NAILERS, etc. se quedan igual) ...
const TYPES = ["Esmaltado en gel permanente", "Bio builder gel", "Poligel", "Gel", "Acrilicas con tips", "Acrilicas esculpidas", "Manicura tradicional", "Pedicura tradicional", "Pedicura de esmaltado en gel permanente"];
const PRE_NAILERS = ['Ericka', 'Nicole', 'Lorena', 'Maria', 'David', 'Laura', 'Hellen'];
const PRE_SERVICES = Array.from({ length: 30 }).map((_, i) => `Servicio ${i + 1} - ${TYPES[i % TYPES.length]}`);
const PRE_CITIES = ['Moquegua', 'Lima'];
const PAYMENT_METHODS = ['Efectivo', 'Yape', 'Plin', 'Transferencia BCP', 'Transferencia Interbank', 'Transferencia Scotiabank', 'Transferencia Caja Arequipa', 'Pos Tarjeta', 'Pos QR'];

type Props = {
    onSave: (s: Sale) => void;
    onCancel?: () => void;
    initial?: Sale | null;
};

export default function NewSaleForm({ onSave, onCancel, initial = null }: Props) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const focusRef = useRef<HTMLDivElement | null>(null);

    // ... (Mantén TODOS tus estados igual: dateService, nailer, etc.) ...
    const [dateService, setDateService] = useState(initial ? initial.dateService : new Date().toISOString().slice(0, 10));
    const [nailer, setNailer] = useState(initial ? initial.nailer : PRE_NAILERS[0]);
    const [serviceType, setServiceType] = useState(initial ? initial.serviceType : PRE_SERVICES[0]);
    const [serviceQuery, setServiceQuery] = useState('');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [quantity, setQuantity] = useState<number>(initial ? initial.quantity : 1);
    const [unitPrice, setUnitPrice] = useState<number>(initial ? initial.unitPrice : 50);
    const [advance, setAdvance] = useState<number>(initial ? (initial as any).advance ?? 0 : 0);

    // Cálculo financiero
    const totalAmount = quantity * unitPrice;
    const balance = totalAmount - advance;

    const [paymentMethod, setPaymentMethod] = useState(initial ? initial.paymentMethod : PAYMENT_METHODS[0]);
    const [percentNailer, _setPercentNailer] = useState<number>(initial ? (initial as any).percentNailer ?? 5 : 5);
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

    // ... (Mantén tus useEffects, useMemo y funciones auxiliares IGUALES) ...
    const filteredServices = useMemo(() => {
        const q = serviceQuery.trim().toLowerCase();
        if (!q) return PRE_SERVICES.slice(0, 9);
        return PRE_SERVICES.filter(s => s.toLowerCase().includes(q)).slice(0, 20);
    }, [serviceQuery]);

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
        if (quantity <= 0) return setErr('Cantidad incorrecta');

        let clientObj: any = undefined;
        if (clientId) {
            clientObj = { id: String(clientId), dni: String(clientDni), nombres: clientName, apellidos: '' };
        }

        const sale: Sale & { client?: any } = {
            id: initial ? initial.id : generarIdVenta('s_'),
            dateService, nailer, serviceType, description, quantity, unitPrice, paymentMethod, percentNailer, city,
            createdAt: initial ? initial.createdAt : new Date().toISOString(),
            advance, balance, ...(clientObj ? { client: clientObj } : {})
        };

        try {
            onSave(sale as Sale);
            // ... (Lógica Calendar omitida por brevedad, se mantiene igual) ...
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

    // --- AQUÍ EMPIEZA EL CAMBIO VISUAL ---
    return (
        <div ref={rootRef} className="text-gray-700"> {/* Quitamos bg-main, el modal ya es blanco */}
            <div ref={focusRef} tabIndex={-1} className="outline-none">

                {/* 1. Título Limpio y Elegante (Negro/Gris Oscuro) */}
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-3xl font-bold font-serif text-gray-800">
                        {initial ? 'Editar Cita' : 'Nueva Cita'}
                    </h3>
                    <div className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {initial ? 'Modificando' : 'Registrando'}
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Fila 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <label className="block">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Fecha y Hora</span>
                            <div className="relative">
                                <input type="datetime-local" value={dateService} onChange={(e) => setDateService(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none transition-all font-medium" />
                                <FaCalendarAlt className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                            </div>
                        </label>
                        <label className="block">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Nailer</span>
                            <select value={nailer} onChange={(e) => setNailer(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none transition-all font-medium appearance-none">
                                {PRE_NAILERS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
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
                                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
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
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none transition-all font-medium">
                                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </label>
                    </div>

                    {/* Servicios */}
                    <div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Servicio</span>
                        <input className="w-full p-3 border border-gray-200 rounded-t-xl focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Buscar servicio..." value={serviceQuery} onChange={(e) => setServiceQuery(e.target.value)} />
                        <div className="max-h-32 overflow-auto border border-t-0 border-gray-200 rounded-b-xl bg-gray-50">
                            {filteredServices.map(s => (
                                <div key={s} onClick={() => { setServiceType(s); setServiceQuery(''); }} className={`p-2 px-3 hover:bg-pink-50 cursor-pointer text-sm ${serviceType === s ? 'bg-pink-100 text-pink-700 font-bold' : 'text-gray-600'}`}>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>

                    <label className="block">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Notas / Descripción</span>
                        <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none resize-none h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </label>

                    {/* Cálculos */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="block">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Cant.</span>
                            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-center font-bold" />
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-bold text-blue-500 uppercase">Adelanto</span>
                            <input type="number" min={0} value={advance} onChange={(e) => setAdvance(Number(e.target.value))} className="w-full p-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-center font-bold" />
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Precio</span>
                            <input type="number" min={0} value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-center font-bold" />
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-bold text-red-500 uppercase">Pendiente</span>
                            <div className="w-full p-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-center font-bold">
                                {balance.toFixed(2)}
                            </div>
                        </label>
                        <label className="block col-span-2 md:col-span-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Ciudad</span>
                            <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm">
                                {PRE_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </label>
                    </div>

                    {err && <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg">{err}</div>}

                    {/* Botones VISIBLES */}
                    <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
                        {onCancel && (
                            <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-colors flex items-center gap-2">
                                <FaTimes /> Cancelar
                            </button>
                        )}
                        <button type="submit" className="px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-200 transform hover:-translate-y-1 transition-all flex items-center gap-2">
                            <FaSave /> {initial ? 'Guardar Cambios' : 'Registrar Cita'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de Registro Rápido (Simplificado visualmente) */}
            <Modal isOpen={showQuickReg} onClose={() => setShowQuickReg(false)} width="400px">
                <div className="text-gray-800">
                    <h4 className="text-xl font-serif font-bold mb-4">Registro Rápido</h4>
                    <p className="mb-4 text-sm text-gray-500">DNI: <strong>{clientDni}</strong>. Completaremos los datos automáticamente.</p>
                    <input autoFocus placeholder="Celular (Opcional)" value={quickPhone} onChange={(e) => setQuickPhone(e.target.value)} className="w-full p-3 border rounded-xl mb-6 outline-none focus:ring-2 focus:ring-green-400" />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowQuickReg(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button onClick={handleQuickRegister} disabled={quickLoading} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold">{quickLoading ? '...' : 'Registrar'}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}