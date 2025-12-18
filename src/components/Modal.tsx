// src/components/Modal.tsx
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: string;
};

export default function Modal({ isOpen, onClose, children, width = "95%" }: ModalProps) {
    // ... (useEffect para bloqueo de scroll sigue igual) ...

    if (typeof window === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop oscuro y difuminado */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
                        style={{ overflowY: "auto" }}
                    >
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            {/* Contenedor del Modal con el NUEVO estilo .glass-modal */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative transform overflow-hidden rounded-3xl text-left shadow-2xl transition-all sm:my-8 glass-modal" // <-- AQUÍ EL CAMBIO CLAVE
                                style={{ width: width, maxWidth: "800px", margin: "2rem auto" }}
                            >
                                {/* Botón de cerrar flotante */}
                                <div className="absolute top-4 right-4 z-10">
                                    <button
                                        onClick={onClose}
                                        className="bg-white/50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full p-2 transition-colors backdrop-blur-md shadow-sm border border-transparent hover:border-red-100"
                                    >
                                        <FaTimes size={18} />
                                    </button>
                                </div>

                                {/* Contenido con padding interno */}
                                <div className="px-8 py-8 pt-12 sm:p-10 sm:pt-12">
                                    {children}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}