// src/components/Login.tsx
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '@/config/firebase';
import { FaGoogle, FaFingerprint, FaEye, FaEyeSlash } from "react-icons/fa"; // <--- Importamos los ojos
import { Toast } from '@/utils/swal';

export default function Login() {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [showPassword, setShowPassword] = useState(false); // <--- Nuevo estado para el ojo
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
        try {
            await signInWithPopup(auth, provider);
        } catch (err: any) {
            console.error("Google login error:", err);
            Toast.fire({ icon: 'error', title: 'Error de Google', text: err.message });
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-mesh p-4 py-8">

            <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 w-full max-w-md shadow-2xl border border-white/60 relative overflow-hidden z-10">

                {/* Decoración de fondo */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-babyblue-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-babyblue-400/20 rounded-full blur-3xl"></div>

                <div className="text-center mb-10 relative">
                    <div className="w-28 h-28 mx-auto mb-6 flex items-center justify-center">
                        <img src="/logo.svg" alt="Logo del Salón" className="w-full h-full object-contain drop-shadow-2xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 font-serif mb-2">Bienvenido</h2>
                    <p className="text-gray-500 text-sm">Inicia sesión para gestionar tu salón</p>
                </div>

                <div className="space-y-8 relative z-10">

                    <button
                        onClick={handleGoogle}
                        type="button"
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 p-4 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-babyblue-200 hover:shadow-md transition-all group"
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
                                className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-300 outline-none transition-all font-medium"
                                placeholder="ejemplo@correo.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 block ml-1">Contraseña</label>
                            <div className="relative">
                                <input
                                    // AQUÍ LA MAGIA: Cambia el tipo según el estado
                                    type={showPassword ? "text" : "password"}
                                    value={pass}
                                    onChange={(e) => setPass(e.target.value)}
                                    className="w-full p-4 pr-12 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-300 outline-none transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                                {/* Botón del Ojo Flotante */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-babyblue-500 transition-colors focus:outline-none"
                                    tabIndex={-1} // Para que no moleste al tabular
                                >
                                    {showPassword ? (
                                        <FaEye size={20} title="Ocultar contraseña" />
                                    ) : (
                                        <FaEyeSlash size={20} title="Mostrar contraseña" />
                                    )}
                                </button>
                            </div>
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
                                    <FaFingerprint className="text-babyblue-300" />
                                    Acceder
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="text-center text-gray-500 text-sm font-medium mt-4 z-10">
                © {new Date().getFullYear()} Sistema de Gestión.
            </div>
        </div>
    );
}