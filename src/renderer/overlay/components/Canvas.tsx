import React, { useRef, useEffect, useState } from 'react';

interface CanvasProps {
  tool: 'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text';
  color: string;
  thickness: number;
  onClear: () => void;
}

interface Point {
  x: number;
  y: number;
}

const Canvas: React.FC<CanvasProps> = ({ tool, color, thickness, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [_startPoint, setStartPoint] = useState<Point | null>(null);
  const [paths, setPaths] = useState<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    redraw();
  }, [paths]);

  useEffect(() => {
    // Clear paths when onClear reference changes
    {
      setPaths([]);
    }
  }, [onClear]);

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paths.forEach((path) => {
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.thickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (path.tool === 'pen' || path.tool === 'highlighter') {
        ctx.globalAlpha = path.tool === 'highlighter' ? 0.3 : 1;
        ctx.beginPath();
        path.points.forEach((point: Point, index: number) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setStartPoint(point);

    if (tool === 'pen' || tool === 'highlighter') {
      setPaths([...paths, { tool, color, thickness, points: [point] }]);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (tool === 'pen' || tool === 'highlighter') {
      const newPaths = [...paths];
      const currentPath = newPaths[newPaths.length - 1];
      currentPath.points.push(point);
      setPaths(newPaths);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setStartPoint(null);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      style={{
        cursor: 'crosshair',
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default Canvas;
