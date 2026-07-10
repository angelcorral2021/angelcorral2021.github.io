import { create } from 'zustand';
import type { PLCState, Rung, ElementType } from '../core/types';
import { PLCEngine } from '../core/engine';

interface PlcStore {
  engine: PLCEngine;
  state: PLCState;
  rungs: Rung[];
  isRunning: boolean;
  
  toggleRun: () => void;
  setInput: (address: string, value: boolean) => void;
  addElement: (rungId: string, type: ElementType, address: string) => void;
  removeElement: (rungId: string, elementId: string) => void;
}

const initialRungs: Rung[] = [
  {
    id: 'rung-1',
    isActive: false,
    elements: [] // Empezamos con un peldaño vacío para poder arrastrar elementos
  }
];

const engineInstance = new PLCEngine(initialRungs);

export const usePlcStore = create<PlcStore>((set, get) => {
  engineInstance.setOnStateChange((newState, newRungs) => {
    set({ state: newState, rungs: newRungs });
  });

  return {
    engine: engineInstance,
    state: { inputs: {}, outputs: {}, memory: {}, timers: {}, counters: {} },
    rungs: initialRungs,
    isRunning: false,

    toggleRun: () => {
      const { engine, isRunning } = get();
      if (isRunning) {
        engine.stop();
        set({ isRunning: false });
      } else {
        engine.start();
        set({ isRunning: true });
      }
    },

    setInput: (address, value) => {
      get().engine.setInput(address, value);
    },

    addElement: (rungId, type, address) => {
      const { rungs, engine } = get();
      const newRungs = rungs.map(rung => {
        if (rung.id === rungId) {
          return {
            ...rung,
            elements: [
              ...rung.elements, 
              { id: `el-${Date.now()}`, type, address }
            ]
          };
        }
        return rung;
      });
      // Actualizamos el motor
      engine['rungs'] = newRungs; 
      // Si está en pausa, forzamos un ciclo de scan para ver el cambio visual de inmediato
      engine.scanCycle();
      set({ rungs: newRungs });
    },

    removeElement: (rungId, elementId) => {
      const { rungs, engine } = get();
      const newRungs = rungs.map(rung => {
        if (rung.id === rungId) {
          return {
            ...rung,
            elements: rung.elements.filter(el => el.id !== elementId)
          };
        }
        return rung;
      });
      engine['rungs'] = newRungs;
      engine.scanCycle();
      set({ rungs: newRungs });
    }
  };
});
