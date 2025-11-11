// api/calendar/create-event.ts
import { google } from 'googleapis';
import { createGoogleClient } from '../lib/googleClient';
import { getStoredTokenForUid } from '../lib/tokenStore.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const uid = req.body?.uid || req.query?.uid || 'anonymous';

    try {
        const tokenRecord = await getStoredTokenForUid(uid);
        if (!tokenRecord?.refresh_token) return res.status(400).json({ error: 'No refresh token. Authorize first.' });

        // createGoogleClient espera refresh token - devuelve oauth2 client y google
        const { oauth2Client } = await createGoogleClient(tokenRecord.refresh_token);

        // refrescamos credenciales y creamos calendario
        oauth2Client.setCredentials({ refresh_token: tokenRecord.refresh_token });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const { saleId, dateService, title, description, allDay } = req.body as {
            saleId: string; dateService: string; title: string; description?: string; allDay?: boolean;
        };

        if (!dateService || !title) return res.status(400).json({ error: 'Missing event data' });

        const event: any = allDay
            ? {
                summary: title,
                description,
                start: { date: dateService },
                end: { date: dateService }
            }
            : {
                summary: title,
                description,
                start: { dateTime: dateService },
                end: { dateTime: dateService }
            };

        const calendarId = 'primary';
        const insertRes = await calendar.events.insert({
            calendarId,
            requestBody: event
        });

        return res.status(200).json({ ok: true, event: insertRes.data });
    } catch (err: any) {
        console.error('create-event error', err);
        return res.status(500).json({ error: err?.message || 'create-event failed' });
    }
}