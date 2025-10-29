// src/components/Sidebar.tsx
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaReceipt, FaShoppingCart, FaUsers } from "react-icons/fa";

export type NavKey = "ventas" | "compras" | "clientes";

export default function Sidebar({
    collapsed,
    onToggle,
    active,
    onNavigate,
    userEmail,
}: {
    collapsed: boolean;
    onToggle: () => void;
    active: NavKey;
    onNavigate: (k: NavKey) => void;
    userEmail?: string | null;
}) {
    const items: { key: NavKey; label: string; Icon: any }[] = [
        { key: "ventas", label: "Registro de ventas", Icon: FaReceipt },
        { key: "compras", label: "Registro de compras", Icon: FaShoppingCart },
        { key: "clientes", label: "Clientes registrados", Icon: FaUsers },
    ];

    const email = userEmail ?? "";
    const avatarLetter = email ? email.trim()[0].toUpperCase() : "L";
    const displayEmail = email;

    return (
        <aside
            aria-label="Barra lateral"
            className="sidebar-root"
            data-collapsed={collapsed ? "true" : "false"}
        >
            <div className={`sidebar-top ${collapsed ? "collapsed-top" : ""}`}>
                <button
                    aria-label={collapsed ? "Abrir menú lateral" : "Cerrar menú lateral"}
                    onClick={onToggle}
                    className={`sidebar-toggle ${collapsed ? "collapsed-toggle" : ""}`}
                    title={collapsed ? "Abrir" : "Cerrar"}
                >
                    <FaBars />
                </button>

                <div className="sidebar-brand" aria-hidden={collapsed}>
                    <strong>Lorena Vera</strong>
                    <small>Está en tus manos</small>
                </div>
            </div>

            <nav className="sidebar-nav" role="navigation" aria-label="Navegación principal">
                <ul>
                    {items.map((it) => {
                        const isActive = it.key === active;
                        return (
                            <li key={it.key} className="sidebar-item-wrapper">
                                <button
                                    className={`sidebar-item ${isActive ? "active" : ""}`}
                                    onClick={() => onNavigate(it.key)}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <span className="icon"><it.Icon /></span>
                                    <span className="label" aria-hidden={collapsed}>{it.label}</span>

                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.span
                                                className="active-bubble"
                                                layoutId="nav-bubble"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                                aria-hidden
                                            />
                                        )}
                                    </AnimatePresence>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className={`sidebar-bottom ${collapsed ? "collapsed-bottom" : ""}`} aria-hidden={false}>
                <div className="sidebar-user">
                    <div className="avatar" aria-hidden={false}>{avatarLetter}</div>
                    <div className="user-meta" aria-hidden={collapsed}>
                        <div className="email">{displayEmail || "invitado@ejemplo"}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}