import React, { useState } from 'react';
import { usePlcStore } from '../../store/usePlcStore';
import { runChallengeTests } from '../../core/testRunner';
import type { Challenge, TestResult } from '../../core/testRunner';
import challengesData from '../../data/challenges.json';
import { CheckCircle, XCircle, PlayCircle, Loader2 } from 'lucide-react';

export const ChallengePanel: React.FC = () => {
  const engine = usePlcStore(state => state.engine);
  // Tomamos el primer reto por defecto del JSON para el prototipo
  const challenge = challengesData[0] as Challenge; 

  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const handleRunTests = async () => {
    setTesting(true);
    setResult(null);
    
    // Función para obtener siempre el estado más reciente de Zustand durante el test
    const getState = () => usePlcStore.getState().state;
    
    const res = await runChallengeTests(challenge, engine, getState);
    setResult(res);
    setTesting(false);
  };

  return (
    <div className="panel-section" style={{ backgroundColor: 'var(--bg-panel)' }}>
      <h2 className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Reto Activo: {challenge.title}</span>
        <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--accent-blue)', padding: '0.2rem 0.5rem', borderRadius: '1rem', color: 'white' }}>
          {challenge.difficulty}
        </span>
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5' }}>
        {challenge.description}
      </p>
      
      <button 
        className="btn btn-primary" 
        style={{ width: '100%', marginBottom: '1rem' }} 
        onClick={handleRunTests}
        disabled={testing}
      >
        {testing ? <><Loader2 size={18} className="animate-spin" /> Evaluando Test Cases...</> : <><PlayCircle size={18} /> Validar Solución</>}
      </button>

      {result && (
        <div style={{
          padding: '1rem', 
          borderRadius: '0.375rem', 
          backgroundColor: result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${result.success ? 'var(--accent-green)' : 'var(--accent-red)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: result.success ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 'bold' }}>
            {result.success ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {result.success ? '¡Reto Superado!' : `Fallo en el Paso ${result.failedStep}`}
          </div>
          {!result.success && result.feedback && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              {result.feedback}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
