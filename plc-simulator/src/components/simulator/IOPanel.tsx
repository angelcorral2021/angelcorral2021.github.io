import React from 'react';
import { usePlcStore } from '../../store/usePlcStore';

export const IOPanel: React.FC = () => {
  const state = usePlcStore(store => store.state);
  const setInput = usePlcStore(store => store.setInput);

  const inputs = ['I:0/0', 'I:0/1', 'I:0/2', 'I:0/3'];
  const outputs = ['O:0/0', 'O:0/1', 'O:0/2', 'O:0/3'];

  return (
    <div className="panel-section">
      <h2 className="panel-title">Entradas / Salidas</h2>
      
      <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Entradas Físicas (Clic para forzar)</h3>
      <div className="io-grid" style={{ marginBottom: '1.5rem' }}>
        {inputs.map(addr => (
          <div 
            key={addr} 
            className="io-item"
            onClick={() => setInput(addr, !state.inputs[addr])}
          >
            <div className={`io-indicator ${state.inputs[addr] ? 'active' : ''}`}></div>
            <span className="io-label">{addr}</span>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Salidas Físicas</h3>
      <div className="io-grid">
        {outputs.map(addr => (
          <div key={addr} className="io-item" style={{ cursor: 'default', pointerEvents: 'none' }}>
            <div className={`io-indicator ${state.outputs[addr] ? 'active' : ''}`}></div>
            <span className="io-label">{addr}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
