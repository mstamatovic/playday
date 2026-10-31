import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Navigation from './components/Navigation';
import GameList from './components/GameList';
import CreateGameForm from './components/CreateGameForm';

const queryClient = new QueryClient();

function App() {
  const [activeTab, setActiveTab] = useState('games');

  const renderContent = () => {
    switch (activeTab) {
      case 'games':
        // ✅ Prosleđujemo funkciju koja menja tab na 'create'
        return <GameList onNavigateToCreate={() => setActiveTab('create')} />;
      case 'create':
        return <CreateGameForm onSuccess={() => setActiveTab('games')} onCancel={() => setActiveTab('games')} />;
      default:
        return <GameList onNavigateToCreate={() => setActiveTab('create')} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
        <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 text-lg sm:text-xl shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
                    ⚽
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Playday</h1>
                    {/* ✅ ISPRAVKA: Uklonjeno 'hidden sm:block' da bi se videlo i na mobilnom */}
                    <p className="text-[10px] sm:text-xs text-zinc-500 font-mono tracking-wide leading-tight">
                      ISTINSKI MAJSTORI FUDBALA IGRAJU NA ZLATIBORU
                    </p>
                  </div>
                </div>
              </div>
              <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
          {renderContent()}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;