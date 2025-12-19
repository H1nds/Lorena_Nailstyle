// src/components/PurchasesView.tsx
import { useState, useMemo } from "react";
import { usePurchases } from "../hooks/usePurchases";
import { useStoreSettings } from '../hooks/useStoreSettings'; // <--- Seguridad
import { auth } from '../firebase'; // <--- Seguridad
import { ADMIN_EMAIL } from '../adminConfig'; // <--- Seguridad
import { FaSearch, FaPlus, FaFilter, FaEdit, FaTrash, FaShoppingBag } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import type { Purchase } from "../types";
import { confirmAction, Toast } from "../utils/swal";
import Modal from "./Modal";
import NewPurchaseForm from "./NewPurchaseForm";

type TimeRange = "week" | "month" | "year" | "all";

export default function PurchasesView() {
    const { purchases, addPurchase, updatePurchase, deletePurchase } = usePurchases();
    const { permissions } = useStoreSettings(); // Leemos permisos

    // Lógica de Seguridad: ¿Puede borrar compras?
    const canDelete = auth.currentUser?.email === ADMIN_EMAIL || permissions.canDeletePurchases;

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Purchase | null>(null);

    const [search, setSearch] = useState("");
    const [timeRange, setTimeRange] = useState<TimeRange>("month");
    const [catFilter, setCatFilter] = useState("Todas");

    const filteredPurchases = useMemo(() => {
        const now = new Date();
        const query = search.toLowerCase();

        return purchases.filter(p => {
            const pDate = new Date(p.date + "T00:00:00");

            let passTime = true;
            if (timeRange === "week") {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                passTime = pDate >= oneWeekAgo;
            } else if (timeRange === "month") {
                passTime = pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
            } else if (timeRange === "year") {
                passTime = pDate.getFullYear() === now.getFullYear();
            }

            const passCat = catFilter === "Todas" || p.category === catFilter;

            const passSearch =
                p.productName.toLowerCase().includes(query) ||
                p.supplier.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query);

            return passTime && passCat && passSearch;
        });
    }, [purchases, search, timeRange, catFilter]);

    const totalSpent = filteredPurchases.reduce((acc, curr) => acc + curr.totalPrice, 0);

    const handleSave = async (data: any) => {
        try {
            if (editing) {
                await updatePurchase({ ...editing, ...data });
                Toast.fire({ icon: 'success', title: 'Compra actualizada' });
            } else {
                await addPurchase(data);
                Toast.fire({ icon: 'success', title: 'Compra registrada' });
            }
            setShowModal(false);
            setEditing(null);
        } catch (e) {
            console.error("ERROR REAL:", e);
            Toast.fire({ icon: 'error', title: 'Error al guardar' });
        }
    };

    const handleDelete = async (id: string) => {
        if (await confirmAction("¿Eliminar registro?", "Esto afectará el cálculo de gastos.")) {
            deletePurchase(id);
            Toast.fire({ icon: 'success', title: 'Eliminado' });
        }
    };

    const uniqueCats = Array.from(new Set(purchases.map(p => p.category)));

    return (
        <div className="glass-panel rounded-[2.5rem] p-8 min-h-[80vh]">

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-bold font-serif text-gray-800">Registro de Compras</h2>
                    <p className="text-gray-500 text-sm mt-1">Administra inventario y gastos operativos</p>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-2xl shadow-lg shadow-purple-200 flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest opacity-80 font-bold">Gasto Total ({timeRange})</span>
                    <span className="text-2xl font-bold font-mono">S/. {totalSpent.toFixed(2)}</span>
                </div>

                <button
                    onClick={() => { setEditing(null); setShowModal(true); }}
                    className="w-12 h-12 rounded-full bg-white text-purple-600 shadow-md border border-purple-100 hover:shadow-lg hover:bg-purple-50 transition-all flex items-center justify-center hover:-translate-y-1"
                    title="Nueva Compra"
                >
                    <FaPlus size={20} />
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-white/50 p-4 rounded-2xl border border-white shadow-sm">

                <div className="relative flex-1">
                    <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                        placeholder="Buscar producto, proveedor..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-purple-300 outline-none text-sm"
                    />
                </div>

                <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {[
                        { k: 'week', l: 'Semana' },
                        { k: 'month', l: 'Mes' },
                        { k: 'year', l: 'Año' },
                        { k: 'all', l: 'Todo' }
                    ].map((opt) => (
                        <button
                            key={opt.k}
                            onClick={() => setTimeRange(opt.k as TimeRange)}
                            className={`px-4 py-2 text-sm font-medium transition-colors border-r last:border-r-0 border-gray-100 ${timeRange === opt.k ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {opt.l}
                        </button>
                    ))}
                </div>

                <div className="relative min-w-[200px]">
                    <FaFilter className="absolute left-3 top-3.5 text-gray-400 text-xs" />
                    <select
                        value={catFilter}
                        onChange={e => setCatFilter(e.target.value)}
                        className="w-full pl-8 pr-8 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-purple-300 outline-none text-sm appearance-none cursor-pointer"
                    >
                        <option value="Todas">Todas las Categorías</option>
                        {uniqueCats.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-left text-gray-400 text-xs uppercase tracking-wider pl-4">
                            <th className="pl-4 pb-2">Fecha</th>
                            <th className="pb-2">Producto</th>
                            <th className="pb-2">Categoría</th>
                            <th className="pb-2 text-center">Cant.</th>
                            <th className="pb-2 text-right">Total</th>
                            <th className="pb-2 pl-4">Proveedor</th>
                            <th className="pr-4 pb-2 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredPurchases.map((p, i) => (
                                <motion.tr
                                    key={p.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card-hover group bg-white/60 hover:bg-white"
                                >
                                    <td className="p-4 pl-4 rounded-l-2xl font-mono text-gray-500">
                                        {p.date}
                                    </td>
                                    <td className="p-4 font-bold text-gray-700">
                                        {p.productName}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${p.category.includes("Servicios") ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                                                p.category.includes("Insumos") ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                    "bg-purple-50 text-purple-600 border-purple-200"
                                            }`}>
                                            {p.category.split(" ")[0]}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center font-medium text-gray-600">
                                        {p.quantity}
                                    </td>
                                    <td className="p-4 text-right font-bold text-gray-800 font-mono">
                                        S/. {p.totalPrice.toFixed(2)}
                                    </td>
                                    <td className="p-4 pl-4 text-gray-500 text-xs italic">
                                        {p.supplier || "-"}
                                    </td>
                                    <td className="p-4 pr-4 rounded-r-2xl text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditing(p); setShowModal(true); }} className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-colors"><FaEdit /></button>

                                            {/* SEGURIDAD: Botón de borrar condicional */}
                                            {canDelete && (
                                                <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"><FaTrash /></button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>

                {filteredPurchases.length === 0 && (
                    <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-4">
                        <FaShoppingBag size={48} className="opacity-20" />
                        <p>No se encontraron compras en este periodo.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <NewPurchaseForm
                    initial={editing}
                    onCancel={() => setShowModal(false)}
                    onSave={handleSave}
                />
            </Modal>
        </div>
    );
}