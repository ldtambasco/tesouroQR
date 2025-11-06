import React, { useState, useEffect, useCallback } from 'react';
import SetupGame from './components/SetupGame';
import PlayGame from './components/PlayGame';
import { HuntStep } from './types';
import { TreasureMapIcon } from './components/icons';

type Mode = 'menu' | 'setup' | 'play';

const DEFAULT_QR_CODES = [
  'tesouroQR-start',
  'tesouroQR-01',
  'tesouroQR-02',
  'tesouroQR-03',
  'tesouroQR-04',
  'tesouroQR-05',
  'tesouroQR-06',
  'tesouroQR-07',
  'tesouroQR-08',
  'tesouroQR-09',
  'tesouroQR-10',
];

const DEFAULT_HUNT_STEPS: HuntStep[] = DEFAULT_QR_CODES.map((code) => ({
  id: code,
  qrCodeValue: code,
  hintImageUrl: `/QRcodes/${code}.png`,
}));

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('menu');
  const [huntSteps, setHuntSteps] = useState<HuntStep[]>([]);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('treasureHuntData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setHuntSteps(parsedData);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to load game data from local storage:", error);
    }
    setHuntSteps(DEFAULT_HUNT_STEPS);
  }, []);

  const handleSaveGame = useCallback((steps: HuntStep[]) => {
    setHuntSteps(steps);
    localStorage.setItem('treasureHuntData', JSON.stringify(steps));
    alert('Jogo salvo com sucesso!');
    setMode('menu');
  }, []);
  
  const renderContent = () => {
    switch (mode) {
      case 'setup':
        return <SetupGame initialSteps={huntSteps} onSave={handleSaveGame} onBack={() => setMode('menu')} />;
      case 'play':
        return <PlayGame huntSteps={huntSteps} onBack={() => setMode('menu')} />;
      case 'menu':
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <TreasureMapIcon className="w-24 h-24 text-amber-400 mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-amber-300 mb-4" style={{fontFamily: "'Pirata One', cursive"}}>Caça ao Tesouro QR</h1>
            <p className="text-slate-300 mb-12 max-w-md">Crie sua própria caça ao tesouro ou jogue uma já existente escaneando códigos QR para encontrar a próxima pista!</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setMode('play')}
                disabled={huntSteps.length === 0}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Iniciar Caça
              </button>
              <button
                onClick={() => setMode('setup')}
                className="bg-slate-700 hover:bg-slate-600 text-amber-300 font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105"
              >
                Configurar Jogo
              </button>
            </div>
             {huntSteps.length === 0 && <p className="text-red-400 mt-4">Nenhum jogo configurado. Vá para 'Configurar Jogo' para começar.</p>}
          </div>
        );
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-900 flex flex-col items-center justify-center overflow-auto">
      <main
        className="w-full h-full max-w-lg mx-auto bg-slate-800 shadow-2xl shadow-black/50 pb-6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
      >
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
