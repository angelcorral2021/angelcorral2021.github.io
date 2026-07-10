import { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { Canvas } from './components/editor/Canvas';
import { ControlPanel } from './components/simulator/ControlPanel';
import { IOPanel } from './components/simulator/IOPanel';
import { Toolbox } from './components/editor/Toolbox';
import { ChallengePanel } from './components/challenges/ChallengePanel';
import { MarkdownViewer } from './components/theory/MarkdownViewer';
import { Activity, BookOpen, Cpu } from 'lucide-react';
import { usePlcStore } from './store/usePlcStore';
import type { ElementType } from './core/types';
import './index.css';

function App() {
  const addElement = usePlcStore(state => state.addElement);
  const [activeTab, setActiveTab] = useState<'simulator' | 'theory'>('simulator');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.data.current) {
      const type = active.data.current.type as ElementType;
      const rungId = over.id as string;
      
      let defaultAddress = type.startsWith('O') ? 'O:0/0' : 'I:0/0';
      const userInput = window.prompt(`Ingrese la dirección para el elemento ${type}\n(ej. I:0/0 para entradas, O:0/0 para salidas):`, defaultAddress);
      
      if (userInput) {
        addElement(rungId, type, userInput);
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="app-container">
        <nav className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={24} color="var(--accent-blue)" />
              Simulador <span>PLC</span> Web
            </h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn"
                style={{ 
                  backgroundColor: activeTab === 'simulator' ? 'var(--accent-blue)' : 'transparent', 
                  color: activeTab === 'simulator' ? 'white' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: activeTab === 'simulator' ? 'var(--accent-blue)' : 'var(--border-color)'
                }}
                onClick={() => setActiveTab('simulator')}
              >
                <Cpu size={16} /> Simulador
              </button>
              <button 
                className="btn"
                style={{ 
                  backgroundColor: activeTab === 'theory' ? 'var(--accent-blue)' : 'transparent', 
                  color: activeTab === 'theory' ? 'white' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: activeTab === 'theory' ? 'var(--accent-blue)' : 'var(--border-color)'
                }}
                onClick={() => setActiveTab('theory')}
              >
                <BookOpen size={16} /> Teoría
              </button>
            </div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Modo Gamificado (Validación Automática)
          </div>
        </nav>
        
        <div className="main-content">
          {activeTab === 'simulator' ? (
            <>
              <aside className="sidebar">
                <ChallengePanel />
                <ControlPanel />
                <IOPanel />
                <Toolbox />
              </aside>
              
              <main className="editor-area">
                <Canvas />
              </main>
            </>
          ) : (
            <main className="editor-area" style={{ width: '100%', overflowY: 'auto' }}>
              <MarkdownViewer lessonUrl="/lessons/lesson-1.md" />
            </main>
          )}
        </div>
      </div>
    </DndContext>
  );
}

export default App;
