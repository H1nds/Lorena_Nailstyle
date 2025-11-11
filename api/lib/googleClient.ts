// api/lib/googleClient.ts
import { google } from 'googleapis';

export async function createGoogleClient(refreshToken: string) {
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    // Intentamos obtener access token (force refresh)
    try {
        await oauth2Client.getAccessToken();
        return { google, oauth2Client };
    } catch (e) {
        console.error('createGoogleClient getAccessToken error', e);
        throw e;
    }
}