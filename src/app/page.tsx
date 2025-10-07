'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match its display size
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      // Set initial canvas styles
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set drawing styles
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctxRef.current = ctx;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    setIsDrawing(true);
    
    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      const rect = canvas.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    e.preventDefault();
    
    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      const rect = canvas.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const exportCanvas = (format: 'webp' | 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let mimeType, quality;
    switch (format) {
      case 'webp':
        mimeType = 'image/webp';
        quality = 0.92;
        break;
      case 'jpeg':
        mimeType = 'image/jpeg';
        quality = 0.92;
        break;
      case 'png':
      default:
        mimeType = 'image/png';
        quality = undefined;
        break;
    }

    const dataURL = quality !== undefined 
      ? canvas.toDataURL(mimeType, quality) 
      : canvas.toDataURL(mimeType);
      
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `canvas.${format}`;
    link.click();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar for Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-100 border-b">
        <h1 className="text-xl font-bold">AI Canvas</h1>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="btn btn-primary"
        >
          Menu
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile unless menu is open */}
        <div 
          className={`bg-gray-100 w-64 flex-shrink-0 border-r p-4 flex flex-col gap-4 md:block ${
            isMenuOpen ? 'absolute inset-0 z-10' : 'hidden'
          }`}
        >
          <div className="md:hidden flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Options</h2>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="color-picker" className="font-medium">Color:</label>
            <input 
              id="color-picker"
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="brush-size" className="font-medium">Brush Size:</label>
            <input 
              id="brush-size"
              type="range" 
              min="1" 
              max="50" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{brushSize}px</span>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button 
              onClick={clearCanvas}
              className="btn btn-secondary"
            >
              Clear Canvas
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <h3 className="font-medium">Export As:</h3>
            <button 
              onClick={() => exportCanvas('webp')}
              className="btn btn-primary"
            >
              WebP
            </button>
            <button 
              onClick={() => exportCanvas('png')}
              className="btn btn-primary"
            >
              PNG
            </button>
            <button 
              onClick={() => exportCanvas('jpeg')}
              className="btn btn-primary"
            >
              JPEG
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full bg-white cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
}
