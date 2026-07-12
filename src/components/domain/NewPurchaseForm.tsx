// src/components/NewPurchaseForm.tsx
import { useState, useEffect } from "react";
import { FaSave, FaTimes, FaTag, FaBoxOpen, FaStore } from "react-icons/fa";
import { Toast } from "../utils/swal";
import type { Purchase } from "../types";

const CATEGORIES = [
    "Insumos Uñas",
    "Insumos Pestañas/Cejas",
    "Herramientas/Equipos",
    "Mobiliario/Decoración",
    "Limpieza/Higiene",
    "Servicios Básicos (Luz/Agua/Net)",
    "Publicidad/Marketing",
    "Alquiler",
    "Otros"
];

type Props = {
    onSave: (p: Omit<Purchase, "id"> | Purchase) => void;
    onCancel: () => void;
    initial?: Purchase | null;
};

export default function NewPurchaseForm({ onSave, onCancel, initial }: Props) {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [productName, setProductName] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [supplier, setSupplier] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (initial) {
            setDate(initial.date);
            setProductName(initial.productName);
            setCategory(initial.category);
            setSupplier(initial.supplier);
            setQuantity(initial.quantity);
            setUnitPrice(initial.unitPrice);
            setNotes(initial.notes || "");
        }
    }, [initial]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName.trim()) return Toast.fire({ icon: 'warning', title: 'Falta el nombre del producto' });
        if (quantity <= 0 || unitPrice < 0) return Toast.fire({ icon: 'warning', title: 'Valores numéricos inválidos' });

        // 1. Preparamos los datos base (SIN EL ID AÚN)
        const baseData = {
            date,
            productName,
            category,
            supplier,
            quantity: Number(quantity),
            unitPrice: Number(unitPrice),
            totalPrice: Number(quantity) * Number(unitPrice),
            notes,
            createdAt: initial ? initial.createdAt : new Date().toISOString()
        };

        // 2. Lógica de decisión: ¿Es editar o crear?
        if (initial) {
            // Si editamos, agregamos el ID existente
            onSave({ ...baseData, id: initial.id });
        } else {
            // Si creamos, enviamos SOLO los datos (Firebase creará el ID)
            // Esto evita enviar "id: undefined", que es lo que rompía tu app
            onSave(baseData as any);
        }
    };

    return (
        <div className="text-gray-700">
            <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                    <FaBoxOpen size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold font-serif text-gray-800">
                        {initial ? "Editar Compra" : "Registrar Compra"}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Control de Gastos e Inventario</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="block">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Fecha de Compra</span>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none font-medium" />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Categoría</span>
                        <div className="relative">
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none appearance-none font-medium">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <FaTag className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                        </div>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="block">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Producto / Servicio</span>
                        <input placeholder="Ej. Esmalte Rojo OPI" value={productName} onChange={e => setProductName(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none placeholder-gray-300" />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Proveedor (Opcional)</span>
                        <div className="relative">
                            <input placeholder="Ej. Distribuidora Lima" value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none placeholder-gray-300" />
                            <FaStore className="absolute right-3 top-3.5 text-gray-300" />
                        </div>
                    </label>
                </div>

                <div className="grid grid-cols-3 gap-4 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                    <label className="block">
                        <span className="text-[10px] font-bold text-purple-400 uppercase">Cantidad</span>
                        <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full p-2 bg-white border border-purple-200 rounded-lg text-center font-bold text-gray-700 outline-none focus:ring-1 focus:ring-purple-400" />
                    </label>
                    <label className="block">
                        <span className="text-[10px] font-bold text-purple-400 uppercase">Precio Unit. (S/.)</span>
                        <input type="number" min="0" step="0.10" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))} className="w-full p-2 bg-white border border-purple-200 rounded-lg text-center font-bold text-gray-700 outline-none focus:ring-1 focus:ring-purple-400" />
                    </label>
                    <label className="block">
                        <span className="text-[10px] font-bold text-purple-700 uppercase">Total (Auto)</span>
                        <div className="w-full p-2 bg-purple-200 border border-purple-300 rounded-lg text-center font-bold text-purple-900 flex items-center justify-center gap-1">
                            <span className="text-xs">S/.</span> {(quantity * unitPrice).toFixed(2)}
                        </div>
                    </label>
                </div>

                <label className="block">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Notas Adicionales</span>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none resize-none h-20 placeholder-gray-300" placeholder="Detalles extra..." />
                </label>

                <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
                    <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-colors flex items-center gap-2">
                        <FaTimes /> Cancelar
                    </button>
                    <button type="submit" className="px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-200 transform hover:-translate-y-1 transition-all flex items-center gap-2">
                        <FaSave /> {initial ? "Guardar Cambios" : "Registrar Gasto"}
                    </button>
                </div>
            </form>
        </div>
    );
}