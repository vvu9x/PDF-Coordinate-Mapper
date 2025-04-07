import React from 'react';
import { usePdfStore } from '../store/pdfStore';
import { useFieldStore } from '../store/fieldStore';

const Header: React.FC = () => {
  const { loadPdf, pdfUrl, setCurrentPage, currentPage, totalPages } = usePdfStore();
  const { exportFields, importFields, clearFields } = useFieldStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      loadPdf(fileUrl, file.name);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          importFields(json);
        } catch (error) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    const json = exportFields();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pdf-fields.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800 mr-6">PDF Coordinate Mapper</h1>
        
        <div className="flex space-x-2">
          <label className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Load PDF
            <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
          </label>
          
          {pdfUrl && (
            <div className="flex items-center space-x-1 bg-gray-100 rounded">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage <= 1}
                className="px-2 py-1.5 text-gray-700 disabled:text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <span className="text-sm text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage >= totalPages}
                className="px-2 py-1.5 text-gray-700 disabled:text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <label className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          Import
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
        
        <button 
          onClick={handleExport}
          disabled={!pdfUrl}
          className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          Export
        </button>
        
        <button 
          onClick={clearFields}
          disabled={!pdfUrl}
          className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Clear Fields
        </button>
      </div>
    </header>
  );
};

export default Header;