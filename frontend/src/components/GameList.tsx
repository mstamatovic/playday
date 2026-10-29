import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGames, createParticipation } from '../services/api';
import { useState, useEffect } from 'react';
import GameCard from './GameCard';

interface Game {
    id: number;
    title: string;
    description: string;
    location: string;
    address: string;
    date: string;
    duration_minutes: number;
    max_players: number;
    total_cost: number;
    status: string;
    current_players_count: number;
    current_cost_per_player: number;
}

export default function GameList() {
    const queryClient = useQueryClient();
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [formData, setFormData] = useState({
        guest_name: '',
        guest_phone: '',
        position: '',
    });

    const { data: games, isLoading } = useQuery({
        queryKey: ['games'],
        queryFn: getGames,
    });

    // ✅ NOVO: Prava mutacija za slanje prijave na backend
    const joinMutation = useMutation({
        mutationFn: createParticipation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participations'] });
            queryClient.invalidateQueries({ queryKey: ['games'] });
            setShowJoinForm(false);
            setSelectedGame(null);
            setFormData({ guest_name: '', guest_phone: '', position: '' });
            alert('Uspešno ste se prijavili! 🎉');
        },
        onError: (error: any) => {
            alert('Greška pri prijavi: ' + (error.response?.data?.detail || error.message));
        },
    });

    const handleJoin = (game: Game) => {
        setSelectedGame(game);
        setShowJoinForm(true);
    };

    // ✅ NOVO: Funkcija koja hvata submit forme i šalje podatke
    const handleJoinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGame) return;

        joinMutation.mutate({
            game_id: selectedGame.id,
            guest_name: formData.guest_name,
            guest_phone: formData.guest_phone,
            position: formData.position,
        });
    };

    // Zatvaranje modala na ESC taster
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowJoinForm(false);
                setSelectedGame(null);
            }
        };
        if (showJoinForm) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [showJoinForm]);

    if (isLoading) {
        return <div className="text-center py-20 text-zinc-500 font-mono">Učitavanje termina...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {games?.map((game: Game) => (
                    <GameCard key={game.id} game={game} onJoinClick={handleJoin} />
                ))}
            </div>

            {/* Modal za prijavu (Dark Tech stil) */}
            {selectedGame && showJoinForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">Prijavi se za termin</h3>
                                <p className="text-zinc-400 text-sm font-mono mt-1">{selectedGame.title}</p>
                            </div>
                            <button
                                onClick={() => { setShowJoinForm(false); setSelectedGame(null); }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* ✅ NOVO: Forma sada koristi onSubmit umesto onClick na dugmetu */}
                        <form onSubmit={handleJoinSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Ime i prezime *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.guest_name}
                                    onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-mono"
                                    placeholder="npr. Marko Marković"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Broj telefona *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.guest_phone}
                                    onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-mono"
                                    placeholder="+381 6x xxx xxxx"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Pozicija (opciono)</label>
                                <input
                                    type="text"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-mono"
                                    placeholder="npr. Golman"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowJoinForm(false); setSelectedGame(null); }}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 rounded-xl transition-colors text-sm border border-zinc-700"
                                >
                                    Otkaži
                                </button>
                                <button
                                    type="submit"
                                    disabled={joinMutation.isPending}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-colors shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] text-sm disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
                                >
                                    {joinMutation.isPending ? 'Slanje...' : 'Potvrdi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}