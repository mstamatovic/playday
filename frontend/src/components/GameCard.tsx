import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getParticipationsForGame, cancelParticipation } from '../services/api';

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

interface GameCardProps {
    game: Game;
    onJoinClick: (game: Game) => void;
}

export default function GameCard({ game, onJoinClick }: GameCardProps) {
    const [showDetails, setShowDetails] = useState(false);
    const queryClient = useQueryClient();

    const { data: participations } = useQuery({
        queryKey: ['participations', game.id],
        queryFn: () => getParticipationsForGame(game.id),
    });

    const cancelMutation = useMutation({
        mutationFn: cancelParticipation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participations'] });
            queryClient.invalidateQueries({ queryKey: ['games'] });
        },
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('sr-RS', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isCancellationAllowed = (gameDate: string) => {
        const gameTime = new Date(gameDate).getTime();
        const now = new Date().getTime();
        return (gameTime - now) > 2 * 60 * 60 * 1000;
    };

    const activeParticipations = participations?.filter((p: any) => p.status !== 'declined') || [];
    const playerCount = activeParticipations.length;
    const canCancel = isCancellationAllowed(game.date);

    // ✅ NOVO: Zatvori modal na ESC taster
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowDetails(false);
            }
        };
        if (showDetails) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [showDetails]);

    const getStatusBadge = () => {
        if (game.status === 'locked') {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-400 text-xs font-mono font-semibold border border-zinc-700">🔒 LOCKED</span>;
        }
        if (game.status === 'confirmed') {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/50 text-emerald-400 text-xs font-mono font-semibold border border-emerald-800/50">✅ CONFIRMED</span>;
        }
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/50 text-amber-400 text-xs font-mono font-semibold border border-amber-800/50">⏳ PENDING</span>;
    };

    return (
        <>
            <div className="group relative bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-zinc-800 hover:border-emerald-500/40 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)] transition-all duration-300 flex flex-col h-full overflow-hidden">
                <div className="p-5 border-b border-zinc-800/50 flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{game.title}</h3>
                        <p className="text-sm text-zinc-500 mt-1 font-mono">{game.location}</p>
                    </div>
                    {getStatusBadge()}
                </div>

                <div className="p-5 space-y-4 flex-grow">
                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                        <span className="w-5 text-center text-zinc-500">📅</span>
                        <span className="font-mono">{formatDate(game.date)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                        <span className="w-5 text-center text-zinc-500">⏱️</span>
                        <span className="font-mono">{game.duration_minutes} min</span>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-800/50 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Total Cost</p>
                            <p className="text-xl font-bold text-white">{game.total_cost} <span className="text-sm font-normal text-zinc-500">RSD</span></p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Per Player</p>
                            <p className="text-xl font-bold text-emerald-400">
                                {playerCount > 0 ? Math.round(game.current_cost_per_player) : '---'} <span className="text-sm font-normal text-zinc-500">RSD</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-zinc-950/30 border-t border-zinc-800/50 flex gap-3">
                    <button
                        className="flex-1 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 text-sm"
                        onClick={() => setShowDetails(true)}
                    >
                        Detalji
                    </button>
                    <button
                        className={`flex-1 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 ${game.status === 'locked'
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.6)] border border-emerald-500'
                            }`}
                        onClick={() => game.status !== 'locked' && onJoinClick(game)}
                        disabled={game.status === 'locked'}
                    >
                        {game.status === 'locked' ? 'Zaključan' : 'Prijavi se'}
                    </button>
                </div>
            </div>

            {/* Dark Modal */}
            {showDetails && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{game.title}</h2>
                                    <p className="text-zinc-500 text-sm font-mono mt-1">{game.location} • {game.address}</p>
                                </div>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 text-sm font-mono">
                                <div><span className="text-zinc-500">DATUM:</span> <span className="text-zinc-200 ml-2">{formatDate(game.date)}</span></div>
                                <div><span className="text-zinc-500">TRAJANJE:</span> <span className="text-zinc-200 ml-2">{game.duration_minutes} MIN</span></div>
                                <div><span className="text-zinc-500">MAX IGRAČA:</span> <span className="text-zinc-200 ml-2">{game.max_players}</span></div>
                                <div><span className="text-zinc-500">UKUPNO:</span> <span className="text-emerald-400 ml-2">{game.total_cost} RSD</span></div>
                            </div>

                            {game.description && (
                                <div className="mb-6 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                                    <h4 className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-2">📝 NAPOMENE</h4>
                                    <p className="text-zinc-300 text-sm leading-relaxed">{game.description}</p>
                                </div>
                            )}

                            <div className="mb-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-white">Spisak igrača <span className="text-zinc-500 font-normal font-mono text-sm">({playerCount}/{game.max_players})</span></h3>
                                    {!canCancel && (
                                        <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/30 px-2 py-1 rounded border border-red-900/50">
                                            🔒 ROK PROŠAO
                                        </span>
                                    )}
                                </div>

                                {activeParticipations.length === 0 ? (
                                    <div className="text-center py-8 bg-zinc-950/30 rounded-xl border border-dashed border-zinc-800">
                                        <p className="text-zinc-500 text-sm font-mono">Nema prijavljenih igrača.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                        {activeParticipations.map((p: any) => (
                                            <div key={p.id} className="flex justify-between items-center bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                                                <div>
                                                    <p className="font-semibold text-zinc-200 text-sm">
                                                        {p.guest_name || `Korisnik #${p.user_id}`}
                                                        {p.position && <span className="text-xs text-zinc-500 font-mono ml-2">[{p.position}]</span>}
                                                    </p>
                                                    {p.guest_phone && <p className="text-xs text-zinc-500 mt-0.5 font-mono">{p.guest_phone}</p>}
                                                </div>

                                                {canCancel && (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Otkaži prijavu?')) {
                                                                cancelMutation.mutate(p.id);
                                                            }
                                                        }}
                                                        className="text-xs font-mono font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-900/50"
                                                    >
                                                        OTKAŽI
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}