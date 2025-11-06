import React, { useState, useEffect } from 'react';
import { HuntStep } from '../types';
import QRCodeScanner from './QRCodeScanner';
import { CameraIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon, TrophyIcon } from './icons';

interface PlayGameProps {
  huntSteps: HuntStep[];
  onBack: () => void;
}

type Feedback = {
  type: 'success' | 'error';
  message: string;
};

const PlayGame: React.FC<PlayGameProps> = ({ huntSteps, onBack }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [gameFinished, setGameFinished] = useState(false);

  const currentStep = huntSteps[currentStepIndex];

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);
  
  const handleScan = (data: string) => {
    setIsScanning(false);
    if (data === currentStep.qrCodeValue) {
      if (currentStepIndex < huntSteps.length - 1) {
        setFeedback({ type: 'success', message: 'Correto! Próxima pista...' });
        setCurrentStepIndex(prev => prev + 1);
      } else {
        setFeedback({ type: 'success', message: 'Parabéns!' });
        setGameFinished(true);
      }
    } else {
      setFeedback({ type: 'error', message: 'QR Code errado. Tente novamente.' });
    }
  };

  const resetGame = () => {
    setCurrentStepIndex(0);
    setGameFinished(false);
    setFeedback(null);
  }

  if (gameFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-800">
        <TrophyIcon className="w-24 h-24 text-amber-400 mb-4" />
        <h1 className="text-3xl font-bold text-amber-300 mb-2">Tesouro Encontrado!</h1>
        <p className="text-slate-300 mb-8">Você completou a caça ao tesouro. Parabéns!</p>
        <button
          onClick={resetGame}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-6 rounded-lg"
        >
          Jogar Novamente
        </button>
         <button onClick={onBack} className="mt-4 text-slate-400 hover:text-amber-300">
          Voltar ao Menu
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-800">
      <header className="flex items-center p-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 mr-4">
            <ArrowLeftIcon className="w-6 h-6 text-amber-400" />
        </button>
        <h1 className="text-xl font-bold text-amber-300">Pista {currentStepIndex + 1} de {huntSteps.length}</h1>
      </header>

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full aspect-w-4 aspect-h-3 bg-slate-900 rounded-lg overflow-hidden shadow-lg border-4 border-amber-800/50">
          {currentStep?.hintImageUrl ? (
            <img src={currentStep.hintImageUrl} alt={`Hint ${currentStepIndex + 1}`} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-slate-500">
                <p>Imagem da pista não disponível.</p>
             </div>
          )}
        </div>
      </div>
      
      {feedback && (
        <div className={`mx-4 mb-2 p-3 rounded-lg flex items-center ${feedback.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
          {feedback.type === 'success' ? <CheckCircleIcon className="w-6 h-6 mr-2"/> : <XCircleIcon className="w-6 h-6 mr-2"/>}
          {feedback.message}
        </div>
      )}

      <div className="p-4">
        <button
          onClick={() => setIsScanning(true)}
          className="w-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          <CameraIcon className="w-6 h-6 mr-3" />
          Escanear QR Code
        </button>
      </div>
      
      {isScanning && <QRCodeScanner onScan={handleScan} onClose={() => setIsScanning(false)} />}
    </div>
  );
};

export default PlayGame;
