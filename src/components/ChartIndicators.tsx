import { useMemo, useState } from "react";
import type { Sale } from "../types";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as ReTooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts";
import ChartCarousel from "./ChartCarousel";

// add after imports at top of file
type SaleWithClient = Sale & {
    client?: { id?: string; dni?: string; nombres?: string; apellidos?: string };
    _date?: Date;
    _year?: number;
    _month?: number;
    _day?: string;
    _quarter?: number;
};

interface Props { sales: Sale[]; }

const PALETTE = ["#2563EB", "#F97316", "#7C3AED", "#06B6D4", "#F59E0B", "#10B981"];
const currency = (n: number) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(n).replace("S/", "S/ ");

function groupBy<T, K extends string | number>(arr: T[], keyFn: (x: T) => K) {
    return arr.reduce((acc, cur) => { const k = String(keyFn(cur)); (acc[k] ||= []).push(cur); return acc; }, {} as Record<string, T[]>);
}

export default function ChartIndicators({ sales }: Props) {
    const [selectedMonth, setSelectedMonth] = useState<"all" | number>("all");
    const [timeGranularity, setTimeGranularity] = useState<"daily" | "monthly" | "quarterly" | "yearly">("monthly");

    const parsed = useMemo(() => sales.map(s => {
        const d = new Date(s.dateService);
        return {
            ...(s as SaleWithClient),
            _date: d,
            _year: d.getFullYear(),
            _month: d.getMonth() + 1,
            _day: d.toISOString().slice(0, 10),
            _quarter: Math.floor(d.getMonth() / 3) + 1,
        } as SaleWithClient;
    }), [sales]);

    const filtered = useMemo(() => selectedMonth === "all" ? parsed : parsed.filter(s => s._month === selectedMonth), [parsed, selectedMonth]);

    const byService = useMemo(() => {
        const map = new Map<string, number>();
        filtered.forEach(s => map.set(s.serviceType, (map.get(s.serviceType) || 0) + s.quantity * s.unitPrice));
        return Array.from(map.entries()).map(([service, monto]) => ({ service, monto })).sort((a, b) => b.monto - a.monto);
    }, [filtered]);

    const totalSeries = useMemo(() => {
        const keyFn = (s: SaleWithClient) => {
            if (timeGranularity === "daily") return s._day ?? "unknown";
            if (timeGranularity === "monthly") return `${s._year ?? "unknown"}-${String(s._month ?? 0).padStart(2, "0")}`;
            if (timeGranularity === "quarterly") return `${s._year ?? "unknown"}-Q${s._quarter ?? 0}`;
            return `${s._year ?? "unknown"}`;
        };

        const g = groupBy(filtered, keyFn);
        return Object.entries(g)
            .map(([k, v]) => ({ label: k, monto: v.reduce((r, x) => r + x.quantity * x.unitPrice, 0) }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [filtered, timeGranularity]);

    const byClient = useMemo(() => {
        const map = new Map<string, { name: string; monto: number }>();
        filtered.forEach(s => {
            if (!s.client) return;
            const key = s.client.id || s.client.dni || `${s.client.nombres} ${s.client.apellidos}`;
            const subtotal = s.quantity * s.unitPrice;
            const prev = map.get(key) || { name: `${s.client.nombres ?? ""} ${s.client.apellidos ?? ""}`.trim(), monto: 0 };
            prev.monto += subtotal;
            map.set(key, prev);
        });
        return Array.from(map.entries()).map(([id, v]) => ({ id, name: v.name || "Sin nombre", monto: v.monto })).sort((a, b) => b.monto - a.monto);
    }, [filtered]);

    const labeledService = byService.map((s, i) => ({ ...s, label: `${s.service} — ${currency(s.monto)}`, fill: PALETTE[i % PALETTE.length] }));
    const labeledClient = byClient.map((c, i) => ({ ...c, label: `${c.name} — ${currency(c.monto)}`, fill: PALETTE[i % PALETTE.length] }));
    const labeledTotals = totalSeries.map(t => ({ ...t, label: `${t.label} — ${currency(t.monto)}` }));

    const monthsOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(2020, i, 1).toLocaleString("es-PE", { month: "short" }) }));

    const renderPieLabel = (props: any) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, payload } = props;
        const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
        const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
        const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);
        const amount = payload?.monto ?? 0;
        return (
            <text x={x} y={y} fill="#111827" fontSize={11} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
                {`${String(payload.name).split(" ")[0]} — ${currency(amount)}`}
            </text>
        );
    };

    // Slides array
    const slides = [
        {
            key: "service",
            title: "Ventas por Servicio",
            controls: (
                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Rango</label>
                    <select value={selectedMonth === "all" ? "all" : String(selectedMonth)} onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))} className="p-2 rounded border text-sm">
                        <option value="all">Todo el año</option>
                        {monthsOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>
            ),
            content: (
                <div style={{ height: 320, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={labeledService.slice(0, 8)} margin={{ left: 6, right: 8 }}>
                            <XAxis type="number" tickFormatter={(v) => currency(v)} />
                            <YAxis dataKey="service" type="category" width={120} tick={{ fontSize: 11 }} />
                            <ReTooltip formatter={(v: any) => currency(Number(v))} />
                            <Bar dataKey="monto" isAnimationActive>
                                {labeledService.slice(0, 8).map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )
        },

        {
            key: "total",
            title: "Venta total",
            controls: (
                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Granularidad</label>
                    <select value={timeGranularity} onChange={(e) => setTimeGranularity(e.target.value as any)} className="p-2 rounded border text-sm">
                        <option value="daily">Diario</option>
                        <option value="monthly">Mensual</option>
                        <option value="quarterly">Trimestral</option>
                        <option value="yearly">Anual</option>
                    </select>
                </div>
            ),
            content: (
                <div style={{ height: 320, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={labeledTotals}>
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis tickFormatter={(v) => currency(Number(v))} />
                            <ReTooltip formatter={(v: any) => currency(Number(v))} />
                            <Line type="monotone" dataKey="monto" stroke={PALETTE[0]} strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )
        },

        {
            key: "client",
            title: "Ventas por Cliente",
            controls: null,
            content: (
                <div style={{ height: 320, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={labeledClient.slice(0, 8)}
                                dataKey="monto"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={64}
                                paddingAngle={6}
                                labelLine={false}
                                label={renderPieLabel}
                            >
                                {labeledClient.slice(0, 8).map((c, i) => <Cell key={i} fill={c.fill} />)}
                            </Pie>
                            <ReTooltip formatter={(v: any) => currency(Number(v))} />
                            <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )
        },

        {
            key: "summary",
            title: "Resumen",
            controls: null,
            content: (
                <div style={{ padding: 8 }}>
                    <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Total ventas (filtro)</span><strong>{currency(filtered.reduce((r, s) => r + s.quantity * s.unitPrice, 0))}</strong></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Número de ventas</span><strong>{filtered.length}</strong></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Clientes únicos</span><strong>{new Set((filtered as SaleWithClient[]).filter(s => s.client).map(s => s.client!.id || s.client!.dni)).size}</strong></div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div style={{ minWidth: 0 }}>
            <ChartCarousel slides={slides} />
        </div>
    );
}