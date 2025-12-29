import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import { ANNOTATION_COLORS } from '../../shared/constants';

const App: React.FC = () => {
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text'>('pen');
  const [color, setColor] = useState(ANNOTATION_COLORS[0]);
  const [thickness, setThickness] = useState(4);
  const [clearTrigger, setClearTrigger] = useState(0);

  const handleClear = () => {
    setClearTrigger((prev) => prev + 1);
  };

  const handleClose = async () => {
    await window.electronAPI.toggleOverlay(false);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Toolbar
        tool={tool}
        color={color}
        thickness={thickness}
        onToolChange={setTool}
        onColorChange={setColor}
        onThicknessChange={setThickness}
        onClear={handleClear}
        onClose={handleClose}
      />
      <Canvas
        tool={tool}
        color={color}
        thickness={thickness}
        onClear={() => clearTrigger}
      />
    </div>
  );
};

export default App;
