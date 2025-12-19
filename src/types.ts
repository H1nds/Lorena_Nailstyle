export type Sale = {
    id: string;
    dateService: string; // YYYY-MM-DD
    nailer: string;
    serviceType: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    paymentMethod: string;
    percentNailer: number; // 0-100
    city: string;
    createdAt: string;
    advance: number; // Adelanto
    balance: number; // Saldo Pendiente
};

export type Client = {
    id: string;
    dni: string;
    phone: string;
    nombres: string;
    apellidos: string;
    createdAt: string;
};

export type NavKey = "ventas" | "clientes" | "compras";

export type Purchase = {
    id: string;
    date: string;          // Fecha de compra
    productName: string;   // Nombre del producto/servicio
    category: string;      // Insumos, Mobiliario, Servicios, etc.
    supplier: string;      // Proveedor (ej: "Distribuidora Lima", "Enel")
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
    createdAt: string;
};