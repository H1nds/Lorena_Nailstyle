// api/lib/tokenStore.ts
import fs from 'fs';
import path from 'path';

const STORE_PATH = process.env.TOKEN_STORE_PATH || path.join(process.cwd(), 'tokens.json');

export type TokenRecord = {
    refresh_token?: string;
    scope?: string;
    token_type?: string;
    expiry_date?: number;
    access_token?: string;
    createdAt?: number;
};

// Guarda el token asociado a un uid (objeto tokens: { [uid]: TokenRecord })
export async function saveRefreshTokenForUid(uid: string, record: TokenRecord) {
    const base = { ...record, createdAt: Date.now() };
    try {
        let data: Record<string, TokenRecord> = {};
        if (fs.existsSync(STORE_PATH)) {
            const raw = fs.readFileSync(STORE_PATH, 'utf-8');
            data = raw ? JSON.parse(raw) : {};
        }
        data[uid] = base;
        fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error('Error saving token', e);
        throw e;
    }
}

// Obtiene el token almacenado para un uid
export async function getStoredTokenForUid(uid: string): Promise<TokenRecord | null> {
    try {
        if (!fs.existsSync(STORE_PATH)) return null;
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        if (!raw) return null;
        const data: Record<string, TokenRecord> = JSON.parse(raw);
        return data[uid] ?? null;
    } catch (e) {
        console.error('Error reading token store', e);
        return null;
    }
}

// Elimina el token para un uid específico
export async function deleteTokenForUid(uid: string): Promise<boolean> {
    try {
        let data: Record<string, TokenRecord> = {};
        if (fs.existsSync(STORE_PATH)) {
            const raw = fs.readFileSync(STORE_PATH, 'utf-8');
            data = raw ? JSON.parse(raw) : {};
        }

        // Si el usuario existe en el JSON, elimínalo
        if (data[uid]) {
            delete data[uid];
            // Escribe el archivo de vuelta sin el usuario
            fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
        }

        return true;
    } catch (e) {
        console.error('Error deleting token', e);
        throw e;
    }
}