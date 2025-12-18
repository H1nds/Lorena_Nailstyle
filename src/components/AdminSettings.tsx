// src/components/AdminSettings.tsx
import { useStoreSettings } from "../hooks/useStoreSettings";
import { FaUserShield, FaToggleOn, FaToggleOff } from "react-icons/fa";

export default function AdminSettings() {
    const { permissions, togglePermission, loading } = useStoreSettings();

    if (loading) return <div>Cargando configuración...</div>;

    const Option = ({ label, pKey }: { label: string; pKey: keyof typeof permissions }) => (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
            <span className="font-medium text-gray-700">{label}</span>
            <button
                onClick={() => togglePermission(pKey, !permissions[pKey])}
                className={`text-2xl transition-colors ${permissions[pKey] ? "text-green-500" : "text-gray-300"}`}
            >
                {permissions[pKey] ? <FaToggleOn /> : <FaToggleOff />}
            </button>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="p-3 bg-purple-100 text-purple-700 rounded-full">
                    <FaUserShield size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Panel de Control (Administrador)</h3>
                    <p className="text-sm text-gray-500">Configura qué pueden hacer tus empleados</p>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-semibold text-xs uppercase text-gray-400 tracking-wider">Permisos de Empleados</h4>

                <Option label="Permitir editar ventas guardadas" pKey="canEditSales" />
                <Option label="Permitir eliminar ventas" pKey="canDeleteSales" />
                <Option label="Ver totales monetarios e indicadores" pKey="canSeeTotals" />

                <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-100">
                    ℹ️ Estos cambios se aplican en tiempo real a todos los empleados conectados.
                </div>
            </div>
        </div>
    );
}