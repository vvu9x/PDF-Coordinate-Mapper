import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { usePdfStore } from '../store/pdfStore';
import { useFieldStore } from '../store/fieldStore';
import FieldOverlay from './FieldOverlay';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, pdfX: 0, pdfY: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [drawEnd, setDrawEnd] = useState({ x: 0, y: 0 });
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  
  const { 
    pdfUrl, 
    pdfDocument, 
    setPdfDocument, 
    currentPage, 
    setCurrentPage, 
    setTotalPages,
    pdfName
  } = usePdfStore();
  
  const { 
    fields, 
    addField, 
    updateField, 
    selectedField, 
    selectField,
    currentFieldType
  } = useFieldStore();

  // Load PDF when URL changes
  useEffect(() => {
    if (!pdfUrl) return;

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();

    return () => {
      // Clean up
      if (pdfDocument) {
        pdfDocument.destroy();
      }
    };
  }, [pdfUrl, setPdfDocument, setTotalPages, setCurrentPage]);

  // Render PDF page when page changes
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;
      } catch (error) {
        console.error('Error rendering PDF page:', error);
      }
    };

    renderPage();
  }, [pdfDocument, currentPage, scale]);

  // Handle mouse move to track cursor position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !pdfDocument) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to PDF coordinates (PDF coordinate system has origin at bottom-left)
    const pdfX = x / scale;
    const pdfY = (canvas.height - y) / scale;
    
    setCursorPosition({ x, y, pdfX, pdfY });
    
    if (isDrawing) {
      setDrawEnd({ x, y });
    }
  };

  // Handle mouse down to start drawing a field
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !pdfDocument || selectedFieldId) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setDrawStart({ x, y });
    setDrawEnd({ x, y });
    
    // Deselect any selected field
    selectField(null);
  };

  // Handle mouse up to finish drawing a field
  const handleMouseUp = () => {
    if (!isDrawing || !canvasRef.current || !pdfDocument) return;
    
    setIsDrawing(false);
    
    // Calculate field dimensions
    const canvas = canvasRef.current;
    const minX = Math.min(drawStart.x, drawEnd.x);
    const minY = Math.min(drawStart.y, drawEnd.y);
    const width = Math.abs(drawEnd.x - drawStart.x);
    const height = Math.abs(drawEnd.y - drawStart.y);
    
    // Only create field if it has some size
    if (width > 5 && height > 5) {
      // Convert to PDF coordinates
      const pdfMinX = minX / scale;
      const pdfMaxY = (canvas.height - minY) / scale; // PDF Y is inverted
      const pdfWidth = width / scale;
      const pdfHeight = height / scale;
      
      // Add new field
      addField({
        id: '',  // Will be generated in the store
        name: `Field_${fields.length + 1}`,
        type: currentFieldType,
        page: currentPage,
        x: pdfMinX,
        y: pdfMaxY - pdfHeight, // Adjust Y coordinate for PDF coordinate system
        width: pdfWidth,
        height: pdfHeight,
        properties: {
          fontSize: 12,
          fontFamily: 'Helvetica',
          alignment: 'left',
        }
      });
    }
  };

  // Handle zoom in/out
  const handleZoom = (factor: number) => {
    setScale(prevScale => {
      const newScale = prevScale * factor;
      return Math.max(0.5, Math.min(3, newScale)); // Limit scale between 0.5 and 3
    });
  };

  // Get fields for current page
  const currentPageFields = fields.filter(field => field.page === currentPage);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b border-gray-200 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleZoom(1.1)} 
            className="p-1 rounded hover:bg-gray-200"
            title="Zoom In"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
            </svg>
          </button>
          <button 
            onClick={() => handleZoom(0.9)} 
            className="p-1 rounded hover:bg-gray-200"
            title="Zoom Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
            </svg>
          </button>
          <span className="text-sm text-gray-600">
            {Math.round(scale * 100)}%
          </span>
        </div>
        
        <div className="text-sm text-gray-600">
          {pdfName && <span>File: {pdfName}</span>}
        </div>
        
        <div className="text-sm text-gray-600">
          Cursor: X: {Math.round(cursorPosition.pdfX)}, Y: {Math.round(cursorPosition.pdfY)} (PDF coordinates)
        </div>
      </div>
      
      {/* PDF Viewer */}
      <div 
        ref={containerRef}
        className="pdf-container flex-1"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="pdf-page">
          <canvas ref={canvasRef} />
          
          {/* Drawing overlay */}
          {isDrawing && (
            <div
              style={{
                position: 'absolute',
                left: Math.min(drawStart.x, drawEnd.x),
                top: Math.min(drawStart.y, drawEnd.y),
                width: Math.abs(drawEnd.x - drawStart.x),
                height: Math.abs(drawEnd.y - drawStart.y),
                border: '2px dashed rgba(0, 123, 255, 0.7)',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                pointerEvents: 'none',
              }}
            />
          )}
          
          {/* Field overlays */}
          {currentPageFields.map(field => (
            <FieldOverlay
              key={field.id}
              field={field}
              scale={scale}
              canvasHeight={canvasRef.current?.height || 0}
              isSelected={field.id === selectedField?.id}
              onSelect={() => selectField(field.id)}
              onUpdate={updateField}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;