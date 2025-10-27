import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Sale } from '../types';
import { uid } from '../utils';
import { FaTimes, FaSave, FaSearch } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

type PartialClient = { id?: string; dni?: string; nombres?: string; apellidos?: string };

const TYPES = ["Esmaltado en gel permanente", "Bio builder gel", "Poligel", "Gel", "Acrilicas con tips", "Acrilicas esculpidas", "Manicura tradicional", "Pedicura tradicional",
    "Pedicura de esmaltado en gel permanente"];
const PRE_NAILERS = ['Ericka', 'Nicole', 'Lorena', 'Maria', 'David', 'Laura', 'Hellen'];
const PRE_SERVICES = Array.from({ length: 30 }).map((_, i) => `Servicio ${i + 1} - ${TYPES[i % TYPES.length]}`);
const PRE_CITIES = ['Moquegua', 'Lima'];
const PAYMENT_METHODS = ['Efectivo', 'Yape', 'Plin', 'Transferencia BCP', 'Transferencia Interbank', 'Transferencia Scotiabank', 'Transferencia Caja Arequipa',
    'Pos Tarjeta', 'Pos QR'];

type Props = {
    onSave: (s: Sale) => void;
    onCancel?: () => void;
    initial?: Sale | null;
};

export default function NewSaleForm({ onSave, onCancel, initial = null }: Props) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const focusRef = useRef<HTMLDivElement | null>(null);

    const [dateService, setDateService] = useState(initial ? initial.dateService : new Date().toISOString().slice(0, 10));
    const [nailer, setNailer] = useState(initial ? initial.nailer : PRE_NAILERS[0]);
    const [serviceType, setServiceType] = useState(initial ? initial.serviceType : PRE_SERVICES[0]);
    const [serviceQuery, setServiceQuery] = useState('');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [quantity, setQuantity] = useState<number>(initial ? initial.quantity : 1);
    const [unitPrice, setUnitPrice] = useState<number>(initial ? initial.unitPrice : 50);
    const [paymentMethod, setPaymentMethod] = useState(initial ? initial.paymentMethod : PAYMENT_METHODS[0]);
    const [percentNailer, _setPercentNailer] = useState<number>(initial ? (initial as any).percentNailer ?? 5 : 5);
    const [city, setCity] = useState(initial ? initial.city : PRE_CITIES[0]);
    const [err, setErr] = useState('');

    const initialClient = (initial as any)?.client as PartialClient | undefined;
    const [clientDni, setClientDni] = useState(initialClient?.dni ?? '');
    const [clientName, setClientName] = useState(initialClient ? `${initialClient.nombres ?? ''} ${initialClient.apellidos ?? ''}` : '');
    const [clientId, setClientId] = useState<string | null>(initialClient?.id ?? null);
    const [clientSearching, setClientSearching] = useState(false);

    const filteredServices = useMemo(() => {
        const q = serviceQuery.trim().toLowerCase();
        if (!q) return PRE_SERVICES.slice(0, 9);
        return PRE_SERVICES.filter(s => s.toLowerCase().includes(q)).slice(0, 20);
    }, [serviceQuery]);

    const buscarClienteEnDB = async (dni: string) => {
        const clean = dni.trim();
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
            } else {
                setClientId(null);
                setClientName('');
            }
        } catch (e) {
            console.error('Error buscando cliente en DB:', e);
            setClientId(null);
            setClientName('');
        } finally {
            setClientSearching(false);
        }
    };

    useEffect(() => {
        if (clientDni.trim().length === 8) buscarClienteEnDB(clientDni);
    }, [clientDni]);

    useEffect(() => {
        // focus the form container so wheel events target it immediately in some browsers
        focusRef.current?.focus();
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!serviceType) return setErr('Selecciona un tipo de servicio');
        if (quantity <= 0) return setErr('Cantidad debe ser mayor a 0');
        if (unitPrice < 0) return setErr('Precio inválido');

        const sale: Sale & { client?: any } = {
            id: initial ? initial.id : uid('s_'),
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
            client: clientId ? { id: clientId, dni: clientDni, nombres: clientName.split(' ')[0] ?? '', apellidos: clientName.split(' ').slice(1).join(' ') ?? '' } : undefined
        };
        onSave(sale as Sale);
    };

    return (
        <div
            ref={rootRef}
            className="bg-[var(--bg-main)] text-[var(--text-main)] rounded-xl shadow-lg w-full"
            style={{
                borderRadius: 14,
                padding: 0,
                // allow modal to control vertical scrolling: no overflow on this root
            }}
        >
            {/* Focus wrapper: helps wheel / focus behavior */}
            <div ref={focusRef} tabIndex={-1} style={{ outline: "none", padding: 18 }}>
                <h3 className="text-lg font-semibold bg-[var(--accent-pink)] text-white px-6 py-3 -mx-6 mb-4 rounded-t-xl">{initial ? 'Editar venta' : 'Registrar nueva venta'}</h3>

                <form onSubmit={submit} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex flex-col">
                            Fecha del servicio
                            <input type="date" value={dateService} onChange={(e) => setDateService(e.target.value)} className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                        <label className="flex flex-col">
                            Nailer
                            <select value={nailer} onChange={(e) => setNailer(e.target.value)} className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200">
                                {PRE_NAILERS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex flex-col">
                            Cliente (DNI)
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
                                    aria-label="Buscar cliente"
                                    style={{
                                        backgroundColor: "var(--accent-soft, #E6F6FF)",
                                        border: "1px solid rgba(59,130,246,0.08)"
                                    }}
                                >
                                    {clientSearching ? (
                                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="10" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4" />
                                        </svg>
                                    ) : (
                                        <FaSearch size={15} color="var(--accent-blue, #2563EB)" />
                                    )}
                                </button>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{clientId ? `Cliente: ${clientName}` : clientDni.length === 8 ? 'Cliente no encontrado' : 'Introduce DNI'}</div>
                        </label>

                        <label className="flex flex-col">
                            Método de pago
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200">
                                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </label>
                    </div>

                    <div>
                        <label className="block">Tipo de servicio (buscable)</label>
                        <input className="w-full p-2 border rounded mt-1 mb-2" placeholder="Busca por nombre..." value={serviceQuery} onChange={(e) => setServiceQuery(e.target.value)} />
                        <div className="max-h-36 overflow-auto border rounded">
                            {filteredServices.map(s => (
                                <div key={s} onClick={() => { setServiceType(s); setServiceQuery(''); }} className={`p-2 hover:bg-gray-50 cursor-pointer ${serviceType === s ? 'font-semibold bg-gray-50' : ''}`}>
                                    {s}
                                </div>
                            ))}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Seleccionado: <span className="font-medium">{serviceType}</span></div>
                    </div>

                    <label className="flex flex-col">
                        Descripción
                        <textarea className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </label>

                    <div className="grid grid-cols-3 gap-3">
                        <label className="flex flex-col">
                            Cantidad
                            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                        <label className="flex flex-col">
                            Cuota unitaria (S/.)
                            <input type="number" min={0} step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                        <label className="flex flex-col">
                            Ciudad
                            <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200">
                                {PRE_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </label>
                    </div>

                    {err && <div className="text-red-500 text-sm">{err}</div>}

                    <div className="flex gap-3 justify-end">
                        {onCancel && (
                            <button
                                type="button"
                                className="btn-icon bg-purple-100 text-purple-800 p-2 rounded-full"
                                onClick={onCancel}
                                title="Cancelar edición"
                                style={{ backgroundColor: "var(--accent-purple)" }}
                            >
                                <FaTimes size={16} />
                            </button>
                        )}
                        <button
                            type="submit"
                            className="btn-icon text-white p-2 rounded-full"
                            title={initial ? "Guardar cambios" : "Registrar venta"}
                            style={{
                                backgroundColor: "var(--accent-blue)",
                            }}
                        >
                            <FaSave size={16} />
                        </button>
                    </div>

                    <div className="text-xs text-gray-500">
                        Nota: <strong>subtotal</strong> y <strong>total del nailer</strong> se calculan y se muestran en la tabla.
                    </div>
                </form>
            </div>
        </div>
    );
}
