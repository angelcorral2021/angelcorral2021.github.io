import { PLCEngine } from './engine';
import type { PLCState } from './types';

export interface TestCase {
  step: number;
  description: string;
  stimulus: Record<string, boolean>;
  durationMs: number;
  expectedOutputs: Record<string, boolean>;
  feedbackMessage: string;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  maxScore: number;
  penaltyPerFailure: number;
  testCases: TestCase[];
}

export interface TestResult {
  success: boolean;
  failedStep?: number;
  feedback?: string;
}

export const runChallengeTests = async (
  challenge: Challenge, 
  engine: PLCEngine, 
  getState: () => PLCState
): Promise<TestResult> => {
  
  // Detenemos el motor temporalmente si estaba corriendo manualmente
  engine.stop();

  try {
    for (const test of challenge.testCases) {
      // 1. Aplicar estímulos (forzar entradas)
      for (const [address, value] of Object.entries(test.stimulus)) {
        engine.setInput(address, value);
      }

      // 2. Dejar que el motor procese por el tiempo indicado
      engine.start();
      await new Promise(resolve => setTimeout(resolve, test.durationMs));
      
      // 3. Chequear salidas esperadas después del tiempo de espera
      const currentState = getState();
      for (const [address, expectedValue] of Object.entries(test.expectedOutputs)) {
        if (!!currentState.outputs[address] !== expectedValue) {
          engine.stop(); // Detenemos el motor al fallar
          return {
            success: false,
            failedStep: test.step,
            feedback: test.feedbackMessage
          };
        }
      }
    }
    
    // Si todos los casos pasan
    engine.stop();
    return { success: true };
  } catch (err) {
    engine.stop();
    return { success: false, feedback: "Error interno durante la ejecución de las pruebas." };
  }
};
