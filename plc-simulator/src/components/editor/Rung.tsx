import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Rung as RungType, ElementType } from '../../core/types';
import { usePlcStore } from '../../store/usePlcStore';
import { LadderIcon } from './LadderIcons';

interface RungProps {
  rung: RungType;
  index: number;
}

const LadderElementNode: React.FC<{ id: string, type: ElementType, address: string, isActive: boolean, rungId: string }> = ({ id, type, address, isActive, rungId }) => {
  const strokeColor = isActive ? '#10B981' : '#64748B'; 
  const removeElement = usePlcStore(state => state.removeElement);

  return (
    <div 
      className="ladder-element" 
      onContextMenu={(e) => {
        e.preventDefault();
        removeElement(rungId, id);
      }} 
      title="Clic derecho para eliminar"
    >
      <span className="ladder-element-address" style={{ color: strokeColor }}>{address}</span>
      <LadderIcon type={type} color={strokeColor} size={40} />
    </div>
  );
};

export const RungComponent: React.FC<RungProps> = ({ rung, index }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: rung.id,
  });

  const dropStyle = isOver ? { backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {};

  return (
    <div ref={setNodeRef} className="rung-container" style={dropStyle}>
      <div className="power-rail-left"></div>
      
      <div className="rung-number">{index.toString().padStart(3, '0')}</div>
      
      <div className="rung-content">
        <div className={`rung-wire ${rung.isActive ? 'active' : 'inactive'}`}></div>
        
        <div className="ladder-elements">
          {rung.elements.map((el) => {
             // Use element's own isActive if available, else fallback to rung's overall state
             const isElementActive = (el as any).isActive !== undefined ? (el as any).isActive : rung.isActive;
             return (
              <LadderElementNode 
                key={`${el.id}`}
                id={el.id}
                type={el.type} 
                address={el.address} 
                isActive={isElementActive} 
                rungId={rung.id}
              />
            );
          })}
          {rung.elements.length === 0 && (
             <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem', zIndex: 10, paddingLeft: '1rem', background: '#111827' }}>
               Arrastra componentes aquí...
             </div>
          )}
        </div>
      </div>

      <div className="power-rail-right"></div>
    </div>
  );
};
