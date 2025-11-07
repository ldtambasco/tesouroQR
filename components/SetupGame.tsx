import React, { useEffect, useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HuntStep } from '../types';
import { PlusIcon, SaveIcon, ArrowLeftIcon } from './icons';

interface SetupGameProps {
  initialSteps: HuntStep[];
  onSave: (steps: HuntStep[]) => void;
  onBack: () => void;
}

const PREDEFINED_QR_CODES = Array.from({ length: 10 }, (_, index) => {
  const stepNumber = index + 1;
  return `tesouroQR-${stepNumber.toString().padStart(2, '0')}`;
});

const MAX_PISTAS = PREDEFINED_QR_CODES.length;

const getDefaultHintForCode = () => '';

const formatQrCodeForIndex = (index: number) =>
  PREDEFINED_QR_CODES[index] ?? `tesouroQR-${(index + 1).toString().padStart(2, '0')}`;

const resequenceSteps = (inputSteps: HuntStep[]): HuntStep[] =>
  inputSteps.map((step, index) => ({
    ...step,
    qrCodeValue: formatQrCodeForIndex(index),
  }));

const buildInitialSteps = (inputSteps: HuntStep[]): HuntStep[] => {
  if (!inputSteps.length) {
    return PREDEFINED_QR_CODES.map((code, index) => ({
      id: `${code}-${Date.now()}-${index}`,
      qrCodeValue: code,
      hintImageUrl: getDefaultHintForCode(),
    }));
  }

  const trimmed = inputSteps.slice(0, MAX_PISTAS).map((step, index) => ({
    id: step.id || `${formatQrCodeForIndex(index)}-${Date.now()}-${index}`,
    hintImageUrl: sanitizeHint(step.hintImageUrl),
    qrCodeValue: step.qrCodeValue,
  }));

  return resequenceSteps(trimmed);
};

const sanitizeHint = (value?: string) => {
  if (!value) {
    return getDefaultHintForCode();
  }
  if (value.includes('/QRcodes/tesouroQR')) {
    return getDefaultHintForCode();
  }
  return value;
};

const SetupGame: React.FC<SetupGameProps> = ({ initialSteps, onSave, onBack }) => {
  const preparedInitialSteps = useMemo(() => buildInitialSteps(initialSteps), [initialSteps]);
  const [steps, setSteps] = useState<HuntStep[]>(preparedInitialSteps);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  useEffect(() => {
    setSteps(resequenceSteps(preparedInitialSteps));
  }, [preparedInitialSteps]);

  const updateSteps = (updater: (prev: HuntStep[]) => HuntStep[]) => {
    setSteps((prev) => resequenceSteps(updater(prev)));
  };

  const addStep = (openPicker = false) => {
    if (steps.length >= MAX_PISTAS) {
      alert('Você já atingiu o número máximo de pistas disponíveis.');
      return;
    }
    const nextIndex = steps.length;
    const code = formatQrCodeForIndex(nextIndex);
    const newStep: HuntStep = {
      id: `${code}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      qrCodeValue: code,
      hintImageUrl: getDefaultHintForCode(),
    };
    updateSteps((prev) => [...prev, newStep]);
    if (openPicker) {
      setTimeout(() => selectImageFromDevice(nextIndex), 150);
    }
  };

  const selectImageFromDevice = async (index: number) => {
    const updateStepImage = (dataUrl: string) => {
      updateSteps((prev) => {
        if (!prev[index]) {
          return prev;
        }
        const updated = [...prev];
        updated[index] = { ...updated[index], hintImageUrl: dataUrl };
        return updated;
      });
    };

    if (Capacitor.isNativePlatform()) {
      try {
        const permission = await Camera.checkPermissions();
        if (permission.photos !== 'granted' && permission.photos !== 'limited') {
          const request = await Camera.requestPermissions({ permissions: ['photos'] });
          if (request.photos !== 'granted' && request.photos !== 'limited') {
            alert('Permissão de acesso às fotos negada. Atualize as permissões do aplicativo.');
            return;
          }
        }

        const photo = await Camera.getPhoto({
          source: CameraSource.Photos,
          resultType: CameraResultType.DataUrl,
          quality: 85,
          allowEditing: false,
        });

        if (photo?.dataUrl) {
          updateStepImage(photo.dataUrl);
        }
      } catch (error) {
        console.error('Erro ao selecionar imagem:', error);
        alert('Não foi possível carregar a imagem da galeria.');
      }
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          updateStepImage(result);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSave = () => {
    if (!steps.length) {
      alert('Adicione pelo menos uma pista antes de salvar.');
      return;
    }
    if (steps.some(step => !step.qrCodeValue || !step.hintImageUrl)) {
      alert('Por favor, preencha todos os campos antes de salvar.');
      return;
    }
    onSave(steps);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = steps.findIndex((step) => step.id === active.id);
    const newIndex = steps.findIndex((step) => step.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    updateSteps((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  return (
    <div className="flex flex-col h-full p-4 bg-slate-800">
      <header className="flex items-center mb-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 mr-4">
            <ArrowLeftIcon className="w-6 h-6 text-amber-400" />
        </button>
        <h1 className="text-2xl font-bold text-amber-300">Configurar Jogo</h1>
      </header>
      <div className="flex-grow overflow-y-auto pr-1 space-y-6">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={steps.map((step) => step.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-wrap items-center gap-3">
              {steps.map((step, index) => (
                <SortablePistaCard
                  key={step.id}
                  step={step}
                  index={index}
                  onSelectImage={() => selectImageFromDevice(index)}
                />
              ))}
              <button
                type="button"
                onClick={() => addStep(true)}
                className="w-32 h-40 border-2 border-dashed border-amber-400/60 rounded-2xl flex flex-col items-center justify-center text-amber-300 hover:bg-slate-700/40 transition"
              >
                <PlusIcon className="w-8 h-8 mb-2" />
                Adicionar Pista
              </button>
            </div>
          </SortableContext>
        </DndContext>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end">
        <button onClick={handleSave} className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2 px-6 rounded-lg">
          <SaveIcon className="w-5 h-5 mr-2" />
          Salvar ordem
        </button>
      </div>
    </div>
  );
};

interface SortablePistaCardProps {
  step: HuntStep;
  index: number;
  onSelectImage: () => void;
}

const SortablePistaCard: React.FC<SortablePistaCardProps> = ({ step, index, onSelectImage }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    touchAction: 'none',
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-32 bg-slate-700 border border-slate-600 rounded-2xl p-2 text-center flex flex-col items-center cursor-grab select-none"
      {...attributes}
      {...listeners}
    >
      <p className="text-amber-300 text-sm font-semibold mb-2">Pista {index + 1}</p>
      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-500 mb-2 bg-slate-900 flex items-center justify-center">
        {step.hintImageUrl ? (
          <img src={step.hintImageUrl} alt={`Pista ${index + 1}`} className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-500 text-[10px]">Sem imagem</span>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelectImage();
        }}
        className="text-xs text-amber-300 hover:text-amber-200"
      >
        Escolher foto
      </button>
    </div>
  );
};

export default SetupGame;
