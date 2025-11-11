// src/utils.ts

/** Genera un ID único opcionalmente con prefijo. */
export const uid = (prefix: string = ''): string => {
    const random = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}${random}` : random;
};

// --- INICIO DE LA CORRECCIÓN ---

// Un tipo simple para las propiedades que necesitamos de la Venta
type SaleCalcInput = {
    quantity: number;
    unitPrice: number;
    percentNailer?: number; // percentNailer puede estar en el objeto principal
};

/** Calcula el subtotal de una venta (usa un solo objeto como argumento). */
export const calcSubtotal = (s: SaleCalcInput): number => {
    if (!s) return 0;
    // Usamos 'quantity' y 'unitPrice' en lugar de 'cantidad' y 'precio'
    const cantidad = Number(s.quantity) || 0;
    const precio = Number(s.unitPrice) || 0;
    return cantidad * precio;
};

/** Calcula el total para el nailer (o retorna 0 si no existe). */
export const calcTotalNailer = (s: SaleCalcInput): number => {
    if (!s) return 0;
    // 1. Calculamos el subtotal
    const subtotal = calcSubtotal(s); // Reutilizamos la función anterior

    // 2. Calculamos el porcentaje
    const percent = Number(s.percentNailer) || 0;

    // 3. Devolvemos el monto del nailer
    return subtotal * (percent / 100);
};