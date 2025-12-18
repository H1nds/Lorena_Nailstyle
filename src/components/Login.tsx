// src/components/Login.tsx
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { FaGoogle, FaFingerprint } from "react-icons/fa";
import { Toast } from "../utils/swal";

export default function Login() {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            Toast.fire({ icon: 'success', title: '¡Bienvenido de nuevo!' });
        } catch (err: any) {
            console.error("Login error:", err);
            let msg = "Error al iniciar sesión.";
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') msg = "Credenciales incorrectas.";
            Toast.fire({ icon: 'error', title: msg });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        const provider = new GoogleAuthProvider();
        // provider.addScope('https://www.googleapis.com/auth/calendar.events'); // Opcional: Comenta esto si no usas Calendar aún para probar
        try {
            await signInWithPopup(auth, provider);
            // El éxito lo maneja el onAuthStateChanged en App.tsx, no necesitamos Toast aquí
        } catch (err: any) {
            console.error("Google login error:", err);
            // Mostramos el mensaje de error exacto de Firebase para ayudar a depurar
            Toast.fire({ icon: 'error', title: 'Error de Google', text: err.message });
        }
    };

    return (
        // CAMBIO 1: Usamos la nueva clase 'bg-brand-mesh' y añadimos 'flex-col gap-8' para el espaciado vertical
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-mesh p-4 py-8">

            <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 w-full max-w-md shadow-2xl border border-white/60 relative overflow-hidden z-10">

                {/* Decoración de fondo sutil */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>

                <div className="text-center mb-10 relative">
                    <div className="w-20 h-20 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg shadow-pink-200 font-serif mx-auto mb-6 rotate-3 ring-4 ring-white">
                        L
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 font-serif mb-2">Bienvenido</h2>
                    <p className="text-gray-500 text-sm">Inicia sesión para gestionar tu salón</p>
                </div>

                <div className="space-y-8 relative z-10">

                    <button
                        onClick={handleGoogle}
                        type="button" // Importante especificar type="button"
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 p-4 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-pink-200 hover:shadow-md transition-all group"
                    >
                        <FaGoogle className="text-red-500 text-xl group-hover:scale-110 transition-transform" />
                        <span>Continuar con Google</span>
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-widest">O usa tu correo</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block ml-1">Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none transition-all font-medium"
                                placeholder="ejemplo@correo.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block ml-1">Contraseña</label>
                            <input
                                type="password"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full p-4 rounded-xl font-bold text-white bg-gradient-to-r from-gray-800 to-gray-900 hover:from-black hover:to-gray-800 shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg"
                        >
                            {loading ? (
                                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    <FaFingerprint className="text-pink-300" />
                                    Acceder
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* CAMBIO 2: El footer ahora es un elemento flexible normal, no absoluto, con margen superior */}
            <div className="text-center text-gray-500 text-sm font-medium mt-4 z-10">
                © {new Date().getFullYear()} Lorena Nailstyle. Sistema de Gestión.
            </div>
        </div>
    );
}