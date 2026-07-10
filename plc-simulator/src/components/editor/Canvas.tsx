import React from 'react';
import { usePlcStore } from '../../store/usePlcStore';
import { RungComponent } from './Rung';

export const Canvas: React.FC = () => {
  const rungs = usePlcStore(state => state.rungs);

  return (
    <div className="canvas" style={{ flex: 1, padding: '2rem 0' }}>
      {rungs.map((rung, i) => (
        <RungComponent key={rung.id} rung={rung} index={i} />
      ))}
    </div>
  );
};
