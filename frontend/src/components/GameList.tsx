import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGames, createParticipation } from '../services/api';
import { useState, useEffect } from 'react';
import GameCard from './GameCard';

// ✅ DODATO: team_a_name i team_b_name da se poklopi sa GameCard.tsx
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
    team_a_name: string;
    team_b_name: string;
}

interface GameListProps {
    onNavigateToCreate?: () => void;
}

export default function GameList({ onNavigateToCreate }: GameListProps) {
    const queryClient = useQueryClient();
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [showFullModal, setShowFullModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        guest_name: '',
        guest_phone: '',
        position: '',
        team: 'A'
    });

    const { data: games, isLoading } = useQuery({ queryKey: ['games'], queryFn: getGames });

    const joinMutation = useMutation({
        mutationFn: createParticipation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participations'] });
            queryClient.invalidateQueries({ queryKey: ['games'] });
            setShowJoinForm(false);
            setSelectedGame(null);
            setFormData({ guest_name: '', guest_phone: '', position: '', team: 'A' });
            setErrorMessage(null);
            setShowSuccessModal(true);
        },
        onError: (error: any) => {
            setErrorMessage(error.response?.data?.detail || 'Došlo je do neočekivane greške pri prijavi.');
        },
    });

    const handleJoin = (game: Game) => {
        setErrorMessage(null);
        const activePlayers = game.current_players_count;

        if (activePlayers >= game.max_players) {
            setSelectedGame(game);
            setShowJoinForm(false);
            setShowFullModal(true);
            return;
        }

        setSelectedGame(game);
        setShowJoinForm(true);
    };

    const handleJoinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGame) return;

        setErrorMessage(null);

        joinMutation.mutate({
            game_id: selectedGame.id,
            guest_name: formData.guest_name,
            guest_phone: formData.guest_phone,
            position: formData.position,
            team: formData.team,
        });
    };

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowJoinForm(false);
                setShowFullModal(false);
                setShowSuccessModal(false);
                setSelectedGame(null);
                setErrorMessage(null);
            }
        };
        if (showJoinForm || showFullModal || showSuccessModal) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [showJoinForm, showFullModal, showSuccessModal]);

    if (isLoading) return <div className="text-center py-20 text-zinc-500 font-mono animate-pulse">Učitavanje termina...</div>;

    if (!games || games.length === 0) {
        return (
            <div className="text-center py-20 animate-fade-in-up">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-white mb-2">Nema zakazanih termina</h3>
                <p className="text-zinc-400 mb-6">Trenutno nema aktivnih termina. Budite prvi koji će jedan zakazati!</p>
                <button
                    onClick={onNavigateToCreate}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]"
                >
                    Zakaži prvi termin →
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                {games?.map((game: Game) => (
                    <GameCard key={game.id} game={game} onJoinClick={handleJoin} />
                ))}
            </div>

            {selectedGame && showJoinForm && (
                <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-5 sm:p-6">
                        <div className="flex justify-between items-start mb-5">
                            <div className="min-w-0 pr-4">
                                <h3 className="text-lg sm:text-xl font-bold text-white">Prijavi se</h3>
                                <p className="text-zinc-400 text-xs sm:text-sm font-mono mt-1 truncate">{selectedGame.title}</p>
                            </div>
                            <button
                                onClick={() => { setShowJoinForm(false); setSelectedGame(null); setErrorMessage(null); }}
                                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleJoinSubmit} className="space-y-4">
                            {errorMessage && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start mb-2">
                                    <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">{errorMessage}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Ime i prezime *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.guest_name}
                                    onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-mono"
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
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-mono"
                                    placeholder="+381 6x xxx xxxx"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Pozicija (opciono)</label>
                                <input
                                    type="text"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-mono"
                                    placeholder="npr. Golman"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">Ekipa *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, team: 'A' })}
                                        className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${formData.team === 'A'
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                            }`}
                                    >
                                        {selectedGame.team_a_name || 'Ekipa A'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, team: 'B' })}
                                        className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${formData.team === 'B'
                                            ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                            }`}
                                    >
                                        {selectedGame.team_b_name || 'Ekipa B'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowJoinForm(false); setSelectedGame(null); setErrorMessage(null); }}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition-colors text-sm border border-zinc-700"
                                >
                                    Otkaži
                                </button>
                                <button
                                    type="submit"
                                    disabled={joinMutation.isPending}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] text-sm disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
                                >
                                    {joinMutation.isPending ? 'Slanje...' : 'Potvrdi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedGame && showFullModal && (
                <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8">
                        <div className="text-center">
                            <div className="text-5xl mb-4">⚠️</div>
                            <h3 className="text-xl font-bold text-white mb-4">Termin je popunjen</h3>
                            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                                Prijavljen je maksimalan broj igrača. Proverite kasnije da li je neko otkazao prijavu ili kontaktirajte organizatora.
                            </p>
                            <p className="text-zinc-400 text-xs mb-6">
                                Hvala na razumevanju.
                            </p>
                            <button
                                onClick={() => { setShowFullModal(false); setSelectedGame(null); }}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition-colors text-sm border border-zinc-700"
                            >
                                Zatvori
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="relative w-full max-w-md bg-zinc-900 border border-emerald-800/50 rounded-2xl shadow-2xl p-6 sm:p-8">
                        <div className="text-center">
                            <div className="text-5xl mb-4">✅</div>
                            <h3 className="text-xl font-bold text-white mb-4">Uspešno ste se prijavili!</h3>
                            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                                Uspešno ste se prijavili za zakazani termin. Prijavu možete otkazati najkasnije dva sata pre početka termina. Vidimo se na terenu!
                            </p>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors text-sm shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]"
                            >
                                Odlično!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}