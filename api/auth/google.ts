// api/auth/google.ts
import { URLSearchParams } from 'url';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export default function handler(req: any, res: any) {
    // opcional: el front puede enlazar /api/auth/google?uid=<UID>
    const uid = (req.query?.uid || req.url?.split('?uid=')?.[1]) || '';

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        access_type: 'offline',
        include_granted_scopes: 'true',
        prompt: 'consent',
        scope: 'https://www.googleapis.com/auth/calendar.events',
        // ponemos el uid en "state" para recuperarlo en el callback
        state: uid
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.writeHead(302, { Location: url });
    res.end();
}