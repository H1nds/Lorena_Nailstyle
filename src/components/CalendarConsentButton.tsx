// src/components/CalendarConsentButton.tsx
import { useEffect, useState } from "react";
import { auth } from "../firebase";

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

    if (checking) return <div className="text-sm text-gray-500">Comprobando Google Calendar...</div>;

    return (
        <div className="flex items-center gap-2">
            {connected ? (
                <button
                    disabled
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white"
                    title="Google Calendar conectado"
                >
                    ?
                </button>
            ) : (
                <a
                    href={`/api/auth/google?uid=${uid}`}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:scale-105 transition-transform"
                    title="Conectar con Google Calendar"
                >
                    +
                </a>
            )}
        </div>
    );
}