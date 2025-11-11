// api/calendar/create-event.ts
import { google } from 'googleapis';
import { createGoogleClient } from '../lib/googleClient.js';
import { getStoredTokenForUid } from '../lib/tokenStore.js';

// --- INICIO: Función helper para calcular la fecha final ---
/**
 * Para eventos "allDay", Google requiere que la fecha final sea exclusiva.
 * Si el evento es "2025-11-11", la fecha final debe ser "2025-11-12".
 * Esta función calcula eso de forma segura, evitando problemas de zona horaria.
 */
function getEndDateForAllday(dateString: string): string {
    // Parsea la fecha como UTC para evitar que la zona horaria local
    // (ej. -05:00) haga que la fecha retroceda un día.
    const [year, month, day] = dateString.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, day));

    // Añade un día (en UTC)
    startDate.setUTCDate(startDate.getUTCDate() + 1);

    // Devuelve en formato YYYY-MM-DD
    return startDate.toISOString().slice(0, 10);
}
// --- FIN: Función helper ---
function getEndTime(isoDateTime: string, minutes: number = 60): string {
    try {
        const startDate = new Date(isoDateTime);
        startDate.setMinutes(startDate.getMinutes() + minutes);
        // Devuelve un ISO string (ej. 2025-11-11T15:00:00.000Z)
        // que la API de Google Calendar acepta.
        return startDate.toISOString();
    } catch (e) {
        // Fallback: si la fecha es inválida, solo devuelve la de inicio
        return isoDateTime;
    }
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const uid = req.body?.uid || req.query?.uid || 'anonymous';

    try {
        const tokenRecord = await getStoredTokenForUid(uid);
        if (!tokenRecord?.refresh_token) return res.status(400).json({ error: 'No refresh token. Authorize first.' });

        const { oauth2Client } = await createGoogleClient(tokenRecord.refresh_token);

        // NOTA: Esta línea es redundante, createGoogleClient ya hizo esto.
        // oauth2Client.setCredentials({ refresh_token: tokenRecord.refresh_token });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const { saleId, dateService, title, description, allDay } = req.body as {
            saleId: string; dateService: string; title: string; description?: string; allDay: boolean; // allDay viene del form
        };

        if (!dateService || !title) return res.status(400).json({ error: 'Missing event data' });

        // --- INICIO: Lógica Corregida ---
        const event: any = allDay
            ? {
                summary: title,
                description,
                start: { date: dateService },
                end: { date: getEndDateForAllday(dateService) }
            }
            : {
                summary: title,
                description,
                start: { dateTime: new Date(dateService).toISOString() }, // <--- CORREGIDO
                end: { dateTime: getEndTime(dateService, 60) }
            };
        // --- FIN: Lógica Corregida ---

        const calendarId = 'primary';
        const insertRes = await calendar.events.insert({
            calendarId,
            requestBody: event
        });

        return res.status(200).json({ ok: true, event: insertRes.data });
    } catch (err: any) {
        console.error('create-event error', err);
        // Si el error viene de Google, 'err.errors' suele tener más detalles
        const googleErrors = (err as any).errors;
        if (googleErrors) {
            console.error('Detalle del error de Google:', googleErrors);
            return res.status(500).json({ error: 'Error de la API de Google', details: googleErrors });
        }
        return res.status(500).json({ error: err?.message || 'create-event failed' });
    }
}