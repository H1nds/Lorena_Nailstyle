import { useMemo } from 'react';
import type { Sale } from '@/types';

interface Props {
  sales: Sale[];
}

export default function PlaceholderIndicators({ sales }: Props) {
// Removed byNailer useMemo  // 2) Ventas totales y recuento por método de pago
  const byPayment = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    sales.forEach(s => {
      const subtotal = Number((s.unitPrice * s.quantity).toFixed(2));
      if (!map[s.paymentMethod]) map[s.paymentMethod] = { count: 0, total: 0 };
      map[s.paymentMethod].count += 1;
      map[s.paymentMethod].total += subtotal;
    });
    return Object.entries(map).map(([method, data]) => ({
      method,
      ventas: data.count,
      monto: data.total.toFixed(2),
    }));
  }, [sales]);

  return (
    <div className="bg-white rounded shadow p-4 space-y-6">
      {/* Removed Ventas por Nailer table */}

      {/* Tabla: Ventas por Método de Pago */}
      <div>
        <h3 className="font-semibold mb-2">Ventas por Método de Pago</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs text-gray-600 border-b">
              <th className="p-2">Método</th>
              <th className="p-2"># Ventas</th>
              <th className="p-2">Monto (S/.)</th>
            </tr>
          </thead>
          <tbody>
            {byPayment.map(r => (
              <tr key={r.method} className="border-b last:border-b-0">
                <td className="p-2">{r.method}</td>
                <td className="p-2">{r.ventas}</td>
                <td className="p-2">S/ {r.monto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}