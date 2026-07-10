import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen } from 'lucide-react';

export const MarkdownViewer: React.FC<{ lessonUrl: string }> = ({ lessonUrl }) => {
  const [content, setContent] = useState<string>('Cargando lección...');

  useEffect(() => {
    fetch(lessonUrl)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(err => setContent('Error al cargar la lección.'));
  }, [lessonUrl]);

  return (
    <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--accent-blue)' }}>
        <BookOpen size={24} />
        <h2 style={{ margin: 0 }}>Módulo Teórico</h2>
      </div>
      
      <div className="markdown-body" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};
