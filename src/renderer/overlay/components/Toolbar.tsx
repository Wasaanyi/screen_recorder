import React from 'react';
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
  const tools: Array<{ id: 'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text'; label: string }> = [
    { id: 'pen', label: '✏️' },
    { id: 'highlighter', label: '🖍️' },
    { id: 'arrow', label: '➡️' },
    { id: 'rectangle', label: '⬜' },
    { id: 'circle', label: '⭕' },
    { id: 'text', label: 'T' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        zIndex: 10000
      }}
    >
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
  );
};

export default Toolbar;
