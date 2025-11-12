// api/calendar/disconnect.ts
import { deleteTokenForUid } from '../lib/tokenStore.js'; // <- Nota el .js

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    try {
        const uid = req.body?.uid;
        if (!uid) {
            return res.status(400).json({ error: "Missing uid" });
        }

        await deleteTokenForUid(uid);

        return res.status(200).json({ ok: true, message: 'Token deleted' });

    } catch (e: any) {
        console.error("Error en /api/calendar/disconnect:", e);
        return res.status(500).json({ ok: false, error: "Internal server error" });
    }
}