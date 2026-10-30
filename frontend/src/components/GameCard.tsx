import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedParticipationId, setSelectedParticipationId] = useState<number | null>(null);
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
            setShowCancelModal(false);
            setSelectedParticipationId(null);
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
    const teamA = activeParticipations.filter((p: any) => p.team === 'A');
    const teamB = activeParticipations.filter((p: any) => p.team === 'B');
    const playerCount = activeParticipations.length;
    const canCancel = isCancellationAllowed(game.date);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowDetails(false);
                setShowCancelModal(false);
                setSelectedParticipationId(null);
            }
        };
        if (showDetails || showCancelModal) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [showDetails, showCancelModal]);

    const getStatusBadge = () => {
        if (game.status === 'cancelled') {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/50 text-red-400 text-[10px] sm:text-xs font-mono font-semibold border border-red-800/50">❌ OTKAZANO</span>;
        }
        if (game.status === 'confirmed' && !canCancel) {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/50 text-emerald-400 text-[10px] sm:text-xs font-mono font-semibold border border-emerald-800/50">🟢 IGRA SE</span>;
        }
        if (game.status === 'confirmed') {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/50 text-blue-400 text-[10px] sm:text-xs font-mono font-semibold border border-blue-800/50">✅ POTVRĐEN</span>;
        }
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/50 text-amber-400 text-[10px] sm:text-xs font-mono font-semibold border border-amber-800/50">⏳ ORGANIZACIJA U TOKU</span>;
    };

    const handleCancelClick = (participationId: number) => {
        setSelectedParticipationId(participationId);
        setShowCancelModal(true);
    };

    const handleConfirmCancel = () => {
        if (selectedParticipationId) {
            cancelMutation.mutate(selectedParticipationId);
        }
    };

    return (
        <>
            <div className="group relative bg-zinc-900/40 rounded-2xl border border-zinc-800 hover:border-emerald-500/40 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)] transition-all duration-300 flex flex-col h-full overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-zinc-800/50 flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{game.title}</h3>
                        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-mono truncate">{game.location}</p>
                    </div>
                    {getStatusBadge()}
                </div>

                <div className="p-4 sm:p-5 space-y-3 flex-grow">
                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                        <span className="w-5 text-center text-zinc-500">📅</span>
                        <span className="font-mono text-xs sm:text-sm">{formatDate(game.date)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                        <span className="w-5 text-center text-zinc-500">⏱️</span>
                        <span className="font-mono text-xs sm:text-sm">{game.duration_minutes} min</span>
                    </div>

                    <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-zinc-800/50 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Ukupno</p>
                            <p className="text-lg sm:text-xl font-bold text-white">{game.total_cost} <span className="text-xs sm:text-sm font-normal text-zinc-500">RSD</span></p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Po igraču</p>
                            <p className="text-lg sm:text-xl font-bold text-emerald-400">
                                {playerCount > 0 ? Math.round(game.current_cost_per_player) : '---'} <span className="text-xs sm:text-sm font-normal text-zinc-500">RSD</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-5 bg-zinc-950/30 border-t border-zinc-800/50 flex flex-col sm:flex-row gap-3">
                    <button
                        className="flex-1 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 text-sm"
                        onClick={() => setShowDetails(true)}
                    >
                        Spisak prijavljenih i napomene
                    </button>
                    <button
                        className={`flex-1 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 ${game.status === 'cancelled'
                            ? 'bg-red-900/30 text-red-400 cursor-not-allowed border border-red-800/50'
                            : !canCancel
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.6)] border border-emerald-500'
                            }`}
                        onClick={() => game.status !== 'cancelled' && canCancel && onJoinClick(game)}
                        disabled={game.status === 'cancelled' || !canCancel}
                    >
                        {game.status === 'cancelled' ? 'Otkazano' : (!canCancel ? 'Zaključan' : 'Prijavi se →')}
                    </button>
                </div>
            </div>

            {showDetails && createPortal(
                <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
                        <div className="p-5 sm:p-6">
                            <div className="flex justify-between items-start mb-5">
                                <div className="pr-4">
                                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{game.title}</h2>
                                    <p className="text-zinc-400 text-xs sm:text-sm font-mono mt-1">{game.location} • {game.address}</p>
                                </div>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 text-xs sm:text-sm font-mono">
                                <div><span className="text-zinc-500">DATUM:</span> <span className="text-zinc-200 ml-1">{formatDate(game.date)}</span></div>
                                <div><span className="text-zinc-500">TRAJANJE:</span> <span className="text-zinc-200 ml-1">{game.duration_minutes} MIN</span></div>
                                <div><span className="text-zinc-500">MAX:</span> <span className="text-zinc-200 ml-1">{game.max_players} IGRAČA</span></div>
                                <div><span className="text-zinc-500">UKUPNO:</span> <span className="text-emerald-400 ml-1">{game.total_cost} RSD</span></div>
                            </div>

                            {game.description && (
                                <div className="mb-5 sm:mb-6 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                                    <h4 className="font-mono text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest mb-2">📝 NAPOMENE</h4>
                                    <p className="text-zinc-300 text-sm leading-relaxed">{game.description}</p>
                                </div>
                            )}

                            <div className="mb-2">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-white text-sm sm:text-base">Spisak igrača <span className="text-zinc-500 font-normal font-mono text-xs">({playerCount}/{game.max_players})</span></h3>
                                    {!canCancel && (
                                        <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/30 px-2 py-1 rounded border border-red-900/50">
                                            🔒 ROK ZA IZMENE PROŠAO
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-4">
                                        <h4 className="font-bold text-blue-400 text-sm mb-3 flex items-center gap-2">
                                            <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">A</span>
                                            Ekipa A ({teamA.length})
                                        </h4>
                                        {teamA.length === 0 ? (
                                            <p className="text-zinc-500 text-xs font-mono text-center py-4">Nema igrača</p>
                                        ) : (
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {teamA.map((p: any) => (
                                                    <div key={p.id} className="flex justify-between items-center bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                                                        <div className="min-w-0 flex-1 pr-2">
                                                            <p className="font-semibold text-zinc-200 text-xs truncate">
                                                                {p.guest_name || `Korisnik #${p.user_id}`}
                                                                {p.position && <span className="text-[10px] text-zinc-500 font-mono ml-1">[{p.position}]</span>}
                                                            </p>
                                                            {p.guest_phone && <p className="text-[10px] text-zinc-500 mt-0.5 font-mono truncate">{p.guest_phone}</p>}
                                                        </div>
                                                        {canCancel && (
                                                            <button
                                                                onClick={() => handleCancelClick(p.id)}
                                                                className="flex-shrink-0 text-[10px] sm:text-xs font-mono font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 px-2 py-1 rounded transition-colors border border-transparent hover:border-red-900/50"
                                                            >
                                                                OTKAŽI
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
                                        <h4 className="font-bold text-red-400 text-sm mb-3 flex items-center gap-2">
                                            <span className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">B</span>
                                            Ekipa B ({teamB.length})
                                        </h4>
                                        {teamB.length === 0 ? (
                                            <p className="text-zinc-500 text-xs font-mono text-center py-4">Nema igrača</p>
                                        ) : (
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {teamB.map((p: any) => (
                                                    <div key={p.id} className="flex justify-between items-center bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                                                        <div className="min-w-0 flex-1 pr-2">
                                                            <p className="font-semibold text-zinc-200 text-xs truncate">
                                                                {p.guest_name || `Korisnik #${p.user_id}`}
                                                                {p.position && <span className="text-[10px] text-zinc-500 font-mono ml-1">[{p.position}]</span>}
                                                            </p>
                                                            {p.guest_phone && <p className="text-[10px] text-zinc-500 mt-0.5 font-mono truncate">{p.guest_phone}</p>}
                                                        </div>
                                                        {canCancel && (
                                                            <button
                                                                onClick={() => handleCancelClick(p.id)}
                                                                className="flex-shrink-0 text-[10px] sm:text-xs font-mono font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 px-2 py-1 rounded transition-colors border border-transparent hover:border-red-900/50"
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
                    </div>
                </div>,
                document.body
            )}

            {showCancelModal && createPortal(
                <div className="fixed top-0 left-0 right-0 bottom-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="relative w-full max-w-md bg-zinc-900 border border-red-800/50 rounded-2xl shadow-2xl p-6 sm:p-8">
                        <div className="text-center">
                            <div className="text-5xl mb-4">⚠️</div>
                            <h3 className="text-xl font-bold text-white mb-4">Otkaži prijavu?</h3>
                            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                                Da li ste sigurni da želite da otkažete svoju prijavu? Ova akcija se ne može poništiti.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowCancelModal(false); setSelectedParticipationId(null); }}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition-colors text-sm border border-zinc-700"
                                >
                                    Ne, zadrži
                                </button>
                                <button
                                    onClick={handleConfirmCancel}
                                    disabled={cancelMutation.isPending}
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-3 rounded-xl transition-colors text-sm shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
                                >
                                    {cancelMutation.isPending ? 'Otkazivanje...' : 'Da, otkaži'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}