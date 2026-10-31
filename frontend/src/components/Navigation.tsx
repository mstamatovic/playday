interface NavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
    const tabs = [
        { id: 'games', label: 'Dostupni Termini', icon: '📅' },
        { id: 'create', label: 'Zakaži termin', icon: '➕' },
    ];

    return (
        <nav className="flex space-x-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab.id
                        ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                        }`}
                >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}