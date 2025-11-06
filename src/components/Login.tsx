import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import bgLogin from '../assets/login-bg.jpg';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [visible, setVisible] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            // Mostrar error detallado en consola + mensaje más informativo en UI
            console.error('Firebase signIn error', err);
            // Para Firebase client SDK err suele traer code y message
            const code = err?.code || err?.message || 'unknown_error';
            setError(`Error de autenticación: ${code}`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 overflow-hidden"
        >
            {/* 1. Fondo completo con blur */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${bgLogin})`,
                    filter: 'blur(8px)',
                }}
            />
            {/* 2. Velo blanco hueso para bordes */}
            <div className="absolute inset-0 bg-white/20"></div>
            {/* 3. Contenedor centrado del formulario */}
            <div className="relative z-20 flex items-center justify-center h-full w-full">
                <motion.form
                    onSubmit={handleLogin}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="
            relative z-10
            bg-[var(--bg-main)] bg-opacity-95
            p-10 rounded-3xl shadow-2xl
            w-96 md:w-[28rem] max-w-full
            max-h-[90vh] overflow-y-auto
            text-[var(--text-main)]
          "
                >
                    <h2 className="text-2xl font-bold mb-8 text-black">Inicio de sesión</h2>

                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 mb-2 text-center">
                            {error}
                        </motion.p>
                    )}

                    {/* Email Field */}
                    <div className="relative mb-4">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="
                w-full pl-10 pr-3 py-2
                bg-white bg-opacity-80 border border-gray-300
                rounded-full
                transition-shadow duration-300
                focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:shadow-md
              "
                        />
                    </div>

                    {/* Password Field with toggle */}
                    <div className="relative mb-6">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                        <input
                            type={visible ? "text" : "password"}
                            placeholder="Contraseña"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="
                w-full pl-10 pr-12 py-2
                bg-white bg-opacity-80 border border-gray-300
                rounded-full
                transition-shadow duration-300
                focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:shadow-md
              "
                            aria-label="Contraseña"
                        />

                        <button
                            type="button"
                            onClick={() => setVisible(v => !v)}
                            aria-pressed={visible}
                            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full focus:outline-none"
                            style={{ background: "transparent" }}
                        >
                            <motion.span
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileTap={{ scale: 0.92 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                                {visible ? <FaEye size={16} className="text-[var(--accent-blue)]" /> : <FaEyeSlash size={16} className="text-gray-500" />}
                            </motion.span>
                        </button>
                    </div>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="
              w-full py-3
              bg-[var(--accent-blue)] text-white font-semibold
              rounded-full shadow
              transition-colors duration-300 hover:bg-[var(--accent-blue)]/90
            "
                    >
                        Ingresar
                    </motion.button>
                </motion.form>
            </div>
        </motion.div>
    );
}