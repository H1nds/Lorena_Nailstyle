// src/components/Dashboard.tsx
import { useState, useMemo } from "react";
import { useSales } from "../hooks/useSales";
import NewSaleForm from "./NewSaleForm";
import SalesTable from "./SalesTable";
import type { Sale } from "../types";
import PlaceholderIndicators from "./PlaceholderIndicators";
import Modal from "./Modal";
import NewClientForm from "./NewClientForm";
import { FaPlus, FaChartBar, FaSignOutAlt, FaUserPlus, FaSearch } from "react-icons/fa";
import ChartIndicators from "./ChartIndicators";
import Layout from "./Layout";
import type { NavKey } from "./Sidebar";
import CalendarConsentButton from "./CalendarConsentButton";
import ClientView from "./ClientView";

export default function Dashboard({ user, onLogout }: { user: string; onLogout: () => void }) {
    const [showIndicators, setShowIndicators] = useState(false);
    const { sales, addSale, updateSale, deleteSale, clearAll } = useSales();
    const [showForm, setShowForm] = useState(false);
    const [showClientForm, setShowClientForm] = useState(false);
    const [editing, setEditing] = useState<Sale | null>(null);
    const [activeView, setActiveView] = useState<NavKey>("ventas");
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredSales = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return sales;
        }
        return sales.filter(sale => {
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
    }, [sales, searchQuery]);


    return (
        <Layout initial="ventas" onSectionChange={handleSectionChange} userEmail={user}>
            <div className="min-h-screen p-6 text-left" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>

                {/* --- 1. AQUÍ ESTÁ EL HEADER (LOS BOTONES) DE VUELTA --- */}
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Lorena Vera: Está en tus manos</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Botones que solo aparecen en la vista de "ventas" */}
                        {activeView === 'ventas' && (
                            <>
                                <button
                                    onClick={() => setShowClientForm(true)}
                                    className="flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-110 focus:outline-none"
                                    title="Registrar cliente"
                                    aria-label="Registrar cliente"
                                    style={{
                                        backgroundColor: "#FFF4D9",
                                        border: "1px solid rgba(250,204,21,0.12)",
                                    }}
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

                        {/* Botón de Logout (siempre visible) */}
                        <button onClick={() => onLogout()} className="btn-icon bg-pink-100 text-pink-800 p-2 rounded-full" title="Cerrar sesión" style={{ backgroundColor: "var(--accent-pink)" }}>
                            <FaSignOutAlt size={18} />
                        </button>
                    </div>
                </header>

                {/* --- Modales (Sin cambios) --- */}
                <Modal isOpen={showForm || !!editing} onClose={() => { setEditing(null); setShowForm(false); }}>
                    <NewSaleForm initial={editing ?? undefined} onSave={handleSave} onCancel={() => { setEditing(null); setShowForm(false); }} />
                </Modal>
                <Modal isOpen={showIndicators} onClose={() => setShowIndicators(false)}>
                    <ChartIndicators sales={sales} />
                </Modal>
                <Modal isOpen={showClientForm} onClose={() => setShowClientForm(false)}>
                    <NewClientForm onSaved={() => { setShowClientForm(false); alert("Cliente registrado correctamente"); }} />
                </Modal>


                {/* --- Vistas dinámicas --- */}

                {activeView === 'ventas' && (
                    // --- 2. ELIMINAMOS EL FRAGMENT <> Y USAMOS EL GRID DIRECTAMENTE ---
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* --- 3. ESTA ES LA COLUMNA DE LA TABLA (2/3) --- */}
                        <div className="lg:col-span-2 space-y-4"> {/* space-y-4 añade espacio entre buscador y tabla */}

                            {/* --- 4. MOVIMOS EL BUSCADOR AQUÍ DENTRO --- */}
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FaSearch className="h-5 w-5 text-gray-400" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar por nailer, servicio, cliente, fecha (YYYY-MM-DD)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                />
                            </div>

                            {/* La tabla va justo después, en la misma columna */}
                            <SalesTable
                                sales={filteredSales}
                                onEdit={(s) => { setEditing(s); setShowForm(true); }}
                                onDelete={deleteSale}
                            />
                        </div>

                        {/* Esta es la columna de indicadores (1/3) */}
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