// src/components/CalendarConsentButton.tsx
import { useEffect, useState } from "react";
import { auth } from "../firebase";
// 1. Importa los iconos nuevos
import { FaCalendarAlt, FaCalendarCheck, FaUnlink } from "react-icons/fa";

export default function CalendarConsentButton() {
    const [connected, setConnected] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(true);
    const [uid, setUid] = useState<string | null>(null);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user) => {
            setUid(user?.uid || null);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!uid) {
            setConnected(false);
            setChecking(false);
            return;
        }

        const checkStatus = async () => {
            setChecking(true); // Asegura que estemos en 'checking'
            try {
                const res = await fetch(`/api/calendar/status?uid=${uid}`);
                const json = await res.json();
                setConnected(Boolean(json?.connected));
            } catch (err) {
                console.error("Error comprobando Calendar:", err);
                setConnected(false);
            } finally {
                setChecking(false);
            }
        };

        checkStatus();
    }, [uid]);

    // 2. Función para manejar la desconexión
    const handleDisconnect = async () => {
        if (!uid) return;
        if (!confirm("¿Estás seguro de que quieres desvincular tu Google Calendar?")) {
            return;
        }

        setChecking(true); // Reutilizamos el estado de carga
        try {
            // Llama a la nueva API que creamos
            const res = await fetch('/api/calendar/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid })
            });

            const json = await res.json();
            if (json.ok) {
                setConnected(false); // Actualiza el estado a "desconectado"
            } else {
                throw new Error(json.error || 'Failed to disconnect');
            }
        } catch (err) {
            console.error("Error al desconectar Calendar:", err);
            alert("No se pudo desvincular la cuenta.");
        } finally {
            setChecking(false);
        }
    };


    if (checking) {
        return (
            <div className="flex items-center justify-center w-10 h-10" title="Comprobando...">
                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {connected ? (
                // 3. Botón "Conectado" con efecto hover
                <button
                    onClick={handleDisconnect}
                    className="group flex items-center justify-center w-10 h-10 rounded-full bg-green-500 hover:bg-red-600 text-white transition-all duration-200"
                    title="Google Calendar conectado (clic para desvincular)"
                >
                    {/* Icono por defecto: FaCalendarCheck */}
                    <FaCalendarCheck size={16} className="block group-hover:hidden" />
                    {/* Icono en hover: FaUnlink */}
                    <FaUnlink size={16} className="hidden group-hover:block" />
                </button>
            ) : (
                // Botón "Desconectado" (sin cambios)
                <a
                    href={`/api/auth/google?uid=${uid}`}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:scale-105 transition-transform"
                    title="Conectar con Google Calendar"
                >
                    <FaCalendarAlt size={16} />
                </a>
            )}
        </div>
    );
}