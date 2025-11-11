// src/components/Dashboard.tsx
import { useState } from "react";

import { useSales } from "../hooks/useSales";
import NewSaleForm from "./NewSaleForm";
import SalesTable from "./SalesTable";
import type { Sale } from "../types";
import PlaceholderIndicators from "./PlaceholderIndicators";
import Modal from "./Modal";
import NewClientForm from "./NewClientForm";

import { FaPlus, FaChartBar, FaSignOutAlt, FaUserPlus } from "react-icons/fa";
import ChartIndicators from "./ChartIndicators";

import Layout from "./Layout";
import type { NavKey } from "./Sidebar";
import CalendarConsentButton from "./CalendarConsentButton";

export default function Dashboard({ user, onLogout }: { user: string; onLogout: () => void }) {
    const [showIndicators, setShowIndicators] = useState(false);
    const { sales, addSale, updateSale, deleteSale, clearAll } = useSales();
    const [showForm, setShowForm] = useState(false);
    const [showClientForm, setShowClientForm] = useState(false);
    const [editing, setEditing] = useState<Sale | null>(null);

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
        console.log("Navegar a:", k);
    };

    return (
        <Layout initial="ventas" onSectionChange={handleSectionChange} userEmail={user}>
            <div className="min-h-screen p-6 text-left" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Lorena Vera: Está en tus manos</h2>
                    </div>

                    <div className="flex items-center gap-3">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <SalesTable sales={sales} onEdit={(s) => { setEditing(s); setShowForm(true); }} onDelete={deleteSale} />
                    </div>
                    <div>
                        <PlaceholderIndicators sales={sales} />
                        <div className="mt-4 bg-white rounded shadow p-4">
                            <h4 className="font-medium mb-2">Acciones</h4>
                            <button onClick={() => { if (confirm("Eliminar TODO el historial?")) clearAll(); }} className="px-3 py-2 bg-red-100 rounded">Borrar todo</button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
