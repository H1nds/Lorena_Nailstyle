import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.DNI_API_KEY;
if (!API_KEY) console.warn('Advertencia: DNI_API_KEY no configurada en .env del servidor');

app.post('/api/dni', async (req, res) => {
    try {
        const { dni } = req.body;
        if (!dni || !/^\d{8}$/.test(dni)) return res.status(400).json({ error: 'DNI inválido' });

        const r = await fetch('https://apiperu.dev/api/dni', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({ dni }),
        });

        const json = await r.json();
        return res.status(r.status).json(json);
    } catch (err) {
        console.error('Error proxy /api/dni:', err);
        return res.status(500).json({ error: 'Error en servidor proxy' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Proxy DNI corriendo en http://localhost:${PORT}`));