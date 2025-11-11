// api/auth/callback.ts
import { OAuth2Client } from 'google-auth-library';
import { URLSearchParams } from 'url';
import { saveRefreshTokenForUid } from '../lib/tokenStore.js';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

// Este endpoint debe ser exactamente el REDIRECT_URI que pusiste en Google Console
export default async function handler(req: any, res: any) {
    try {
        const { code, state } = req.query; // state contendrá el UID (si lo enviaste)
        if (!code) return res.status(400).send('Missing code from Google OAuth');

        const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
        const r = await oauth2Client.getToken(code as string);
        const tokens = r.tokens || {};

        // Si el front pasó state con uid, lo usamos; sino puedes mapearlo manualmente.
        const uid = state || (req.query?.uid ?? '');

        if (!uid) {
            console.warn('No uid in state — saving token to "anonymous"');
        }

        const targetUid = uid || 'anonymous';

        await saveRefreshTokenForUid(targetUid, {
            refresh_token: tokens.refresh_token,
            scope: tokens.scope,
            token_type: tokens.token_type,
            expiry_date: tokens.expiry_date,
            access_token: tokens.access_token
        });

        // redirigir a la app (front). Cambia la URL si tu SPA corre en otro puerto/ruta
        const FRONT_URL = process.env.FRONTEND_SUCCESS_REDIRECT || '/';
        res.writeHead(302, { Location: FRONT_URL });
        res.end();
    } catch (err: any) {
        console.error('callback error', err);
        res.status(500).json({ error: err?.message || 'callback failed' });
    }
}