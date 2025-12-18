// src/components/NewClientForm.tsx
import { useState } from "react";
import { FaTimes, FaSave, FaSearch, FaUserCircle } from "react-icons/fa";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function NewClientForm({ onSaved }: { onSaved?: () => void }) {
    const [dni, setDni] = useState("");
    const [phone, setPhone] = useState("");
    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const buscarPorDni = async () => {
        const clean = dni.trim();
        if (!/^\d{8}$/.test(clean)) { setErr("DNI debe tener 8 dígitos"); return; }
        setErr(""); setLoading(true);
        try {
            const res = await fetch("/api/dni", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dni: clean }) });
            if (!res.ok) throw new Error("Error API");
            const json = await res.json();
            const payload = json.data ?? json;
            setNombres(String(payload.nombres ?? payload.name ?? "").trim());
            setApellidos(`${payload.apellido_paterno ?? ""} ${payload.apellido_materno ?? ""}`.trim());
        } catch (e) { setErr("No encontrado"); } finally { setLoading(false); }
    };

    const guardarCliente = async () => {
        setErr("");
        if (!dni || !/^\d{8}$/.test(dni.trim())) return setErr("DNI inválido");
        setLoading(true);
        try {
            await addDoc(collection(db, "clientes"), {
                dni: dni.trim(), phone: phone.trim(), nombres: nombres.trim(), apellidos: apellidos.trim(), createdAt: new Date().toISOString()
            });
            if (onSaved) onSaved();
        } catch (e) { setErr("Error guardando"); } finally { setLoading(false); }
    };

    return (
        <div className="text-gray-700">
            {/* Título Elegante */}
            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                    <FaUserCircle size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold font-serif text-gray-800">Registrar Cliente</h3>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Añadir a la agenda</p>
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
                            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-300 outline-none font-mono text-lg"
                            maxLength={8}
                        />
                        <button
                            type="button"
                            onClick={buscarPorDni}
                            disabled={loading}
                            className="w-14 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                        >
                            {loading ? <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" /> : <FaSearch size={20} />}
                        </button>
                    </div>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Nombres</span>
                        <input value={nombres} readOnly className="w-full p-3 bg-gray-100 border border-transparent rounded-xl text-gray-500 cursor-not-allowed" />
                    </label>
                    <label className="block">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block">Apellidos</span>
                        <input value={apellidos} readOnly className="w-full p-3 bg-gray-100 border border-transparent rounded-xl text-gray-500 cursor-not-allowed" />
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

                {err && <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg">{err}</div>}

                <div className="flex gap-4 justify-end pt-6 border-t border-gray-100 mt-4">
                    <button
                        type="button"
                        onClick={() => { setDni(""); setPhone(""); setNombres(""); setApellidos(""); setErr(""); }}
                        className="px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                        <FaTimes /> Limpiar
                    </button>

                    <button
                        type="button"
                        onClick={guardarCliente}
                        disabled={loading}
                        className="px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-200 transform hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                        <FaSave /> Guardar Cliente
                    </button>
                </div>
            </div>
        </div>
    );
}