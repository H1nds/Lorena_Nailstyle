// src/utils.ts

/** Genera un ID único opcionalmente con prefijo. */
export const uid = (prefix: string = ''): string => {
    const random = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}${random}` : random;
};

/** Calcula el subtotal de una venta (usa un solo objeto como argumento). */
export const calcSubtotal = (s: { cantidad: number; precio: number }): number => {
    if (!s) return 0;
    const cantidad = Number(s.cantidad) || 0;
    const precio = Number(s.precio) || 0;
    return cantidad * precio;
};

/** Calcula el total de una venta (o retorna 0 si no existe). */
export const calcTotalNailer = (s: { total: number }): number => {
    return Number(s.total) || 0;
};
