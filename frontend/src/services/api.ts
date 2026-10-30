import axios from 'axios';

// 1. Dinamičko određivanje API URL-a
const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '192.168.1.203'
    ) {
        return 'http://localhost:8000';
    }
    return 'https://playday-lsv2.onrender.com';
};

const API_URL = getApiUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. GET Games (OVO JE NEDOSTAJALO I PRAVILO GREŠKU)
export const getGames = async () => {
    const response = await api.get('/games/');
    return response.data;
};

export const createGame = async (gameData: any) => {
    let dateToSend = gameData.date;

    // Uvek kreiraj Date objekat i dodaj eksplicitan timezone offset
    const dateObj = new Date(dateToSend);

    // Dobij komponente datuma
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    // Dobij lokalni timezone offset
    const offset = -dateObj.getTimezoneOffset(); // Za nas je ovo +60 ili +120 minuta
    const offsetSign = offset >= 0 ? '+' : '-';
    const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
    const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');

    // Napravi ISO string sa eksplicitnim offset-om
    // Primer: "2026-11-02T15:00:00+01:00"
    dateToSend = `${year}-${month}-${day}T${hours}:${minutes}:00${offsetSign}${offsetHours}:${offsetMinutes}`;

    const response = await api.post('/games/', {
        ...gameData,
        date: dateToSend
    }, {
        headers: {
            'X-Superadmin-Key': 'playday-super-secret-2024-xyz-123'
        }
    });
    return response.data;
};

// 4. Ostale funkcije (da ne bi pucale druge komponente)
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