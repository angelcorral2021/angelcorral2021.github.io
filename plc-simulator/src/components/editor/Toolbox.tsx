import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { ElementType } from '../../core/types';
import { LadderIcon } from './LadderIcons';

interface DraggableToolProps {
  type: ElementType;
  label: string;
}

const DraggableTool: React.FC<DraggableToolProps> = ({ type, label }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `tool-${type}`,
    data: {
      type: type,
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
    opacity: 0.8,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      className="ladder-element"
      style={{
        ...style,
        border: '1px solid var(--border-color)',
        backgroundColor: '#1e293b',
        marginBottom: '0.5rem',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem 0'
      }}
    >
      <LadderIcon type={type} color="#64748B" size={36} />
      <span style={{ fontSize: '0.65rem', fontWeight: 'bold', marginTop: '0.25rem', textAlign: 'center' }}>{label}</span>
      <div style={{ marginTop: '0.1rem', color: '#475569', fontFamily: 'monospace', fontSize: '0.6rem' }}>{type}</div>
    </div>
  );
};

export const Toolbox: React.FC = () => {
  return (
    <div className="panel-section">
      <h2 className="panel-title">Caja de Herramientas</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <DraggableTool type="XIC" label="Contacto N.A." />
        <DraggableTool type="XIO" label="Contacto N.C." />
        <DraggableTool type="OTE" label="Bobina Directa" />
        <DraggableTool type="OTL" label="Bobina Set" />
        <DraggableTool type="OTU" label="Bobina Reset" />
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', lineHeight: '1.4' }}>
        Arrastra un componente hacia el peldaño para añadirlo.<br/>
        (Clic derecho sobre un componente para eliminarlo)
      </p>
    </div>
  );
};
