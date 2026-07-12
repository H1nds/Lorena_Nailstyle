// src/components/Sidebar.tsx
import { FaHome, FaUsers, FaShoppingBag } from "react-icons/fa";
import type { NavKey } from "../../types/index"; // <--- IMPORTAMOS DE TYPES

type Props = {
    active: NavKey;
    onNavigate: (key: NavKey) => void;
};

export default function Sidebar({ active, onNavigate }: Props) {
    const navItems = [
        { key: "ventas", icon: FaHome, label: "Inicio" },
        { key: "clientes", icon: FaUsers, label: "Clientes" },
        { key: "compras", icon: FaShoppingBag, label: "Compras" },
    ] as const;

    return (
        <aside className="sticky top-0 h-screen glass-panel border-r-0 rounded-r-3xl flex flex-col items-center py-8 z-10 lg:translate-x-0 transition-all">

            <div className="mb-10 relative group cursor-pointer">
                <div className="absolute -inset-2 bg-gradient-to-r from-gold-500 to-gold-700 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <img src="/logo.svg" alt="Logo del Salón" className="w-full h-full object-contain drop-shadow-md transition-transform group-hover:scale-105" />
                </div>
            </div>

            <nav className="flex flex-col gap-4 w-full px-3">
                {navItems.map((item) => {
                    // Tipado forzado seguro ya que item.key coincide con los valores de NavKey
                    const key = item.key as NavKey;
                    const isActive = active === key;
                    return (
                        <button
                            key={key}
                            onClick={() => onNavigate(key)}
                            className={`group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${isActive
                                    ? "bg-babyblue-50 text-babyblue-700 shadow-sm"
                                    : "text-gray-400 hover:bg-white/60 hover:text-gray-600"
                                }`}
                        >
                            <div className={`p-3 rounded-full mb-1 transition-all ${isActive ? 'bg-babyblue-100 shadow-inner' : 'bg-gray-50 group-hover:bg-white shadow-sm'}`}>
                                <item.icon size={20} className={`transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-110'}`} />
                            </div>
                            <span className={`text-[10px] font-bold tracking-widest uppercase ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>

                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-babyblue-500 rounded-r-full" />
                            )}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}