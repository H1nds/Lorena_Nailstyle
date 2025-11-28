// src/components/ClientView.tsx
import { useClients } from '../hooks/useClients';
import { AnimatePresence, motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPhone, FaWhatsapp } from 'react-icons/fa';
import type { Client } from '../types';

export default function ClientView() {
    const { clients, deleteClient } = useClients();

    const handleEdit = (client: Client) => {
        alert(`Editar ${client.nombres} (Próximamente)`);
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) {
            deleteClient(id);
        }
    };

    // --- Lógica de WhatsApp Corregida ---
    const handleWhatsApp = (client: Client) => {
        // 1. Limpieza del número
        let phone = client.phone.replace(/\D/g, '');

        if (!phone) {
            alert("Este cliente no tiene un número registrado.");
            return;
        }

        // 2. Formato Perú
        if (phone.length === 9 && phone.startsWith('9')) {
            phone = `51${phone}`;
        }

        // 3. Mensaje con Códigos Unicode (Más seguro para evitar diamantes )
        // \uD83D\uDC4B = Mano saludando
        // \uD83D\uDC85 = Uñas pintadas
        // \u2728 = Chispas
        const message = `Hola ${client.nombres} \uD83D\uDC4B, te saludamos de *Lorena Nailstyle*.\n\nTe escribimos para recordarte tu cita pendiente con nosotros. ¡Te esperamos! \uD83D\uDC85\u2728`;

        // 4. CAMBIO CLAVE: Usamos api.whatsapp.com en lugar de wa.me
        // Esto evita que la redirección rompa la codificación de los emojis
        const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

        window.open(url, '_blank');
    };

    if (!clients || clients.length === 0) {
        return <div className="bg-white p-4 rounded shadow">No hay clientes registrados aún.</div>;
    }

    return (
        <div className="bg-white rounded shadow p-4 overflow-auto">
            <h3 className="font-semibold mb-3">Clientes Registrados</h3>
            <table className="min-w-full text-sm border-collapse">
                <thead>
                    <tr className="text-left text-xs text-gray-600 border-b">
                        <th className="p-2">DNI</th>
                        <th className="p-2">Nombres</th>
                        <th className="p-2">Apellidos</th>
                        <th className="p-2">Celular</th>
                        <th className="p-2 text-center">Acciones</th>
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
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaPhone size={12} className="text-gray-400" />
                                        {client.phone || "—"}
                                    </div>
                                </td>
                                <td className="p-2 align-top">
                                    <div className="flex items-center justify-center gap-2">

                                        <button
                                            onClick={() => handleWhatsApp(client)}
                                            title="Enviar recordatorio por WhatsApp"
                                            className="btn-icon bg-green-100 text-green-600 p-2 rounded-full transition-transform hover:scale-110 border border-green-200"
                                        >
                                            <FaWhatsapp size={16} />
                                        </button>

                                        <button
                                            onClick={() => handleEdit(client)}
                                            title="Editar cliente"
                                            className="btn-icon bg-yellow-100 text-yellow-800 p-2 rounded-full transition-transform hover:scale-110 border border-yellow-200"
                                        >
                                            <FaEdit size={16} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(client.id)}
                                            title="Eliminar cliente"
                                            className="btn-icon bg-red-100 text-red-800 p-2 rounded-full transition-transform hover:scale-110 border border-red-200"
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