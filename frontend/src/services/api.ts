import axios from 'axios';

// ✅ Dinamički API URL: koristi localhost za development, ali radi i sa mrežne IP
const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8000'
        : `http://${window.location.hostname}:8000`);

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
    const response = await api.post('/games/', gameData);
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