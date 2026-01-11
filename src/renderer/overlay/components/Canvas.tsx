import React, { useRef, useEffect, useState, useCallback } from 'react';

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

interface DrawingPath {
  tool: string;
  color: string;
  thickness: number;
  points?: Point[];
  start?: Point;
  end?: Point;
  text?: string;
}

interface TextInputState {
  visible: boolean;
  position: Point;
  value: string;
}

const Canvas: React.FC<CanvasProps> = ({ tool, color, thickness, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [textInput, setTextInput] = useState<TextInputState>({
    visible: false,
    position: { x: 0, y: 0 },
    value: ''
  });
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    redraw();
  }, [paths]);

  useEffect(() => {
    setPaths([]);
  }, [onClear]);

  useEffect(() => {
    if (textInput.visible && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [textInput.visible]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paths.forEach((path) => {
      ctx.strokeStyle = path.color;
      ctx.fillStyle = path.color;
      ctx.lineWidth = path.thickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      switch (path.tool) {
        case 'pen':
        case 'highlighter':
          ctx.globalAlpha = path.tool === 'highlighter' ? 0.3 : 1;
          if (path.points && path.points.length > 0) {
            ctx.beginPath();
            path.points.forEach((point: Point, index: number) => {
              if (index === 0) {
                ctx.moveTo(point.x, point.y);
              } else {
                ctx.lineTo(point.x, point.y);
              }
            });
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          break;

        case 'arrow':
          if (path.start && path.end) {
            drawArrow(ctx, path.start, path.end, path.thickness);
          }
          break;

        case 'rectangle':
          if (path.start && path.end) {
            const width = path.end.x - path.start.x;
            const height = path.end.y - path.start.y;
            ctx.strokeRect(path.start.x, path.start.y, width, height);
          }
          break;

        case 'circle':
          if (path.start && path.end) {
            const radius = Math.sqrt(
              Math.pow(path.end.x - path.start.x, 2) +
              Math.pow(path.end.y - path.start.y, 2)
            );
            ctx.beginPath();
            ctx.arc(path.start.x, path.start.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;

        case 'text':
          if (path.start && path.text) {
            const fontSize = Math.max(16, path.thickness * 4);
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillText(path.text, path.start.x, path.start.y);
          }
          break;
      }
    });

    // Draw preview for shape tools while drawing
    if (isDrawing && startPoint && currentPoint) {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = thickness;
      ctx.setLineDash([5, 5]);

      switch (tool) {
        case 'arrow':
          drawArrow(ctx, startPoint, currentPoint, thickness);
          break;

        case 'rectangle':
          const width = currentPoint.x - startPoint.x;
          const height = currentPoint.y - startPoint.y;
          ctx.strokeRect(startPoint.x, startPoint.y, width, height);
          break;

        case 'circle':
          const radius = Math.sqrt(
            Math.pow(currentPoint.x - startPoint.x, 2) +
            Math.pow(currentPoint.y - startPoint.y, 2)
          );
          ctx.beginPath();
          ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
      }

      ctx.setLineDash([]);
    }
  }, [paths, isDrawing, startPoint, currentPoint, tool, color, thickness]);

  const drawArrow = (ctx: CanvasRenderingContext2D, start: Point, end: Point, lineWidth: number) => {
    const headLength = Math.max(15, lineWidth * 3);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Draw the arrowhead
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point | null => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    if (!point) return;

    if (tool === 'text') {
      setTextInput({
        visible: true,
        position: point,
        value: ''
      });
      return;
    }

    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPoint(point);

    if (tool === 'pen' || tool === 'highlighter') {
      setPaths([...paths, { tool, color, thickness, points: [point] }]);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    setCurrentPoint(point);

    if (tool === 'pen' || tool === 'highlighter') {
      const newPaths = [...paths];
      const currentPath = newPaths[newPaths.length - 1];
      if (currentPath.points) {
        currentPath.points.push(point);
        setPaths(newPaths);
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || !startPoint || !currentPoint) {
      setIsDrawing(false);
      return;
    }

    if (tool === 'arrow' || tool === 'rectangle' || tool === 'circle') {
      setPaths([...paths, {
        tool,
        color,
        thickness,
        start: startPoint,
        end: currentPoint
      }]);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
  };

  const handleTextSubmit = () => {
    if (textInput.value.trim()) {
      setPaths([...paths, {
        tool: 'text',
        color,
        thickness,
        start: textInput.position,
        text: textInput.value
      }]);
    }
    setTextInput({ visible: false, position: { x: 0, y: 0 }, value: '' });
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setTextInput({ visible: false, position: { x: 0, y: 0 }, value: '' });
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{
          cursor: tool === 'text' ? 'text' : 'crosshair',
          width: '100%',
          height: '100%'
        }}
      />
      {textInput.visible && (
        <input
          ref={textInputRef}
          type="text"
          value={textInput.value}
          onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
          onKeyDown={handleTextKeyDown}
          onBlur={handleTextSubmit}
          style={{
            position: 'fixed',
            left: textInput.position.x,
            top: textInput.position.y - 10,
            background: 'white',
            border: `2px solid ${color}`,
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: `${Math.max(16, thickness * 4)}px`,
            color: color,
            outline: 'none',
            minWidth: '100px',
            zIndex: 10001
          }}
          placeholder="Type here..."
        />
      )}
    </>
  );
};

export default Canvas;
