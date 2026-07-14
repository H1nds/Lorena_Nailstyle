import { db, initError } from './firebaseAdmin.js';

export type TokenRecord = {
    refresh_token?: string;
    scope?: string;
    token_type?: string;
    expiry_date?: number;
    access_token?: string;
    createdAt?: number;
};

const COLLECTION_NAME = 'google_calendar_tokens';

// Guarda el token asociado a un uid en Firestore
export async function saveRefreshTokenForUid(uid: string, record: TokenRecord) {
    if (!db) {
        throw new Error('Database no inicializada: ' + initError);
    }

    const base = { ...record, createdAt: Date.now() };
    try {
        await db.collection(COLLECTION_NAME).doc(uid).set(base);
        return true;
    } catch (e) {
        console.error('Error guardando token en Firestore:', e);
        throw e;
    }
}

// Obtiene el token almacenado para un uid desde Firestore
export async function getStoredTokenForUid(uid: string): Promise<TokenRecord | null> {
    if (!db) {
        console.warn('Firestore (Admin) no está inicializado. No se puede leer el token. Error: ' + initError);
        return null;
    }

    try {
        const doc = await db.collection(COLLECTION_NAME).doc(uid).get();
        if (!doc.exists) return null;
        return doc.data() as TokenRecord;
    } catch (e) {
        console.error('Error leyendo token desde Firestore:', e);
        return null;
    }
}

// Elimina el token para un uid específico en Firestore
export async function deleteTokenForUid(uid: string): Promise<boolean> {
    if (!db) {
        throw new Error('Database no inicializada: ' + initError);
    }

    try {
        await db.collection(COLLECTION_NAME).doc(uid).delete();
        return true;
    } catch (e) {
        console.error('Error eliminando token de Firestore:', e);
        throw e;
    }
}
