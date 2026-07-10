export type ElementType = 'XIC' | 'XIO' | 'OTE' | 'OTL' | 'OTU' | 'TON' | 'TOF' | 'CTU' | 'CTD' | 'EQU' | 'LES' | 'GRT';

export interface LadderElement {
  id: string;
  type: ElementType;
  address: string; // e.g., 'I:0/0', 'O:0/0', 'T4:0'
  parameters?: Record<string, any>;
}

export interface Rung {
  id: string;
  elements: LadderElement[]; // En V1 usamos solo una línea en serie
  isActive: boolean; // Indica si hay flujo de corriente
}

export interface PLCState {
  inputs: Record<string, boolean>;
  outputs: Record<string, boolean>;
  memory: Record<string, boolean>;
  timers: Record<string, { preset: number; accumulated: number; enable: boolean; done: boolean }>;
  counters: Record<string, { preset: number; accumulated: number; done: boolean; cu: boolean; cd: boolean }>;
}
