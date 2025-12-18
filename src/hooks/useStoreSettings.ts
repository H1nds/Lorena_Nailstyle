// src/hooks/useStoreSettings.ts
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { DEFAULT_PERMISSIONS } from "../adminConfig";

export function useStoreSettings() {
    const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const docRef = doc(db, "configuracion", "global");

        const unsub = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setPermissions({ ...DEFAULT_PERMISSIONS, ...snap.data() });
            } else {
                // Si no existe, lo creamos con los valores por defecto
                setDoc(docRef, DEFAULT_PERMISSIONS);
            }
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const togglePermission = async (key: keyof typeof DEFAULT_PERMISSIONS, value: boolean) => {
        try {
            const docRef = doc(db, "configuracion", "global");
            await setDoc(docRef, { [key]: value }, { merge: true });
        } catch (e) {
            console.error("Error actualizando permisos:", e);
        }
    };

    return { permissions, togglePermission, loading };
}