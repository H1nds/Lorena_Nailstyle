// src/hooks/useClients.ts
import { useEffect, useState } from "react";
import type { Client } from "../types"; // Importa el nuevo tipo
import { db } from "../firebase";
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    doc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";

/**
 * Hook de Clientes conectados a Firestore.
 * Provee: clients, updateClient, deleteClient
 */
export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    // 1. Apunta a la colección "clientes"
    const colRef = collection(db, "clientes");

    useEffect(() => {
        // 2. Ordena por 'createdAt' (el formulario de cliente lo guarda)
        const q = query(colRef, orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const items: Client[] = snapshot.docs.map((d) => {
                const data = d.data() as any;
                return {
                    id: d.id,
                    ...data,
                } as Client;
            });
            setClients(items);
        }, (err) => {
            console.error("Error escuchando clientes:", err);
        });

        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateClient = async (client: Client) => {
        if (!client.id) throw new Error("Cliente debe tener id para actualizar");
        try {
            const d = doc(db, "clientes", client.id);
            const { id, ...clientData } = client;
            await updateDoc(d, clientData);
        } catch (err) {
            console.error("Error actualizando cliente:", err);
            throw err;
        }
    };

    const deleteClient = async (id: string) => {
        try {
            const d = doc(db, "clientes", id);
            await deleteDoc(d);
        } catch (err) {
            console.error("Error borrando cliente:", err);
            throw err;
        }
    };

    return { clients, updateClient, deleteClient };
}