// src/components/ClientView.tsx
import { useClients } from '../hooks/useClients';
import { AnimatePresence, motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPhone } from 'react-icons/fa';
import type { Client } from '../types';

export default function ClientView() {
    const { clients, deleteClient } = useClients();

    const handleEdit = (client: Client) => {
        // Cuando creemos el formulario de edición, lo llamaremos aquí
        alert(`Editar ${client.nombres} (Próximamente)`);
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) {
            deleteClient(id);
        }
    };

    if (!clients || clients.length === 0) {
        return <div className="bg-white p-4 rounded shadow">No hay clientes registrados aún.</div>;
    }

    return (
        // Estilo coherente: bg-white, shadow, p-4
        <div className="bg-white rounded shadow p-4 overflow-auto">
            <h3 className="font-semibold mb-3">Clientes Registrados</h3>
            <table className="min-w-full text-sm border-collapse">
                <thead>
                    <tr className="text-left text-xs text-gray-600 border-b">
                        <th className="p-2">DNI</th>
                        <th className="p-2">Nombres</th>
                        <th className="p-2">Apellidos</th>
                        <th className="p-2">Celular</th>
                        <th className="p-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {clients.map((client) => (
                            <motion.tr
                                key={client.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{
                                    backgroundColor: 'rgba(255,0,0,0.8)',
                                    x: -200,
                                    opacity: 0
                                }}
                                transition={{ duration: 0.4 }}
                                className="border-b last:border-b-0 hover:bg-gray-50"
                            >
                                <td className="p-2 align-top font-mono">{client.dni}</td>
                                <td className="p-2 align-top">{client.nombres}</td>
                                <td className="p-2 align-top">{client.apellidos}</td>
                                <td className="p-2 align-top">
                                    {/* Link de teléfono (útil en móviles) */}
                                    <a
                                        href={`tel:${client.phone}`}
                                        className="flex items-center gap-2 text-blue-600 hover:underline"
                                        title={`Llamar a ${client.phone}`}
                                    >
                                        <FaPhone size={12} />
                                        {client.phone}
                                    </a>
                                </td>
                                <td className="p-2 align-top">
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => handleEdit(client)}
                                            title="Editar cliente"
                                            className="btn-icon bg-yellow-100 text-yellow-800 p-2 rounded-full transition-transform hover:scale-110"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(client.id)}
                                            title="Eliminar cliente"
                                            className="btn-icon bg-red-100 text-red-800 p-2 rounded-full transition-transform hover:scale-110"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
}