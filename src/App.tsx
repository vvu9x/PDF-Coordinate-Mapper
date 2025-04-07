import React, { useState } from 'react';
import PDFViewer from './components/PDFViewer';
import Sidebar from './components/Sidebar';
import { useFieldStore } from './store/fieldStore';
import { usePdfStore } from './store/pdfStore';
import Header from './components/Header';

function App() {
  const [activeTab, setActiveTab] = useState<'fields' | 'settings'>('fields');
  const { pdfUrl, currentPage, totalPages } = usePdfStore();
  const { fields } = useFieldStore();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          <PDFViewer />
        </div>
        
        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'fields'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } flex-1 text-center`}
                onClick={() => setActiveTab('fields')}
              >
                Fields
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } flex-1 text-center`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </nav>
          </div>
          
          <Sidebar activeTab={activeTab} />
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center text-sm">
        <div>
          {pdfUrl ? (
            <span>
              Page {currentPage} of {totalPages}
            </span>
          ) : (
            <span>No PDF loaded</span>
          )}
        </div>
        <div>
          {pdfUrl && <span>{fields.length} fields defined</span>}
        </div>
      </div>
    </div>
  );
}

export default App;