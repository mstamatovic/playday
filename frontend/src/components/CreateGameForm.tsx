import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGame } from '../services/api';

interface CreateGameFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CreateGameForm({ onSuccess, onCancel }: CreateGameFormProps) {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        address: '',
        date: '',
        duration_minutes: 90,
        max_players: 14,
        total_cost: 0,
    });

    const mutation = useMutation({
        mutationFn: createGame,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
            setFormData({ title: '', description: '', location: '', address: '', date: '', duration_minutes: 90, max_players: 14, total_cost: 0 });
            onSuccess();
        },
        onError: (error: any) => {
            alert('Greška: ' + (error.response?.data?.detail || error.message));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ ...formData, organizer_id: 1 });
    };

    const inputClass = "w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 text-sm font-mono";
    const labelClass = "block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5";

    // ✅ NOVO: Helper funkcija za number inpute koja automatski selektuje tekst na focus
    const handleNumberFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    return (
        <div className="max-w-3xl mx-auto bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-zinc-800 p-6 sm:p-8">
            <div className="mb-8 border-b border-zinc-800 pb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">Zakaži novi termin</h2>
                <p className="text-zinc-500 text-sm font-mono mt-2">// Popuni podatke ispod da kreiraš novi termin.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Naslov *</label>
                        <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder="npr. Rekreativni Četvrtak" />
                    </div>
                    <div>
                        <label className={labelClass}>Lokacija *</label>
                        <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputClass} placeholder="npr. Dvorana TRK" />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Adresa</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} placeholder="npr. Ulica Sportova bb" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelClass}>Datum i vreme *</label>
                        <input type="datetime-local" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Trajanje (min) *</label>
                        <input
                            type="number"
                            required
                            value={formData.duration_minutes}
                            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                            onFocus={handleNumberFocus} // ✅ NOVO
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Max igrača *</label>
                        <input
                            type="number"
                            required
                            value={formData.max_players}
                            onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) || 0 })}
                            onFocus={handleNumberFocus} // ✅ NOVO
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Ukupna cena (RSD) *</label>
                    <input
                        type="number"
                        required
                        value={formData.total_cost}
                        onChange={(e) => setFormData({ ...formData, total_cost: parseInt(e.target.value) || 0 })}
                        onFocus={handleNumberFocus} // ✅ NOVO
                        className={inputClass}
                        placeholder="5000"
                    />
                    <p className="text-[10px] text-zinc-500 font-mono mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Cena po igraču se automatski preračunava na osnovu broja prijava.
                    </p>
                </div>

                <div>
                    <label className={labelClass}>Opis / Napomene</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className={`${inputClass} resize-none`} placeholder="Dodatne informacije..." />
                </div>

                <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 px-6 rounded-xl transition-all duration-200 border border-zinc-700 text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                        ← Nazad na termine
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                    >
                        {mutation.isPending ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Procesiranje...
                            </>
                        ) : (
                            'Zakaži termin →'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}