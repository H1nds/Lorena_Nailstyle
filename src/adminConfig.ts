// src/adminConfig.ts

export const ADMIN_EMAIL = "josymar.briceno@fbcisac.com";

export const DEFAULT_PERMISSIONS = {
    canEditSales: true,    // Empleado puede editar ventas
    canDeleteSales: false, // Empleado puede borrar ventas
    canSeeTotals: false,   // Empleado puede ver dinero total (Indicadores)
    canDownloadReport: false // Empleado puede descargar reportes (Futuro)
};