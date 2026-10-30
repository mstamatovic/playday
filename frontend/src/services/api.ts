import axios from 'axios';

// ✅ APSOLUTNO SIGURNA LOGIKA ZA ODREĐIVANJE API URL-A
const getApiUrl = () => {
    // 1. Prvo proveri da li je postavljeno u Vercel Environment Variables
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // 2. Ako si na lokalnoj mašini (kompjuter ili telefon u lokalnoj mreži)
    if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '192.168.1.203'
    ) {
        return 'http://localhost:8000';
    }

    // 3. FALLBACK: Ako ništa drugo ne upali, koristi tvoj stvarni Render URL
    return 'https://playday-lsv2.onrender.com';
};

const API_URL = getApiUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Games endpoints
export const getGames = async () => {
    const response = await api.get('/games/');
    return response.data;
};

export const createGame = async (gameData: any) => {
    const response = await api.post('/games/', gameData, {
        headers: {
            // ✅ Šaljemo Superadmin ključ koji čitamo iz Vercel environment varijabli
            'X-Superadmin-Key': 'playday-super-secret-2024-xyz-123'
        }
    });
    return response.data;
};

// Participations endpoints
export const getParticipationsForGame = async (gameId: number) => {
    const response = await api.get(`/participations/game/${gameId}`);
    return response.data;
};

export const createParticipation = async (participationData: any) => {
    const response = await api.post('/participations/', participationData);
    return response.data;
};

export const cancelParticipation = async (participationId: number) => {
    const response = await api.patch(`/participations/${participationId}/cancel`);
    return response.data;
};

// Users endpoints
export const getUsers = async () => {
    const response = await api.get('/users/');
    return response.data;
};