import { useState } from "react";
import { FaTimes, FaSave, FaSearch } from "react-icons/fa";
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
        if (!/^\d{8}$/.test(clean)) {
            setErr("DNI debe tener 8 dígitos");
            return;
        }
        setErr("");
        setLoading(true);

        try {
            const res = await fetch("/api/dni", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dni: clean }),
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(`Proxy DNI error: ${res.status} ${txt}`);
            }

            const json = await res.json();
            const data = json.data ?? json;
            const nombresApi = data.nombres ?? data.nombre_completo ?? data.nombreCompleto ?? "";
            const apP = data.apellido_paterno ?? data.apellidoPaterno ?? "";
            const apM = data.apellido_materno ?? data.apellidoMaterno ?? "";
            setNombres(nombresApi);
            setApellidos([apP, apM].filter(Boolean).join(" ").trim());
        } catch (e: any) {
            console.error("Error buscarPorDni:", e);
            setErr("No se encontró información para ese DNI o hubo un error en la consulta");
        } finally {
            setLoading(false);
        }
    };

    const guardarCliente = async () => {
        setErr("");
        if (!dni || !/^\d{8}$/.test(dni.trim())) return setErr("DNI obligatorio y 8 dígitos");
        if (!phone) return setErr("Número de celular obligatorio");
        setLoading(true);
        try {
            const doc = {
                dni: dni.trim(),
                phone: phone.trim(),
                nombres: nombres.trim(),
                apellidos: apellidos.trim(),
                createdAt: new Date().toISOString(),
            };
            await addDoc(collection(db, "clientes"), doc);
            if (onSaved) onSaved();
        } catch (e) {
            console.error("Error guardando cliente:", e);
            setErr("Error guardando cliente");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[var(--bg-main)] text-[var(--text-main)] rounded-xl shadow-lg p-6 w-full max-h-[75vh] overflow-auto" style={{ borderRadius: 14 }}>
            <h3 className="text-lg font-semibold bg-[var(--accent-yellow)] text-black px-6 py-3 -mx-6 mb-4 rounded-t-xl">Registrar cliente</h3>

            <div className="space-y-3">
                <label className="flex flex-col">
                    DNI
                    <div className="flex gap-2 mt-1">
                        <input
                            value={dni}
                            onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
                            placeholder="8 dígitos"
                            className="p-2 border rounded flex-1"
                            maxLength={8}
                        />

                        <button
                            type="button"
                            onClick={buscarPorDni}
                            disabled={loading}
                            className="flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-110 hover:shadow-md focus:outline-none"
                            title="Buscar cliente"
                            aria-label="Buscar cliente"
                            style={{
                                backgroundColor: "#E6F6FF",
                                border: "1px solid rgba(59,130,246,0.08)",
                            }}
                        >
                            {loading ? (
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4" />
                                </svg>
                            ) : (
                                <FaSearch size={15} color="#2563EB" />
                            )}
                        </button>
                    </div>
                </label>

                <label className="flex flex-col">
                    Número de celular
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
                        placeholder="Ej. 9XXXXXXXX"
                        className="mt-1 p-2 border rounded"
                    />
                </label>

                <label className="flex flex-col">
                    Nombres
                    <input value={nombres} readOnly className="mt-1 p-2 border rounded bg-gray-50" />
                </label>

                <label className="flex flex-col">
                    Apellidos
                    <input value={apellidos} readOnly className="mt-1 p-2 border rounded bg-gray-50" />
                </label>

                {err && <div className="text-red-500 text-sm">{err}</div>}

                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            setDni("");
                            setPhone("");
                            setNombres("");
                            setApellidos("");
                            setErr("");
                        }}
                        className="btn-icon bg-purple-100 text-purple-800 p-2 rounded-full"
                    >
                        <FaTimes />
                    </button>

                    <button
                        type="button"
                        onClick={guardarCliente}
                        className="btn-icon text-white p-2 rounded-full"
                        style={{ backgroundColor: "var(--accent-blue)" }}
                        disabled={loading}
                    >
                        <FaSave />
                    </button>
                </div>
            </div>
        </div>
    );
}