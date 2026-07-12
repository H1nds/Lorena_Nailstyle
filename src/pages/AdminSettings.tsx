// src/components/AdminSettings.tsx
import { useStoreSettings } from "../hooks/useStoreSettings";
import { FaUserShield, FaToggleOn, FaToggleOff, FaExclamationTriangle } from "react-icons/fa";

export default function AdminSettings() {
    const { permissions, togglePermission, loading } = useStoreSettings();

    if (loading) return <div className="p-6 text-center text-gray-500">Cargando configuración...</div>;

    const Option = ({ label, pKey, danger = false }: { label: string; pKey: keyof typeof permissions, danger?: boolean }) => (
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${danger ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100 hover:bg-white'}`}>
            <div className="flex items-center gap-3">
                {danger && <FaExclamationTriangle className="text-red-400" />}
                <span className={`font-medium ${danger ? 'text-red-700' : 'text-gray-700'}`}>{label}</span>
            </div>
            <button
                onClick={() => togglePermission(pKey, !permissions[pKey])}
                className={`text-3xl transition-all hover:scale-110 ${permissions[pKey] ? "text-green-500" : "text-gray-300"}`}
            >
                {permissions[pKey] ? <FaToggleOn /> : <FaToggleOff />}
            </button>
        </div>
    );

    return (
        <div className="bg-white p-2">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                <div className="p-4 bg-purple-100 text-purple-700 rounded-2xl shadow-sm">
                    <FaUserShield size={28} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 font-serif">Centro de Mando</h3>
                    <p className="text-sm text-gray-500">Controla qué pueden hacer tus empleados</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ventas y Caja</h4>
                    <div className="space-y-3">
                        <Option label="Ver totales e indicadores financieros" pKey="canSeeTotals" />
                        <Option label="Permitir editar ventas" pKey="canEditSales" />
                        <Option label="Permitir eliminar ventas" pKey="canDeleteSales" danger />
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Gestión de Datos</h4>
                    <div className="space-y-3">
                        <Option label="Permitir eliminar Clientes" pKey="canDeleteClients" danger />
                        <Option label="Permitir eliminar Compras" pKey="canDeletePurchases" danger />
                        {/* Sugerencia futura: Bloquear edición de fechas pasadas */}
                        {/* <Option label="Editar historial antiguo" pKey="canEditHistory" /> */}
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 text-blue-800 text-xs rounded-xl border border-blue-100 flex gap-2">
                <span>ℹ️</span>
                Los cambios se aplican instantáneamente en todos los dispositivos conectados.
            </div>
        </div>
    );
}