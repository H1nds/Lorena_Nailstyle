// src/hooks/usePurchases.ts
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import type { Purchase } from "../types";

export function usePurchases() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "compras"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Purchase[];
            setPurchases(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const addPurchase = async (purchase: Omit<Purchase, "id">) => {
        await addDoc(collection(db, "compras"), purchase);
    };

    const updatePurchase = async (purchase: Purchase) => {
        const ref = doc(db, "compras", purchase.id);
        await updateDoc(ref, { ...purchase });
    };

    const deletePurchase = async (id: string) => {
        await deleteDoc(doc(db, "compras", id));
    };

    return { purchases, loading, addPurchase, updatePurchase, deletePurchase };
}