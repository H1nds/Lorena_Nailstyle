// src/components/NewSaleForm.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Sale } from '../types';
import { uid as generarIdVenta } from '../utils';
import { FaTimes, FaSave, FaSearch, FaUserPlus } from "react-icons/fa";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import Modal from "./Modal";

type PartialClient = { id?: string; dni?: string; nombres?: string; apellidos?: string };

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

    // Estados de la Venta
    const [dateService, setDateService] = useState(initial ? initial.dateService : new Date().toISOString().slice(0, 10));
    const [nailer, setNailer] = useState(initial ? initial.nailer : PRE_NAILERS[0]);
    const [serviceType, setServiceType] = useState(initial ? initial.serviceType : PRE_SERVICES[0]);
    const [serviceQuery, setServiceQuery] = useState('');
    const [description, setDescription] = useState(initial?.description ?? '');

    // --- Lógica Financiera ---
    const [quantity, setQuantity] = useState<number>(initial ? initial.quantity : 1);
    const [unitPrice, setUnitPrice] = useState<number>(initial ? initial.unitPrice : 50);
    // Nuevo estado para Adelanto (si es edición, usa el valor guardado, sino 0)
    const [advance, setAdvance] = useState<number>(initial ? (initial as any).advance ?? 0 : 0);

    // Cálculo en tiempo real del Saldo Pendiente
    // Saldo = (Precio * Cantidad) - Adelanto
    const totalAmount = quantity * unitPrice;
    const balance = totalAmount - advance;

    const [paymentMethod, setPaymentMethod] = useState(initial ? initial.paymentMethod : PAYMENT_METHODS[0]);
    const [percentNailer, _setPercentNailer] = useState<number>(initial ? (initial as any).percentNailer ?? 5 : 5);
    const [city, setCity] = useState(initial ? initial.city : PRE_CITIES[0]);
    const [err, setErr] = useState('');

    // Estados del Cliente (sin cambios)
    const initialClient = (initial as any)?.client as PartialClient | undefined;
    const [clientDni, setClientDni] = useState(initialClient?.dni ?? '');
    const [clientName, setClientName] = useState(initialClient ? `${initialClient.nombres ?? ''} ${initialClient.apellidos ?? ''}` : '');
    const [clientId, setClientId] = useState<string | null>(initialClient?.id ?? null);
    const [clientSearching, setClientSearching] = useState(false);

    const [canRegister, setCanRegister] = useState(false);
    const [showQuickReg, setShowQuickReg] = useState(false);
    const [quickPhone, setQuickPhone] = useState('');
    const [quickLoading, setQuickLoading] = useState(false);

    const filteredServices = useMemo(() => {
        const q = serviceQuery.trim().toLowerCase();
        if (!q) return PRE_SERVICES.slice(0, 9);
        return PRE_SERVICES.filter(s => s.toLowerCase().includes(q)).slice(0, 20);
    }, [serviceQuery]);

    // ... (funciones buscarClienteEnDB y handleQuickRegister se mantienen igual) ...
    const buscarClienteEnDB = async (dni: string) => {
        const clean = dni.trim();
        setCanRegister(false);
        if (!/^\d{8}$/.test(clean)) {
            setClientId(null);
            setClientName('');
            return;
        }
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
                setClientId(null);
                setClientName('');
                setCanRegister(true);
            }
        } catch (e) {
            console.error('Error buscando cliente en DB:', e);
            setClientId(null);
            setClientName('');
        } finally {
            setClientSearching(false);
        }
    };

    const handleQuickRegister = async () => {
        setQuickLoading(true);
        try {
            const res = await fetch("/api/dni", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dni: clientDni }),
            });

            if (!res.ok) throw new Error("Error al consultar DNI");
            const json = await res.json();
            const payload = json.data ?? json;

            const nombres = payload.nombres ?? payload.nombre ?? payload.name ?? "";
            const apellidoP = payload.apellido_paterno ?? payload.apellidoPaterno ?? "";
            const apellidoM = payload.apellido_materno ?? payload.apellidoMaterno ?? "";
            const apellidos = `${apellidoP} ${apellidoM}`.trim();

            if (!nombres) throw new Error("No se encontraron nombres para este DNI");

            const docRef = await addDoc(collection(db, "clientes"), {
                dni: clientDni,
                nombres: nombres,
                apellidos: apellidos,
                phone: quickPhone || "",
                createdAt: new Date().toISOString()
            });

            setClientId(docRef.id);
            setClientName(`${nombres} ${apellidos}`);
            setCanRegister(false);
            setShowQuickReg(false);
            setQuickPhone("");
            alert(`Cliente ${nombres} registrado y seleccionado.`);

        } catch (e: any) {
            console.error(e);
            alert("Error al registrar cliente: " + (e.message || "Intente manualmente"));
        } finally {
            setQuickLoading(false);
        }
    };

    useEffect(() => {
        if (clientDni.trim().length === 8) buscarClienteEnDB(clientDni);
        else {
            setCanRegister(false);
            setClientId(null);
            setClientName('');
        }
    }, [clientDni]);

    useEffect(() => {
        focusRef.current?.focus();
    }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const uid = auth.currentUser?.uid;
        if (!uid) { alert('Debes iniciar sesión.'); return; }

        if (!serviceType) return setErr('Selecciona un tipo de servicio');
        if (quantity <= 0) return setErr('Cantidad debe ser mayor a 0');
        if (unitPrice < 0) return setErr('Precio inválido');

        let clientObj: any = undefined;
        if (clientId) {
            const parts = (clientName || '').split(' ');
            clientObj = {
                id: String(clientId),
                dni: String(clientDni),
                nombres: parts[0] || '',
                apellidos: parts.slice(1).join(' ') || ''
            };
        }

        const sale: Sale & { client?: any } = {
            id: initial ? initial.id : generarIdVenta('s_'),
            dateService,
            nailer,
            serviceType,
            description,
            quantity,
            unitPrice,
            paymentMethod,
            percentNailer,
            city,
            createdAt: initial ? initial.createdAt : new Date().toISOString(),
            // --- NUEVOS CAMPOS GUARDADOS ---
            advance,
            balance,
            ...(clientObj ? { client: clientObj } : {})
        };

        try {
            onSave(sale as Sale);

            // Nota: Se añade el balance al cuerpo del evento de calendario para referencia
            const title = `Cita — ${serviceType} — ${clientName || nailer}`;
            const descriptionText = `Total: S/.${totalAmount}\nAdelanto: S/.${advance}\nSaldo Pendiente: S/.${balance}\nPago: ${paymentMethod}\nNailer: ${nailer}\nNotas: ${description || '-'}`;
            const allDay = /^\d{4}-\d{2}-\d{2}$/.test(dateService);

            try {
                await fetch('/api/calendar/create-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid,
                        saleId: sale.id,
                        dateService,
                        title,
                        description: descriptionText,
                        allDay
                    })
                });
            } catch (err) {
                console.error('Error calendar (no bloqueante)', err);
            }

        } catch (err: any) {
            console.error('Error guardando la venta', err);
            setErr('Error guardando la venta');
        }
    };

    return (
        <div ref={rootRef} className="bg-[var(--bg-main)] text-[var(--text-main)] rounded-xl shadow-lg w-full" style={{ borderRadius: 14, padding: 0 }}>
            <div ref={focusRef} tabIndex={-1} style={{ outline: "none", padding: 18 }}>
                <h3 className="text-lg font-semibold bg-[var(--accent-pink)] text-white px-6 py-3 -mx-6 mb-4 rounded-t-xl">
                    {initial ? 'Editar venta' : 'Registrar nueva venta'}
                </h3>

                <form onSubmit={submit} className="space-y-3">
                    {/* Fila 1: Fecha y Nailer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex flex-col">
                            <span className="font-medium text-sm text-gray-700">Fecha del servicio</span>
                            <input type="datetime-local" value={dateService} onChange={(e) => setDateService(e.target.value)} className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                        <label className="flex flex-col">
                            <span className="font-medium text-sm text-gray-700">Nailer</span>
                            <select value={nailer} onChange={(e) => setNailer(e.target.value)} className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200">
                                {PRE_NAILERS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </label>
                    </div>

                    {/* Fila 2: Cliente y Pago */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex flex-col">
                            <span className="font-medium text-sm text-gray-700">Cliente (DNI)</span>
                            <div className="flex gap-2 mt-1">
                                <input
                                    value={clientDni}
                                    onChange={(e) => setClientDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                    placeholder="8 dígitos"
                                    className="p-2 border rounded flex-1"
                                    maxLength={8}
                                />

                                <button
                                    type="button"
                                    onClick={() => buscarClienteEnDB(clientDni)}
                                    disabled={clientSearching}
                                    className="flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-110 hover:shadow-md focus:outline-none"
                                    title="Buscar cliente"
                                    style={{ backgroundColor: "var(--accent-soft, #E6F6FF)", border: "1px solid rgba(59,130,246,0.08)" }}
                                >
                                    {clientSearching ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    ) : (
                                        <FaSearch size={15} color="var(--accent-blue, #2563EB)" />
                                    )}
                                </button>

                                {canRegister && (
                                    <button
                                        type="button"
                                        onClick={() => setShowQuickReg(true)}
                                        className="flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-110 hover:shadow-md focus:outline-none bg-green-100 border border-green-200"
                                        title="Cliente nuevo: Registrar"
                                    >
                                        <FaUserPlus size={16} className="text-green-600" />
                                    </button>
                                )}
                            </div>

                            <div className="text-sm mt-1 h-5">
                                {clientId ? (
                                    <span className="text-green-600 font-medium">✓ {clientName}</span>
                                ) : canRegister ? (
                                    <span className="text-orange-500 text-xs">Cliente no registrado. Dale al + para añadirlo.</span>
                                ) : (
                                    <span className="text-gray-400 text-xs">Introduce DNI para buscar</span>
                                )}
                            </div>
                        </label>

                        <label className="flex flex-col">
                            <span className="font-medium text-sm text-gray-700">Método de pago</span>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200">
                                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </label>
                    </div>

                    <div>
                        <label className="block font-medium text-sm text-gray-700">Tipo de servicio (buscable)</label>
                        <input className="w-full p-2 border rounded mt-1 mb-2" placeholder="Busca por nombre..." value={serviceQuery} onChange={(e) => setServiceQuery(e.target.value)} />
                        <div className="max-h-36 overflow-auto border rounded">
                            {filteredServices.map(s => (
                                <div key={s} onClick={() => { setServiceType(s); setServiceQuery(''); }} className={`p-2 hover:bg-gray-50 cursor-pointer ${serviceType === s ? 'font-semibold bg-gray-50' : ''}`}>
                                    {s}
                                </div>
                            ))}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Seleccionado: <span className="font-medium text-purple-700">{serviceType}</span></div>
                    </div>

                    <label className="flex flex-col">
                        <span className="font-medium text-sm text-gray-700">Descripción</span>
                        <textarea className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </label>

                    {/* --- AQUÍ ESTÁ EL CAMBIO VISUAL SOLICITADO --- */}
                    {/* Grid responsivo: 2 columnas en móviles, 5 en escritorio */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">

                        {/* 1. Cantidad */}
                        <label className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-500 mb-1">Cantidad</span>
                            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="p-2 border rounded text-center font-medium" />
                        </label>

                        {/* 2. Adelanto (Editable) */}
                        <label className="flex flex-col">
                            <span className="text-xs font-semibold text-blue-600 mb-1">Adelanto (S/.)</span>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={advance}
                                onChange={(e) => setAdvance(Number(e.target.value))}
                                className="p-2 border border-blue-200 rounded text-center text-blue-700 font-bold bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </label>

                        {/* 3. Cuota Unitaria */}
                        <label className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-500 mb-1">Cuota unitaria (S/.)</span>
                            <input type="number" min={0} step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="p-2 border rounded text-center text-gray-600" />
                        </label>

                        {/* 4. Saldo Pendiente (No editable, Calculado) */}
                        <label className="flex flex-col">
                            <span className="text-xs font-semibold text-red-500 mb-1">Saldo Pendiente</span>
                            <input
                                type="text"
                                readOnly
                                value={`S/. ${balance.toFixed(2)}`}
                                className="p-2 border border-red-100 bg-red-50 rounded text-center text-red-600 font-bold cursor-not-allowed"
                            />
                        </label>

                        {/* 5. Ciudad */}
                        <label className="flex flex-col col-span-2 md:col-span-1">
                            <span className="text-xs font-semibold text-gray-500 mb-1">Ciudad</span>
                            <select value={city} onChange={(e) => setCity(e.target.value)} className="p-2 border rounded text-sm bg-white">
                                {PRE_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </label>
                    </div>

                    {err && <div className="text-red-500 text-sm font-medium text-center">{err}</div>}

                    <div className="flex gap-3 justify-end pt-4 border-t mt-4">
                        {onCancel && (
                            <button type="button" className="btn-icon bg-purple-100 text-purple-800 p-2 rounded-full hover:bg-purple-200" onClick={onCancel} title="Cancelar">
                                <FaTimes size={16} />
                            </button>
                        )}
                        <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-[var(--accent-blue)] text-white rounded-full font-bold shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-0.5" title="Guardar venta">
                            <FaSave size={16} />
                            <span>Guardar</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de Registro Rápido (sin cambios) */}
            <Modal isOpen={showQuickReg} onClose={() => setShowQuickReg(false)} width="400px">
                <div className="p-2">
                    <h4 className="text-lg font-bold mb-4 text-gray-800">Registrar Cliente Rápido</h4>
                    <p className="text-sm text-gray-600 mb-4">
                        DNI: <strong>{clientDni}</strong><br />
                        Los nombres se obtendrán automáticamente.
                    </p>

                    <label className="flex flex-col mb-6">
                        Celular (Opcional)
                        <input
                            value={quickPhone}
                            onChange={(e) => setQuickPhone(e.target.value.replace(/[^\d+]/g, ''))}
                            className="mt-1 p-2 border rounded focus:ring-2 focus:ring-green-200 outline-none"
                            placeholder="Ej. 912345678"
                            autoFocus
                        />
                    </label>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setShowQuickReg(false)}
                            className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleQuickRegister}
                            disabled={quickLoading}
                            className="px-4 py-2 rounded bg-green-500 text-white font-medium hover:bg-green-600 flex items-center gap-2"
                        >
                            {quickLoading && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>}
                            Registrar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}