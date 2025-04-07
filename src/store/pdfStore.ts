import { create } from 'zustand';
import { PDFDocumentProxy } from 'pdfjs-dist';

interface PdfState {
  pdfUrl: string | null;
  pdfName: string | null;
  pdfDocument: PDFDocumentProxy | null;
  currentPage: number;
  totalPages: number;
  
  // Actions
  loadPdf: (url: string, name: string) => void;
  setPdfDocument: (doc: PDFDocumentProxy | null) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
}

export const usePdfStore = create<PdfState>((set) => ({
  pdfUrl: null,
  pdfName: null,
  pdfDocument: null,
  currentPage: 1,
  totalPages: 0,
  
  loadPdf: (url, name) => {
    set({
      pdfUrl: url,
      pdfName: name,
      currentPage: 1,
    });
  },
  
  setPdfDocument: (doc) => {
    set({ pdfDocument: doc });
  },
  
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },
  
  setTotalPages: (pages) => {
    set({ totalPages: pages });
  },
}));