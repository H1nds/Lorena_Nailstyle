import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export let initError = '';

if (!getApps().length) {
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!serviceAccount) {
            initError = 'Falta FIREBASE_SERVICE_ACCOUNT en variables de entorno de Vercel.';
            console.warn(initError);
        } else {
            // Parsear la clave desde la variable de entorno
            const credentials = JSON.parse(serviceAccount);
            
            initializeApp({
                credential: cert(credentials)
            });
        }
    } catch (error: any) {
        initError = 'Error inicializando Firebase Admin: ' + error.message;
        console.error(initError, error);
    }
}

export const db = getApps().length ? getFirestore() : null;
