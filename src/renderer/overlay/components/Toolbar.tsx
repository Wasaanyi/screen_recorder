import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ANNOTATION_COLORS, ANNOTATION_THICKNESS } from '../../../shared/constants';

interface ToolbarProps {
  tool: 'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text';
  color: string;
  thickness: number;
  onToolChange: (tool: 'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text') => void;
  onColorChange: (color: string) => void;
  onThicknessChange: (thickness: number) => void;
  onClear: () => void;
  onClose: () => void;
}

const STORAGE_KEY = 'annotation-toolbar-position';

const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  color,
  thickness,
  onToolChange,
  onColorChange,
  onThicknessChange,
  onClear,
  onClose
}) => {
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore errors
    }
    return { x: window.innerWidth / 2 - 300, y: 20 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const tools: Array<{ id: 'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text'; label: string }> = [
    { id: 'pen', label: '✏️' },
    { id: 'highlighter', label: '🖍️' },
    { id: 'arrow', label: '➡️' },
    { id: 'rectangle', label: '⬜' },
    { id: 'circle', label: '⭕' },
    { id: 'text', label: 'T' }
  ];

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      setIsDragging(true);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      // Keep toolbar within screen bounds
      const maxX = window.innerWidth - (toolbarRef.current?.offsetWidth || 600);
      const maxY = window.innerHeight - (toolbarRef.current?.offsetHeight || 80);

      const clampedX = Math.max(0, Math.min(newX, maxX));
      const clampedY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: clampedX, y: clampedY });
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
      } catch {
        // Ignore storage errors
      }
    }
  }, [isDragging, position]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={toolbarRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '8px 16px 16px 16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10000,
        userSelect: 'none'
      }}
    >
      {/* Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          padding: '4px 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div style={{
          width: '40px',
          height: '4px',
          background: '#d1d5db',
          borderRadius: '2px'
        }} />
      </div>

      {/* Tools Row */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* Tools */}
        <div style={{ display: 'flex', gap: '8px' }}>
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => onToolChange(t.id)}
            style={{
              width: '40px',
              height: '40px',
              border: tool === t.id ? '2px solid #3b82f6' : '2px solid transparent',
              borderRadius: '8px',
              background: tool === t.id ? '#eff6ff' : '#f3f4f6',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '40px', background: '#e5e7eb' }} />

      {/* Colors */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {ANNOTATION_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onColorChange(c)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: c,
              border: color === c ? '3px solid #3b82f6' : '2px solid #fff',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          />
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '40px', background: '#e5e7eb' }} />

      {/* Thickness */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {ANNOTATION_THICKNESS.map((t) => (
          <button
            key={t}
            onClick={() => onThicknessChange(t)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: thickness === t ? '2px solid #3b82f6' : '2px solid transparent',
              background: thickness === t ? '#eff6ff' : '#f3f4f6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: `${t}px`,
                height: `${t}px`,
                borderRadius: '50%',
                background: '#374151'
              }}
            />
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '40px', background: '#e5e7eb' }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onClear}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#f3f4f6',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Clear
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Close
        </button>
      </div>
      </div>
    </div>
  );
};

export default Toolbar;
