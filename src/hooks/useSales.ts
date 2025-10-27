// src/hooks/useSales.ts
import { useEffect, useState } from "react";
import type { Sale } from "../types";
import { db } from "../firebase";
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    doc,
    updateDoc,
    deleteDoc,
    writeBatch,
    getDocs,
} from "firebase/firestore";

/**
 * Hook de ventas conectadas a Firestore.
 * Provee: sales, addSale, updateSale, deleteSale, clearAll
 */
export function useSales() {
    const [sales, setSales] = useState<Sale[]>([]);
    const colRef = collection(db, "sales");

    useEffect(() => {
        // Listener en tiempo real (ordenado por createdAt si existe)
        const q = query(colRef, orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const items: Sale[] = snapshot.docs.map((d) => {
                const data = d.data() as any;
                return {
                    id: d.id,
                    ...data,
                } as Sale;
            });
            setSales(items);
        }, (err) => {
            console.error("Error escuchando sales:", err);
        });

        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addSale = async (sale: Sale) => {
        const { id, ...payload } = sale;
        try {
            const docRef = await addDoc(colRef, payload);
            return docRef.id;
        } catch (err) {
            console.error("Error añadiendo sale:", err);
            throw err;
        }
    };

    const updateSale = async (sale: Sale) => {
        if (!sale.id) throw new Error("Sale debe tener id para actualizar");
        try {
            const d = doc(db, "sales", sale.id);

            const { id, ...saleData } = sale;

            await updateDoc(d, saleData);
        } catch (err) {
            console.error("Error actualizando sale:", err);
            throw err;
        }
    };

    const deleteSale = async (id: string) => {
        try {
            const d = doc(db, "sales", id);
            await deleteDoc(d);
        } catch (err) {
            console.error("Error borrando sale:", err);
            throw err;
        }
    };

    const clearAll = async () => {
        // Elimina todos los documentos en la colección (poco eficiente para grandes volúmenes)
        try {
            const snapshot = await getDocs(colRef);
            const batch = writeBatch(db);
            snapshot.docs.forEach((d) => batch.delete(d.ref));
            await batch.commit();
        } catch (err) {
            console.error("Error borrando todo:", err);
            throw err;
        }
    };

    return { sales, addSale, updateSale, deleteSale, clearAll };
}
