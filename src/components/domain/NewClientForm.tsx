// src/components/NewClientForm.tsx
import { useState, useEffect } from "react";
import { FaTimes, FaSave, FaSearch, FaUserCircle, FaEdit } from "react-icons/fa";
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { showErrorModal, showSuccessModal, Toast } from "../utils/swal";
import type { Client } from "../types";

type Props = {
    onSaved?: () => void;
    onCancel?: () => void; // Añadido para poder cerrar desde el botón cancelar
    initial?: Client | null; // Para recibir el cliente a editar
};

export default function NewClientForm({ onSaved, onCancel, initial = null }: Props) {
    const [dni, setDni] = useState("");
    const [phone, setPhone] = useState("");
    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [loading, setLoading] = useState(false);

    // Cargar datos si estamos editando
    useEffect(() => {
        if (initial) {
            setDni(initial.dni);
            setPhone(initial.phone || "");
            setNombres(initial.nombres);
            setApellidos(initial.apellidos);
        } else {
            // Limpiar si es nuevo registro
            setDni(""); setPhone(""); setNombres(""); setApellidos("");
        }
    }, [initial]);

    const buscarPorDni = async () => {
        const clean = dni.trim();
        if (!/^\d{8}$/.test(clean)) {
            Toast.fire({ icon: 'warning', title: "El DNI debe tener 8 dígitos" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/dni", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dni: clean }) });
            if (!res.ok) throw new Error("Error API");
            const json = await res.json();
            const payload = json.data ?? json;
            setNombres(String(payload.nombres ?? payload.name ?? "").trim());
            setApellidos(`${payload.apellido_paterno ?? ""} ${payload.apellido_materno ?? ""}`.trim());
            Toast.fire({ icon: 'success', title: "Datos encontrados" });
        } catch (e) {
            Toast.fire({ icon: 'error', title: "No se encontraron datos para este DNI" });
        } finally { setLoading(false); }
    };

    const verificarDuplicado = async (dniToCheck: string): Promise<boolean> => {
        const q = query(collection(db, "clientes"), where("dni", "==", dniToCheck));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            // Si estamos editando, permitimos que el DNI duplicado sea EL MISMO que ya tiene este usuario
            if (initial && snapshot.docs[0].id === initial.id) {
                return false; // No es duplicado, es él mismo
            }
            return true; // Es duplicado de otra persona
        }
        return false;
    };

    const guardarCliente = async () => {
        if (!dni || !/^\d{8}$/.test(dni.trim())) return Toast.fire({ icon: 'warning', title: "DNI inválido" });

        setLoading(true);
        try {
            // 1. Verificación de Duplicados
            const existe = await verificarDuplicado(dni.trim());
            if (existe) {
                showErrorModal("¡Cliente ya registrado!", `El DNI ${dni} ya pertenece a otro cliente en la base de datos.`);
                setLoading(false);
                return;
            }

            const clientData = {
                dni: dni.trim(),
                phone: phone.trim(),
                nombres: nombres.trim(),
                apellidos: apellidos.trim(),
                // Si es nuevo, añadimos fecha, si es edit, no la tocamos (o añadimos updatedAt)
                ...(initial ? {} : { createdAt: new Date().toISOString() })
            };

            if (initial) {
                // MODO EDICIÓN
                const docRef = doc(db, "clientes", initial.id);
                await updateDoc(docRef, clientData);
                showSuccessModal("Cliente Actualizado", `Los datos de ${nombres} se han guardado.`);
            } else {
                // MODO CREACIÓN
                await addDoc(collection(db, "clientes"), clientData);
                showSuccessModal("Cliente Registrado", `${nombres} ha sido añadido a la agenda.`);
            }

            if (onSaved) onSaved();

        } catch (e) {
            console.error(e);
            showErrorModal("Error", "Ocurrió un problema al guardar los datos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-gray-700">
            {/* Título Dinámico */}
            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-4">
                <div className={`p-3 rounded-full ${initial ? 'bg-amber-100 text-amber-600' : 'bg-pink-100 text-pink-600'}`}>
                    {initial ? <FaEdit size={24} /> : <FaUserCircle size={24} />}
                </div>
                <div>
                    <h3 className="text-2xl font-bold font-serif text-gray-800">
                        {initial ? 'Editar Cliente' : 'Registrar Cliente'}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                        {initial ? 'Modificar datos existentes' : 'Añadir a la agenda'}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <label className="block">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">DNI</span>
                    <div className="flex gap-2">
                        <input
                            value={dni}
                            onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
                            placeholder="8 dígitos"
                            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-300 outline-none font-mono text-lg transition-all"
                            maxLength={8}
                        // Si estamos editando, quizás quieras bloquear el DNI o permitir cambiarlo. Lo dejamos editable.
                        />
                        <button
                            type="button"
                            onClick={buscarPorDni}
                            disabled={loading}
                            className="w-14 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                            title="Buscar datos en RENIEC"
                        >
                            {loading ? <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" /> : <FaSearch size={20} />}
                        </button>
                    </div>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Nombres</span>
                        <input value={nombres} onChange={(e) => setNombres(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-300 outline-none" />
                    </label>
                    <label className="block">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Apellidos</span>
                        <input value={apellidos} onChange={(e) => setApellidos(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-300 outline-none" />
                    </label>
                </div>

                <label className="block">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Celular <span className="text-gray-300 font-normal lowercase">(opcional)</span></span>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
                        placeholder="Ej. 912345678"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-300 outline-none"
                    />
                </label>

                <div className="flex gap-4 justify-end pt-6 border-t border-gray-100 mt-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            <FaTimes /> Cancelar
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={guardarCliente}
                        disabled={loading}
                        className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2 ${initial
                                ? "bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 shadow-amber-200"
                                : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-200"
                            }`}
                    >
                        <FaSave /> {initial ? "Actualizar Datos" : "Guardar Cliente"}
                    </button>
                </div>
            </div>
        </div>
    );
}