import type { PLCState, Rung } from './types';

export class PLCEngine {
  private state: PLCState;
  private rungs: Rung[];
  private intervalId: number | null = null;
  private scanTimeMs: number = 50;

  private onStateChangeCallback?: (state: PLCState, rungs: Rung[]) => void;

  constructor(initialRungs: Rung[] = []) {
    this.rungs = initialRungs;
    this.state = {
      inputs: {},
      outputs: {},
      memory: {},
      timers: {},
      counters: {}
    };
  }

  public setOnStateChange(callback: (state: PLCState, rungs: Rung[]) => void) {
    this.onStateChangeCallback = callback;
  }

  public setInput(address: string, value: boolean) {
    this.state.inputs[address] = value;
    if (!this.intervalId) {
      this.scanCycle(); // Forzar escaneo si está pausado
    }
  }

  private getValue(address: string): boolean {
    return !!(this.state.inputs[address] || this.state.outputs[address] || this.state.memory[address]);
  }

  public start() {
    if (this.intervalId) return;
    this.intervalId = window.setInterval(() => this.scanCycle(), this.scanTimeMs);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public scanCycle() {
    for (const rung of this.rungs) {
      this.evaluateRung(rung);
    }
    this.notifyStateChange();
  }

  private evaluateRung(rung: Rung) {
    let powerFlow = true;

    for (const element of rung.elements) {
      switch (element.type) {
        case 'XIC': 
          powerFlow = powerFlow && this.getValue(element.address);
          break;
        case 'XIO':
          powerFlow = powerFlow && !this.getValue(element.address);
          break;
        case 'OTE':
          this.state.outputs[element.address] = powerFlow;
          break;
        case 'OTL':
          if (powerFlow) this.state.outputs[element.address] = true;
          break;
        case 'OTU':
          if (powerFlow) this.state.outputs[element.address] = false;
          break;
        case 'TON':
          this.evaluateTON(element, powerFlow);
          break;
      }
      // Marcar visualmente en verde si la corriente eléctrica llegó y cruzó este elemento
      (element as any).isActive = powerFlow;
    }
    rung.isActive = powerFlow;
  }

  private evaluateTON(element: any, powerFlow: boolean) {
    let timer = this.state.timers[element.address];
    if (!timer) {
      timer = { preset: 3000, accumulated: 0, enable: false, done: false };
      this.state.timers[element.address] = timer;
    }
    
    timer.enable = powerFlow;
    if (timer.enable) {
      if (!timer.done) {
        timer.accumulated += this.scanTimeMs;
        if (timer.accumulated >= timer.preset) {
          timer.done = true;
          timer.accumulated = timer.preset;
        }
      }
    } else {
      timer.accumulated = 0;
      timer.done = false;
    }
  }

  private notifyStateChange() {
    if (this.onStateChangeCallback) {
      // Usamos copias profundas para que React detecte cambios
      this.onStateChangeCallback(
        JSON.parse(JSON.stringify(this.state)), 
        JSON.parse(JSON.stringify(this.rungs))
      );
    }
  }
}
