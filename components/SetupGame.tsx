import React, { useState } from 'react';
import { HuntStep } from '../types';
import { PlusIcon, TrashIcon, SaveIcon, ArrowLeftIcon } from './icons';

interface SetupGameProps {
  initialSteps: HuntStep[];
  onSave: (steps: HuntStep[]) => void;
  onBack: () => void;
}

const PREDEFINED_QR_CODES = [
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

const SetupGame: React.FC<SetupGameProps> = ({ initialSteps, onSave, onBack }) => {
  const [steps, setSteps] = useState<HuntStep[]>(initialSteps);

  const handleStepChange = (index: number, field: keyof Omit<HuntStep, 'id'>, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, { id: Date.now().toString(), qrCodeValue: '', hintImageUrl: '' }]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };
  
  const handleSave = () => {
    if (steps.some(step => !step.qrCodeValue || !step.hintImageUrl)) {
      alert('Por favor, preencha todos os campos antes de salvar.');
      return;
    }
    onSave(steps);
  };

  return (
    <div className="flex flex-col h-full p-4 bg-slate-800">
      <header className="flex items-center mb-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 mr-4">
            <ArrowLeftIcon className="w-6 h-6 text-amber-400" />
        </button>
        <h1 className="text-2xl font-bold text-amber-300">Configurar Jogo</h1>
      </header>
      
      <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 mb-4">
        <h2 className="text-lg font-semibold text-amber-300 mb-2">Valores dos QR Codes disponíveis</h2>
        <p className="text-slate-300 text-sm mb-3">
          Use os códigos abaixo ao preencher o campo "Valor do QR Code" para combinar com as imagens em <code>QRcodes/</code>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PREDEFINED_QR_CODES.map((code) => (
            <div key={code} className="flex items-center justify-between bg-slate-800 border border-slate-600 rounded px-3 py-2">
              <span className="text-slate-200 text-sm font-mono">{code}</span>
              <span className="text-slate-400 text-xs">{code}.png</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="bg-slate-700 p-4 rounded-lg shadow-md border border-slate-600">
            <h2 className="text-lg font-semibold text-amber-400 mb-2">Pista {index + 1}</h2>
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                placeholder="Valor do QR Code (ex: 'pista1')"
                value={step.qrCodeValue}
                onChange={(e) => handleStepChange(index, 'qrCodeValue', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="URL da Imagem da Pista"
                value={step.hintImageUrl}
                onChange={(e) => handleStepChange(index, 'hintImageUrl', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <button onClick={() => removeStep(index)} className="mt-2 text-red-400 hover:text-red-300 flex items-center">
              <TrashIcon className="w-4 h-4 mr-1"/>
              Remover
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between">
        <button onClick={addStep} className="flex items-center justify-center bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg">
          <PlusIcon className="w-5 h-5 mr-2" />
          Adicionar Pista
        </button>
        <button onClick={handleSave} className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2 px-4 rounded-lg">
          <SaveIcon className="w-5 h-5 mr-2" />
          Salvar
        </button>
      </div>
    </div>
  );
};

export default SetupGame;
