// src/components/SalesTable.tsx
import type { Sale } from '../types';
import { calcSubtotal, calcTotalNailer } from '../utils';
import { AnimatePresence, motion } from 'framer-motion';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function SalesTable({
    sales,
    onEdit,
    onDelete,
}: {
    sales: Sale[];
    onEdit: (s: Sale) => void;
    onDelete: (id: string) => void;
}) {
    if (!sales || sales.length === 0) {
        return <div className="bg-white p-4 rounded shadow">No hay ventas registradas aún.</div>;
    }

    const initials = (client: any) => {
        if (!client) return '';
        const parts = `${client.nombres ?? ''} ${client.apellidos ?? ''}`.trim().split(/\s+/);
        return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
    };

    return (
        <div className="bg-white rounded shadow p-4 overflow-auto">
            <h3 className="font-semibold mb-3">Ventas</h3>
            <table className="min-w-full text-sm border-collapse">
                <thead>
                    <tr className="text-left text-xs text-gray-600 border-b">
                        <th className="p-2">Fecha</th>
                        <th className="p-2">Nailer</th>
                        <th className="p-2">Servicio</th>
                        <th className="p-2">Cant.</th>
                        <th className="p-2">Precio U.</th>
                        <th className="p-2">Subtotal</th>
                        <th className="p-2">% Nailer</th>
                        <th className="p-2">Total Nailer</th>
                        <th className="p-2">Pago</th>
                        <th className="p-2">Ciudad</th>
                        <th className="p-2">Cliente</th>
                        <th className="p-2">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    <AnimatePresence>
                        {sales.map((s) => {
                            const subtotal = calcSubtotal(s);
                            const totalNailer = calcTotalNailer(s);

                            return (
                                <motion.tr
                                    key={s.id}
                                    layout
                                    initial={{ opacity: 1, x: 0 }}
                                    exit={{
                                        backgroundColor: 'rgba(255,0,0,0.8)',
                                        x: -200,
                                        opacity: 0
                                    }}
                                    transition={{ duration: 0.5 }}
                                    style={{ display: 'table-row' }}
                                    className="border-b last:border-b-0"
                                >
                                    <td className="p-2 align-top">{s.dateService}</td>
                                    <td className="p-2 align-top">{s.nailer}</td>

                                    {/* Servicio: title muestra descripción como burbuja */}
                                    <td className="p-2 align-top" title={s.description ?? ''}>
                                        {s.serviceType}
                                    </td>

                                    <td className="p-2 align-top">{s.quantity}</td>
                                    <td className="p-2 align-top">S/ {s.unitPrice.toFixed(2)}</td>
                                    <td className="p-2 align-top">S/ {subtotal.toFixed(2)}</td>
                                    <td className="p-2 align-top">{s.percentNailer}%</td>
                                    <td className="p-2 align-top">S/ {totalNailer.toFixed(2)}</td>
                                    <td className="p-2 align-top">{s.paymentMethod}</td>
                                    <td className="p-2 align-top">{s.city}</td>

                                    {/* Cliente: badge con iniciales; title muestra nombre y DNI */}
                                    <td className="p-2 align-top">
                                        {(s as any).client ? (
                                            <div className="inline-flex items-center gap-2">
                                                <div
                                                    title={`${(s as any).client.nombres ?? ''} ${(s as any).client.apellidos ?? ''} — DNI: ${(s as any).client.dni ?? ''}`}
                                                    className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium"
                                                    style={{ backgroundColor: '#FFF4D9', color: '#F7C948', border: '1px solid rgba(250,204,21,0.12)' }}
                                                >
                                                    {initials((s as any).client)}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </td>

                                    <td className="p-2 align-top">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => onEdit(s)}
                                                title="Editar venta"
                                                className="btn-icon bg-yellow-100 text-yellow-800 p-2 rounded-full transition-transform hover:scale-110"
                                            >
                                                <FaEdit size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('¿Eliminar esta venta?')) onDelete(s.id);
                                                }}
                                                title="Eliminar venta"
                                                className="btn-icon bg-red-100 text-red-800 p-2 rounded-full transition-transform hover:scale-110"
                                            >
                                                <FaTrash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
}