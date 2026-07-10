import React from 'react';
import { Play, Square } from 'lucide-react';
import { usePlcStore } from '../../store/usePlcStore';

export const ControlPanel: React.FC = () => {
  const isRunning = usePlcStore(state => state.isRunning);
  const toggleRun = usePlcStore(state => state.toggleRun);

  return (
    <div className="panel-section">
      <h2 className="panel-title">Control de Simulación</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          className={`btn ${isRunning ? 'btn-danger' : 'btn-success'}`}
          onClick={toggleRun}
          style={{ flex: 1 }}
        >
          {isRunning ? (
            <><Square size={18} /> Detener (STOP)</>
          ) : (
            <><Play size={18} /> Iniciar (RUN)</>
          )}
        </button>
      </div>
    </div>
  );
};
