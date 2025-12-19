// src/components/ClientView.tsx
import { useState, useMemo } from 'react';
import { useClients } from '../hooks/useClients';
import { useStoreSettings } from '../hooks/useStoreSettings'; // <--- Seguridad
import { auth } from '../firebase'; // <--- Seguridad
import { ADMIN_EMAIL } from '../adminConfig'; // <--- Seguridad
import { AnimatePresence, motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPhone, FaWhatsapp, FaUserCircle, FaSearch } from 'react-icons/fa';
import type { Client } from '../types';
import { confirmAction, Toast } from '../utils/swal';

type Props = {
    onEdit?: (client: Client) => void;
};

export default function ClientView({ onEdit }: Props) {
    const { clients, deleteClient } = useClients();
    const { permissions } = useStoreSettings(); // Leemos permisos globales
    const [searchQuery, setSearchQuery] = useState('');

    // Lógica de Seguridad: ¿Puede borrar? (Es Admin O tiene el permiso activado)
    const canDelete = auth.currentUser?.email === ADMIN_EMAIL || permissions.canDeleteClients;

    const filteredClients = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return clients;

        return clients.filter(client => {
            const fullName = `${client.nombres} ${client.apellidos}`.toLowerCase();
            const dni = client.dni.toLowerCase();
            const phone = client.phone ? client.phone.toLowerCase() : '';
            return fullName.includes(query) || dni.includes(query) || phone.includes(query);
        });
    }, [clients, searchQuery]);

    const handleEdit = (client: Client) => {
        if (onEdit) {
            onEdit(client);
        } else {
            console.error("Función onEdit no proporcionada");
        }
    };

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirmAction('¿Eliminar cliente?', 'Se borrará de la agenda.');
        if (isConfirmed) {
            deleteClient(id);
            Toast.fire({ icon: 'success', title: 'Cliente eliminado' });
        }
    };

    const handleWhatsApp = (client: Client) => {
        let phone = client.phone.replace(/\D/g, '');
        if (!phone) { Toast.fire({ icon: 'warning', title: 'Sin número registrado' }); return; }
        if (phone.length === 9 && phone.startsWith('9')) phone = `51${phone}`;
        const message = `Hola ${client.nombres} \uD83D\uDC4B, te saludamos de *Lorena Nailstyle*.\n\nTe escribimos para recordarte tu cita pendiente con nosotros. ¡Te esperamos! \uD83D\uDC85\u2728`;
        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`, '_blank');
    };

    if (!clients || clients.length === 0) {
        return (
            <div className="glass-panel rounded-3xl p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-4">
                <FaUserCircle size={60} className="text-pink-200" />
                <p className="text-xl font-serif text-gray-600">Aún no hay clientes registrados</p>
                <p className="text-sm">Comienza añadiendo uno desde el botón superior.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-[2.5rem] p-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-gray-800 font-serif mb-1">Cartera de Clientes</h3>
                    <p className="text-gray-500 text-sm">Gestiona tus contactos y citas</p>
                </div>

                <div className="relative w-full md:w-auto flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <FaSearch className="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, DNI o teléfono..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white/80 backdrop-blur-sm transition-all"
                    />
                </div>

                <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md whitespace-nowrap">
                    {filteredClients.length} Resultados
                </span>
            </div>

            <div className="overflow-visible">
                <table className="min-w-full text-sm border-separate border-spacing-y-4">
                    <thead>
                        <tr className="text-left text-gray-400 text-xs uppercase tracking-wider font-medium">
                            <th className="pl-6 pb-2">Cliente</th>
                            <th className="pb-2">DNI</th>
                            <th className="pb-2">Contacto</th>
                            <th className="pr-6 pb-2 text-right">Acciones Rápidas</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredClients.map((client, index) => (
                                <motion.tr
                                    key={client.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                                    className="glass-card-hover group"
                                >
                                    <td className="p-4 pl-6 rounded-l-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-pink-200 border-2 border-white shadow-sm flex items-center justify-center text-rose-600 text-lg font-bold font-serif">
                                                {client.nombres.charAt(0)}{client.apellidos.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 text-base">{client.nombres}</div>
                                                <div className="text-sm text-gray-500">{client.apellidos}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-gray-600 font-medium tracking-wide">{client.dni}</td>
                                    <td className="p-4">
                                        {client.phone ? (
                                            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 w-fit px-3 py-1.5 rounded-full border border-gray-100">
                                                <FaPhone size={14} className="text-green-500" />
                                                <span className="font-medium">{client.phone}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-300 text-sm italic pl-2">Sin contacto</span>
                                        )}
                                    </td>
                                    <td className="p-4 pr-6 rounded-r-2xl">
                                        <div className="flex items-center justify-end gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleWhatsApp(client)} title="Enviar WhatsApp" className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-500 hover:text-white hover:shadow-md transition-all border border-green-200 hover:border-transparent">
                                                <FaWhatsapp size={18} />
                                            </button>

                                            <button onClick={() => handleEdit(client)} title="Editar" className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white hover:shadow-md transition-all border border-amber-200 hover:border-transparent">
                                                <FaEdit size={18} />
                                            </button>

                                            {/* SEGURIDAD: Botón de borrar condicional */}
                                            {canDelete && (
                                                <button onClick={() => handleDelete(client.id)} title="Eliminar" className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-md transition-all border border-red-200 hover:border-transparent">
                                                    <FaTrash size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {filteredClients.length === 0 && searchQuery && (
                    <div className="text-center py-8 text-gray-500">
                        No se encontraron clientes para "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    );
}