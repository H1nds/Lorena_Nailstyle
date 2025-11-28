// src/components/Dashboard.tsx
import { useState, useMemo } from "react";
import { useSales } from "../hooks/useSales";
import NewSaleForm from "./NewSaleForm";
import SalesTable from "./SalesTable";
import type { Sale } from "../types";
import PlaceholderIndicators from "./PlaceholderIndicators";
import Modal from "./Modal";
import NewClientForm from "./NewClientForm";
import { FaPlus, FaChartBar, FaSignOutAlt, FaUserPlus, FaSearch, FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaLayerGroup } from "react-icons/fa";
import ChartIndicators from "./ChartIndicators";
import Layout from "./Layout";
import type { NavKey } from "./Sidebar";
import CalendarConsentButton from "./CalendarConsentButton";
import ClientView from "./ClientView";

// Definimos el tipo para el filtro de tiempo
type TimeFilter = 'all' | 'daily' | 'weekly' | 'monthly';

export default function Dashboard({ user, onLogout }: { user: string; onLogout: () => void }) {
    const [showIndicators, setShowIndicators] = useState(false);
    const { sales, addSale, updateSale, deleteSale, clearAll } = useSales();
    const [showForm, setShowForm] = useState(false);
    const [showClientForm, setShowClientForm] = useState(false);
    const [editing, setEditing] = useState<Sale | null>(null);
    const [activeView, setActiveView] = useState<NavKey>("ventas");
    const [searchQuery, setSearchQuery] = useState('');

    // --- 1. NUEVO ESTADO PARA EL FILTRO DE TIEMPO ---
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

    const handleSave = async (s: Sale) => {
        try {
            if (editing) {
                await updateSale(s);
                setEditing(null);
            } else {
                await addSale(s);
            }
            setShowForm(false);
        } catch (err) {
            console.error("Error guardando la venta:", err);
            alert("Ocurrió un error al guardar la venta. Revisa la consola.");
        }
    };

    const handleSectionChange = (k: NavKey) => {
        setActiveView(k);
    };

    // --- 2. LÓGICA DE FILTRADO ACTUALIZADA ---
    const filteredSales = useMemo(() => {
        // A. Primero filtramos por tiempo
        let timeFiltered = sales;
        const now = new Date();
        // Reseteamos horas para comparar solo fechas
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (timeFilter !== 'all') {
            timeFiltered = sales.filter(s => {
                // Asumimos que dateService es YYYY-MM-DD o ISO string
                const dateParts = s.dateService.split('T')[0].split('-');
                const sDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
                const sTime = sDate.getTime();

                if (timeFilter === 'daily') {
                    return sTime === today;
                }
                if (timeFilter === 'weekly') {
                    // Calculamos el inicio de la semana (Lunes)
                    const day = now.getDay() || 7; // Hacer que domingo sea 7
                    if (day !== 1) now.setHours(-24 * (day - 1));
                    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                    // Fin de semana
                    const endOfWeek = startOfWeek + (6 * 24 * 60 * 60 * 1000);
                    return sTime >= startOfWeek && sTime <= endOfWeek;
                }
                if (timeFilter === 'monthly') {
                    return sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear();
                }
                return true;
            });
        }

        // B. Luego aplicamos la búsqueda de texto sobre los resultados de tiempo
        const query = searchQuery.trim().toLowerCase();
        if (!query) return timeFiltered;

        return timeFiltered.filter(sale => {
            const client = (sale as any).client;
            const clientName = client ? `${client.nombres} ${client.apellidos}` : '';
            return (
                sale.nailer.toLowerCase().includes(query) ||
                sale.serviceType.toLowerCase().includes(query) ||
                sale.paymentMethod.toLowerCase().includes(query) ||
                sale.city.toLowerCase().includes(query) ||
                sale.dateService.includes(query) ||
                clientName.toLowerCase().includes(query)
            );
        });
    }, [sales, searchQuery, timeFilter]); // Se recalcula si cambia el filtro


    return (
        <Layout initial="ventas" onSectionChange={handleSectionChange} userEmail={user}>
            <div className="min-h-screen p-6 text-left" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>

                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Lorena Vera: Está en tus manos</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {activeView === 'ventas' && (
                            <>
                                <button
                                    onClick={() => setShowClientForm(true)}
                                    className="flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-110 focus:outline-none"
                                    title="Registrar cliente"
                                    style={{ backgroundColor: "#FFF4D9", border: "1px solid rgba(250,204,21,0.12)" }}
                                >
                                    <FaUserPlus size={16} color="#F7C948" />
                                </button>

                                <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-icon bg-green-100 text-green-800 p-2 rounded-full" title="Registrar nueva venta" style={{ backgroundColor: "var(--accent-green)" }}>
                                    <FaPlus size={18} />
                                </button>

                                <button onClick={() => setShowIndicators(true)} className="btn-icon bg-blue-100 text-blue-800 p-2 rounded-full" title="Ver indicadores" style={{ backgroundColor: "var(--accent-blue)" }}>
                                    <FaChartBar size={18} />
                                </button>

                                <CalendarConsentButton />
                            </>
                        )}

                        <button onClick={() => onLogout()} className="btn-icon bg-pink-100 text-pink-800 p-2 rounded-full" title="Cerrar sesión" style={{ backgroundColor: "var(--accent-pink)" }}>
                            <FaSignOutAlt size={18} />
                        </button>
                    </div>
                </header>

                <Modal isOpen={showForm || !!editing} onClose={() => { setEditing(null); setShowForm(false); }}>
                    <NewSaleForm initial={editing ?? undefined} onSave={handleSave} onCancel={() => { setEditing(null); setShowForm(false); }} />
                </Modal>
                <Modal isOpen={showIndicators} onClose={() => setShowIndicators(false)}>
                    <ChartIndicators sales={sales} />
                </Modal>
                <Modal isOpen={showClientForm} onClose={() => setShowClientForm(false)}>
                    <NewClientForm onSaved={() => { setShowClientForm(false); alert("Cliente registrado correctamente"); }} />
                </Modal>

                {activeView === 'ventas' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">

                            {/* --- 3. BARRA DE HERRAMIENTAS (BUSCADOR + FILTROS) --- */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Buscador (ahora ocupa el espacio restante) */}
                                <div className="relative flex-1">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <FaSearch className="h-5 w-5 text-gray-400" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    />
                                </div>

                                {/* Botones de filtro temporal */}
                                <div className="flex bg-white rounded-lg shadow-sm border overflow-hidden">
                                    <button
                                        onClick={() => setTimeFilter('daily')}
                                        className={`p-2 px-3 flex items-center gap-2 text-sm transition-colors ${timeFilter === 'daily' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                        title="Hoy"
                                    >
                                        <FaCalendarDay /> <span className="hidden xl:inline">Diario</span>
                                    </button>
                                    <div className="w-[1px] bg-gray-200"></div>
                                    <button
                                        onClick={() => setTimeFilter('weekly')}
                                        className={`p-2 px-3 flex items-center gap-2 text-sm transition-colors ${timeFilter === 'weekly' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                        title="Esta semana"
                                    >
                                        <FaCalendarWeek /> <span className="hidden xl:inline">Semanal</span>
                                    </button>
                                    <div className="w-[1px] bg-gray-200"></div>
                                    <button
                                        onClick={() => setTimeFilter('monthly')}
                                        className={`p-2 px-3 flex items-center gap-2 text-sm transition-colors ${timeFilter === 'monthly' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                        title="Este mes"
                                    >
                                        <FaCalendarAlt /> <span className="hidden xl:inline">Mensual</span>
                                    </button>
                                    <div className="w-[1px] bg-gray-200"></div>
                                    <button
                                        onClick={() => setTimeFilter('all')}
                                        className={`p-2 px-3 flex items-center gap-2 text-sm transition-colors ${timeFilter === 'all' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                        title="Ver todo"
                                    >
                                        <FaLayerGroup /> <span className="hidden xl:inline">Todos</span>
                                    </button>
                                </div>
                            </div>

                            <SalesTable
                                sales={filteredSales}
                                onEdit={(s) => { setEditing(s); setShowForm(true); }}
                                onDelete={deleteSale}
                            />
                        </div>

                        <div>
                            <PlaceholderIndicators sales={sales} />
                            <div className="mt-4 bg-white rounded shadow p-4">
                                <h4 className="font-medium mb-2">Acciones</h4>
                                <button onClick={() => { if (confirm("Eliminar TODO el historial?")) clearAll(); }} className="px-3 py-2 bg-red-100 rounded">Borrar todo</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'clientes' && (
                    <ClientView />
                )}

                {activeView === 'compras' && (
                    <div className="bg-white rounded shadow p-4">
                        <h3 className="font-semibold mb-3">Registro de Compras</h3>
                        <p>Esta sección estará disponible próximamente.</p>
                    </div>
                )}

            </div>
        </Layout>
    );
}