// src/components/Layout.tsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import type { NavKey } from "./Sidebar";

export default function Layout({
    children,
    initial = "ventas",
    onSectionChange,
    userEmail,
}: {
    children: React.ReactNode;
    initial?: NavKey;
    onSectionChange?: (k: NavKey) => void;
    userEmail?: string | null;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState<NavKey>(initial);

    const handleNavigate = (k: NavKey) => {
        setActive(k);
        onSectionChange?.(k);
    };

    return (
        <div className={`layout-root ${collapsed ? "sidebar-collapsed" : ""}`}>
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((v) => !v)}
                active={active}
                onNavigate={handleNavigate}
                userEmail={userEmail}
            />

            <main className="layout-main" role="main">
                {children}
            </main>
        </div>
    );
}
