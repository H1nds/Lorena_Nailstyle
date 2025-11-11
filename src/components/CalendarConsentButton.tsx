// src/components/CalendarConsentButton.tsx
import { useEffect, useState } from "react";
import { auth } from "../firebase";
// --- 1. Importamos los iconos que usaremos ---
import { FaCalendarAlt, FaCalendarCheck } from "react-icons/fa";

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

    // --- 2. (Mejora) Mostramos un spinner pequeño mientras carga ---
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
                // --- 3. Icono de "Conectado" (en lugar de '?') ---
                <button
                    disabled
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white"
                    title="Google Calendar conectado"
                >
                    <FaCalendarCheck size={16} />
                </button>
            ) : (
                // --- 4. Icono de "Conectar" (en lugar de '+') ---
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