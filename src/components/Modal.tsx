import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    width?: string; // opcional: "min(1100px,88vw)" por defecto
}

export default function Modal({ isOpen, onClose, children, width = "min(1100px, 88vw)" }: ModalProps) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev || "";
        };
    }, [isOpen]);

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            const delta = e.deltaY;
            const atTop = el.scrollTop === 0 && delta < 0;
            const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight && delta > 0;
            if (atTop || atBottom) {
                e.preventDefault();
            } else {
                e.stopPropagation();
            }
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50 p-6"
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.98, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        ref={wrapperRef}
                        onClick={onClose}
                        style={{ overflow: "hidden" }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            ref={contentRef}
                            role="dialog"
                            aria-modal="true"
                            style={{
                                background: "var(--bg-main)",
                                color: "var(--text-main)",
                                width,
                                maxHeight: "86vh",
                                overflowY: "auto",
                                overflowX: "hidden",
                                padding: 18,
                                borderRadius: 14,
                                boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                                position: "relative",
                                WebkitOverflowScrolling: "touch",
                            }}
                        >
                            <button
                                onClick={onClose}
                                aria-label="Cerrar"
                                style={{
                                    position: "absolute",
                                    top: 10,
                                    right: 14,            // separación desde el borde para no superponerse al scrollbar
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "var(--accent-soft, rgba(240,248,255,0.95))",
                                    border: "1px solid rgba(0,0,0,0.06)",
                                    zIndex: 80,           // muy alto para mantenerse por encima de todo, pero no encima del scrollbar interno
                                    boxShadow: "0 2px 6px rgba(2,6,23,0.06)",
                                }}
                                className="hover:scale-105 transition"
                            >
                                <FaTimes size={14} style={{ color: "var(--accent-blue, #2563EB)" }} />
                            </button>

                            <div style={{ marginTop: 6 }}>{children}</div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
