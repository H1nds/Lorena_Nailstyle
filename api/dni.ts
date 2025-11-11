// api/dni.js
// Función serverless para Vercel que actúa como proxy hacia apiperu.dev
export default async function handler(req: any, res: any) {
    // CORS básico (permite llamadas desde tu frontend)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    try {
        // acepta tanto POST body.dni como /api/dni?dni=...
        const dni = (req.method === "GET" ? req.query.dni : req.body?.dni) || "";
        const clean = String(dni).trim();
        if (!/^\d{8}$/.test(clean)) {
            return res.status(400).json({ error: "DNI inválido" });
        }

        const API_KEY = process.env.DNI_API_KEY;
        if (!API_KEY) {
            console.warn("Advertencia: DNI_API_KEY no configurada en environment variables");
        }

        const r = await fetch("https://apiperu.dev/api/dni", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({ dni: clean }),
        });

        const json = await r.json();
        return res.status(r.status).json(json);
    } catch (err) {
        console.error("Error proxy /api/dni:", err);
        return res.status(500).json({ error: "Error en servidor proxy" });
    }
}
