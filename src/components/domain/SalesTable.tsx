// src/components/SalesTable.tsx
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash, FaCreditCard, FaMoneyBillWave, FaMobileAlt } from "react-icons/fa";
import type { Sale } from '@/types';
import { calcSubtotal } from '@/utils';
import { confirmAction } from '@/utils/swal';

type Props = {
    sales: Sale[];
    onEdit?: (s: Sale) => void;
    onDelete?: (id: string) => void;
};

// Función auxiliar para iconos de pago
const getPaymentIcon = (method: string) => {
    const m = method.toLowerCase();
    if (m.includes('efectivo')) return <FaMoneyBillWave className="text-green-500" />;
    if (m.includes('tarjeta')) return <FaCreditCard className="text-babyblue-500" />;
    return <FaMobileAlt className="text-babyblue-500" />;
};

export default function SalesTable({ sales, onEdit, onDelete }: Props) {

    const handleDelete = async (id: string) => {
        if (!onDelete) return;
        const isConfirmed = await confirmAction('¿Eliminar venta?', 'Esta acción no se puede deshacer.');
        if (isConfirmed) onDelete(id);
    };

    if (sales.length === 0) {
        return (
            <div className="glass-panel rounded-3xl p-12 text-center text-gray-400">
                <p className="text-lg">No hay ventas registradas aún ✨</p>
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-[2rem] p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-2xl font-bold text-gray-800 font-serif">Registro de Ventas</h3>
                <span className="text-xs font-bold px-3 py-1 bg-babyblue-100 text-babyblue-600 rounded-full tracking-wider uppercase">
                    {sales.length} Registros
                </span>
            </div>

            <div className="overflow-x-auto">
                {/* Vista Escritorio (Tabla) */}
                <table className="hidden lg:table min-w-full text-sm border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-left text-gray-400 text-xs uppercase tracking-wider">
                            <th className="pl-4 pb-2">Fecha</th>
                            <th className="pb-2">Servicio</th>
                            <th className="pb-2 text-center">Cant.</th>
                            <th className="pb-2 text-right">Monto</th>
                            <th className="pb-2 pl-4">Pago</th>
                            <th className="pb-2">Cliente</th>
                            {(onEdit || onDelete) && <th className="pr-4 pb-2 text-right">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {sales.map((sale, index) => {
                                const subtotal = calcSubtotal(sale);
                                const clientData = (sale as any).client;

                                return (
                                    <motion.tr
                                        key={sale.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white/40 hover:bg-white hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group rounded-xl"
                                    >
                                        {/* Fecha con estilo calendario */}
                                        <td className="p-3 pl-4 rounded-l-xl">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700 text-base">
                                                    {new Date(sale.dateService).getDate()}
                                                </span>
                                                <span className="text-[10px] uppercase text-gray-400 font-bold">
                                                    {new Date(sale.dateService).toLocaleString('es-ES', { month: 'short' })}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-3 text-gray-600 font-medium max-w-[200px] truncate">
                                            {sale.serviceType.split('-')[1] || sale.serviceType}
                                        </td>

                                        <td className="p-3 text-center">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">
                                                x{sale.quantity}
                                            </span>
                                        </td>

                                        <td className="p-3 text-right">
                                            <div className="font-bold text-gray-800 text-base">S/ {subtotal.toFixed(2)}</div>
                                        </td>

                                        {/* Badge de Pago */}
                                        <td className="p-3 pl-4">
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 shadow-sm w-fit">
                                                {getPaymentIcon(sale.paymentMethod)}
                                                <span className="text-xs font-medium text-gray-600">{sale.paymentMethod}</span>
                                            </div>
                                        </td>

                                        {/* Cliente */}
                                        <td className="p-3">
                                            {clientData ? (
                                                <span className="text-sm text-gray-700 hover:text-babyblue-600 transition-colors cursor-pointer font-medium">
                                                    {clientData.nombres.split(' ')[0]} {clientData.apellidos.split(' ')[0]}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 text-xs italic">Anónimo</span>
                                            )}
                                        </td>

                                        {(onEdit || onDelete) && (
                                            <td className="p-3 pr-4 rounded-r-xl text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {onEdit && (
                                                        <button onClick={() => onEdit(sale)} className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors" title="Editar">
                                                            <FaEdit size={14} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button onClick={() => handleDelete(sale.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Eliminar">
                                                            <FaTrash size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>

                {/* Vista Móvil (Tarjetas) */}
                <div className="lg:hidden flex flex-col gap-4 mt-2 pb-4">
                    <AnimatePresence>
                        {sales.map((sale, index) => {
                            const subtotal = calcSubtotal(sale);
                            const clientData = (sale as any).client;

                            return (
                                <motion.div
                                    key={sale.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white/60 backdrop-blur-sm border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-col gap-3 relative"
                                >
                                    <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2 min-w-[50px]">
                                                <span className="font-bold text-gray-700 text-lg leading-none">
                                                    {new Date(sale.dateService).getDate()}
                                                </span>
                                                <span className="text-[10px] uppercase text-gray-400 font-bold leading-none mt-1">
                                                    {new Date(sale.dateService).toLocaleString('es-ES', { month: 'short' })}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 text-base">{clientData ? `${clientData.nombres.split(' ')[0]} ${clientData.apellidos.split(' ')[0]}` : 'Anónimo'}</div>
                                                <div className="text-sm text-gray-500 font-medium truncate max-w-[150px]">{sale.serviceType.split('-')[1] || sale.serviceType} <span className="text-xs bg-gray-100 px-1.5 rounded-md ml-1 text-gray-600">x{sale.quantity}</span></div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-800 text-lg">S/ {subtotal.toFixed(2)}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-100 shadow-sm">
                                                {getPaymentIcon(sale.paymentMethod)}
                                                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{sale.paymentMethod}</span>
                                            </div>
                                        </div>
                                        
                                        {(onEdit || onDelete) && (
                                            <div className="flex gap-2">
                                                {onEdit && (
                                                    <button onClick={() => onEdit(sale)} className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-50 text-yellow-600 border border-yellow-100" title="Editar">
                                                        <FaEdit size={14} />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button onClick={() => handleDelete(sale.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-100" title="Eliminar">
                                                        <FaTrash size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}