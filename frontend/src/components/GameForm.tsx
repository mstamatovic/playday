import React, { useState } from 'react';

// Definišemo interfejs na osnovu onoga što je agent video u game.py shemi
export interface GameFormData {
    title: string;
    description: string;
    location: string;
    address: string;
    date: string;
    duration_minutes: number;
    max_players: number;
    cost_per_player: number;
    organizer_id: number; // Dodato jer backend ovo zahteva
}

interface GameFormProps {
    onSave: (data: GameFormData) => void;
    organizerId: number;
}

const GameForm: React.FC<GameFormProps> = ({ onSave, organizerId }) => {
    const [game, setGame] = useState<GameFormData>({
        title: '',
        description: '',
        location: '',
        address: '',
        date: '',
        duration_minutes: 90,
        max_players: 14,
        cost_per_player: 0,
        organizer_id: organizerId,
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSave(game); // Pozivamo funkciju koju smo dobili iz App.tsx
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-primary mb-6">⚽ Kreiraj novi termin</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Naslov */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">Naslov termina</label>
                        <input type="text" required value={game.title} onChange={(e) => setGame({ ...game, title: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="npr. Rekreativni fudbal Četvrtak" />
                    </div>

                    {/* Lokacija */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">Lokacija (naziv terena)</label>
                        <input type="text" required value={game.location} onChange={(e) => setGame({ ...game, location: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="npr. Terkzijska rampa" />
                    </div>
                </div>

                {/* Adresa i Datum */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">Adresa</label>
                        <input type="text" value={game.address} onChange={(e) => setGame({ ...game, address: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="npr. Zlatibor" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">Datum i vreme</label>
                        <input type="datetime-local" required value={game.date} onChange={(e) => setGame({ ...game, date: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                </div>

                {/* Brojke */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">Trajanje (min)</label>
                        <input type="number" required value={game.duration_minutes} onChange={(e) => setGame({ ...game, duration_minutes: parseInt(e.target.value) || 0 })} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">Max igrača</label>
                        <input type="number" required value={game.max_players} onChange={(e) => setGame({ ...game, max_players: parseInt(e.target.value) || 0 })} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">Cena po igraču (RSD)</label>
                        <input type="number" value={game.cost_per_player} onChange={(e) => setGame({ ...game, cost_per_player: parseInt(e.target.value) || 0 })} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                </div>

                {/* Opis */}
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1">Opis / Napomene</label>
                    <textarea value={game.description} onChange={(e) => setGame({ ...game, description: e.target.value })} rows={3} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Dodatne informacije za igrače..." />
                </div>

                {/* Dugme */}
                <button type="submit" className="w-full bg-primary hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 mt-4">
                    Sačuvaj termin
                </button>
            </form>
        </div>
    );
};

export default GameForm;