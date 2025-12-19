// src/components/Dashboard.tsx
import { useState, useMemo } from "react";
import { useSales } from "../hooks/useSales";
import { useStoreSettings } from "../hooks/useStoreSettings";
import { ADMIN_EMAIL } from "../adminConfig";

import NewSaleForm from "./NewSaleForm";
import SalesTable from "./SalesTable";
import type { Sale } from "../types";
import PlaceholderIndicators from "./PlaceholderIndicators";
import Modal from "./Modal";
import NewClientForm from "./NewClientForm";
import { FaPlus, FaChartBar, FaSignOutAlt, FaUserPlus, FaSearch, FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaLayerGroup, FaCogs } from "react-icons/fa";
import ChartIndicators from "./ChartIndicators";
import Layout from "./Layout";
import type { NavKey } from "../types";
import CalendarConsentButton from "./CalendarConsentButton";
import ClientView from "./ClientView";
import AdminSettings from "./AdminSettings";
import type { Client } from "../types";
import PurchasesView from "./PurchasesView";

// 1. Importamos las utilidades de alerta
import { Toast, confirmAction } from "../utils/swal";

type TimeFilter = 'all' | 'daily' | 'weekly' | 'monthly';

export default function Dashboard({ user, onLogout }: { user: string; onLogout: () => void }) {
    const { sales, addSale, updateSale, deleteSale, clearAll } = useSales();
    const { permissions } = useStoreSettings();

    const isAdmin = user === ADMIN_EMAIL;

    const [showClientForm, setShowClientForm] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [showIndicators, setShowIndicators] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [editing, setEditing] = useState<Sale | null>(null);
    const [activeView, setActiveView] = useState<NavKey>("ventas");
    const [searchQuery, setSearchQuery] = useState('');
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
            Toast.fire({ icon: 'success', title: 'Venta guardada correctamente' }); // Feedback opcional
        } catch (err) {
            console.error("Error guardando:", err);
            Toast.fire({ icon: 'error', title: 'Error al guardar la venta' });
        }
    };

    const handleSectionChange = (k: NavKey) => {
        setActiveView(k);
    };

    const filteredSales = useMemo(() => {
        let timeFiltered = sales;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (timeFilter !== 'all') {
            timeFiltered = sales.filter(s => {
                const dateParts = s.dateService.split('T')[0].split('-');
                const sDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
                const sTime = sDate.getTime();

                if (timeFilter === 'daily') return sTime === today;
                if (timeFilter === 'weekly') {
                    const day = now.getDay() || 7;
                    if (day !== 1) now.setHours(-24 * (day - 1));
                    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                    const endOfWeek = startOfWeek + (6 * 24 * 60 * 60 * 1000);
                    return sTime >= startOfWeek && sTime <= endOfWeek;
                }
                if (timeFilter === 'monthly') return sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear();
                return true;
            });
        }

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
    }, [sales, searchQuery, timeFilter]);

    return (
        <Layout initial={activeView} onSectionChange={handleSectionChange} userEmail={user}>
            <div className="min-h-screen p-6 text-left" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>

                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2 font-serif text-gray-800">
                            Lorena Vera: Está en tus manos
                            {isAdmin && <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Modo Administrador</span>}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4"> {/* Aumentamos gap */}
                        {activeView === 'ventas' && (
                            <>
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowAdminPanel(true)}
                                        // ESTILO UNIFICADO: Botón circular blanco con sombra y hover de color
                                        className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-gray-700 shadow-sm border border-gray-100 hover:shadow-md hover:text-purple-600 hover:border-purple-200 transition-all hover:-translate-y-0.5"
                                        title="Panel de Administrador"
                                    >
                                        <FaCogs size={20} />
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowClientForm(true)}
                                    // ESTILO UNIFICADO (Color Ámbar/Amarillo)
                                    className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-amber-500 shadow-sm border border-gray-100 hover:shadow-md hover:text-amber-600 hover:border-amber-200 transition-all hover:-translate-y-0.5"
                                    title="Registrar cliente rápido"
                                >
                                    <FaUserPlus size={20} />
                                </button>

                                <button
                                    onClick={() => { setEditing(null); setShowForm(true); }}
                                    // ESTILO UNIFICADO (Color Verde)
                                    className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-green-500 shadow-sm border border-gray-100 hover:shadow-md hover:text-green-600 hover:border-green-200 transition-all hover:-translate-y-0.5"
                                    title="Registrar nueva cita"
                                >
                                    <FaPlus size={20} />
                                </button>

                                {(isAdmin || permissions.canSeeTotals) && (
                                    <button
                                        onClick={() => setShowIndicators(true)}
                                        // ESTILO UNIFICADO (Color Azul)
                                        className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-blue-500 shadow-sm border border-gray-100 hover:shadow-md hover:text-blue-600 hover:border-blue-200 transition-all hover:-translate-y-0.5"
                                        title="Ver indicadores"
                                    >
                                        <FaChartBar size={20} />
                                    </button>
                                )}

                                {isAdmin && <CalendarConsentButton />}
                            </>
                        )}

                        {/* Botón de Cerrar Sesión (Color Rojo/Rosa) */}
                        <button
                            onClick={() => onLogout()}
                            className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-rose-500 shadow-sm border border-gray-100 hover:shadow-md hover:text-rose-600 hover:border-rose-200 transition-all hover:-translate-y-0.5"
                            title="Cerrar sesión"
                        >
                            <FaSignOutAlt size={20} />
                        </button>
                    </div>
                </header>

                {/* Modales */}
                <Modal isOpen={showForm || !!editing} onClose={() => { setEditing(null); setShowForm(false); }}>
                    <NewSaleForm initial={editing ?? undefined} onSave={handleSave} onCancel={() => { setEditing(null); setShowForm(false); }} />
                </Modal>

                <Modal isOpen={showIndicators} onClose={() => setShowIndicators(false)}>
                    <ChartIndicators sales={sales} />
                </Modal>

                <Modal isOpen={showClientForm} onClose={() => { setShowClientForm(false); setEditingClient(null); }}>
                    <NewClientForm
                        initial={editingClient} // <--- Pasamos el cliente a editar
                        onCancel={() => { setShowClientForm(false); setEditingClient(null); }}
                        onSaved={() => {
                            setShowClientForm(false);
                            setEditingClient(null);
                            // El mensaje de éxito ya lo maneja NewClientForm internamente con swal
                        }}
                    />
                </Modal>

                <Modal isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} width="500px">
                    <AdminSettings />
                </Modal>

                {activeView === 'ventas' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <FaSearch className="h-5 w-5 text-gray-400" />
                                    </span>
                                    <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                                </div>

                                <div className="flex bg-white rounded-lg shadow-sm border overflow-hidden">
                                    <button onClick={() => setTimeFilter('daily')} className={`p-2 px-3 flex items-center gap-2 text-sm transition-colors ${timeFilter === 'daily' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`} title="Hoy"><FaCalendarDay /><span className="hidden xl:inline">Diario</span></button>
                                    <div className="w-[1px] bg-gray-200"></div>
                                    <button onClick={() => setTimeFilter('weekly')} className={`p-2 px-3 flex items-center gap-2 text-sm transition-colors ${timeFilter === 'weekly' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`} title="Esta semana"><FaCalendarWeek /><span className="hidden xl:inline">Semanal</span></button>
                                    <div className="w-[1px] bg-gray-200"></div>
                                    <button onClick={() => setTimeFilter('monthly')} className={`p-2 px-3 flex items-center gap-2 text-sm transition-colors ${timeFilter === 'monthly' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`} title="Este mes"><FaCalendarAlt /><span className="hidden xl:inline">Mensual</span></button>
                                    <div className="w-[1px] bg-gray-200"></div>
                                    <button onClick={() => setTimeFilter('all')} className={`p-2 px-3 flex items-center gap-2 text-sm transition-colors ${timeFilter === 'all' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`} title="Ver todo"><FaLayerGroup /><span className="hidden xl:inline">Todos</span></button>
                                </div>
                            </div>

                            <SalesTable
                                sales={filteredSales}
                                onEdit={(isAdmin || permissions.canEditSales) ? (s) => { setEditing(s); setShowForm(true); } : undefined}
                                onDelete={(isAdmin || permissions.canDeleteSales) ? deleteSale : undefined}
                            />
                        </div>

                        <div>
                            {(isAdmin || permissions.canSeeTotals) ? (
                                <>
                                    <PlaceholderIndicators sales={sales} />
                                    {isAdmin && (
                                        <div className="mt-4 bg-white rounded shadow p-4">
                                            <h4 className="font-medium mb-2">Acciones de Administrador</h4>
                                            {/* Confirmación drástica */}
                                            <button onClick={async () => {
                                                const confirmed = await confirmAction(
                                                    '¿ESTÁS SEGURO?',
                                                    'Esto borrará TODAS las ventas y clientes de la base de datos. ¡Es irreversible!',
                                                    'SÍ, BORRAR TODO'
                                                );
                                                if (confirmed) clearAll();
                                            }} className="px-3 py-2 bg-red-100 rounded w-full text-red-700 text-sm hover:bg-red-200 transition-colors">
                                                Borrar BD completa
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 p-6 text-center shadow-lg">
                                    <div className="mb-4 text-4xl">🔒</div>
                                    <h3 className="text-lg font-semibold text-gray-700">Vista de Empleado</h3>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Las estadísticas financieras están ocultas.
                                    </p>
                                    <p className="text-xs text-gray-400 mt-4">
                                        Solicita acceso al administrador si necesitas ver estos datos.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeView === 'clientes' && (
                    <ClientView
                        onEdit={(client) => {
                            setEditingClient(client); // Guardamos quién es
                            setShowClientForm(true);  // Abrimos el modal
                        }}
                    />
                )}

                {activeView === 'compras' && (
                    <PurchasesView />
                )}

            </div>
        </Layout>
    );
}