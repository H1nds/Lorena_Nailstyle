// src/components/Layout.tsx
import type { ReactNode } from "react"; // <--- CORRECCIÓN 1: Agregar 'type'
import Sidebar from "./Sidebar";
import type { NavKey } from "../types";
import { motion } from "framer-motion";

type Props = {
    children: ReactNode;
    initial: NavKey;
    onSectionChange: (key: NavKey) => void;
    userEmail: string; // Se mantiene en el tipo por si acaso
};

// CORRECCIÓN 2: Quitamos 'userEmail' de aquí porque no lo usamos dentro del HTML
export default function Layout({ children, initial, onSectionChange }: Props) {
    return (
        <div className="flex min-h-screen bg-brand-mesh">
            <div className="w-28 flex-shrink-0 z-20">
                <Sidebar active={initial} onNavigate={onSectionChange} />
            </div>

            <main className="flex-1 p-6 overflow-x-hidden z-10">
                <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}