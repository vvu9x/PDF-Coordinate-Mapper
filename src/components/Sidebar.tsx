import React, { useState } from 'react';
import { useFieldStore } from '../store/fieldStore';
import { usePdfStore } from '../store/pdfStore';
import { Field, FieldType } from '../types';

interface SidebarProps {
  activeTab: 'fields' | 'settings';
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab }) => {
  const { 
    fields, 
    selectedField, 
    selectField, 
    updateField, 
    deleteField,
    setCurrentFieldType,
    currentFieldType
  } = useFieldStore();
  
  const { currentPage, pdfUrl } = usePdfStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllPages, setShowAllPages] = useState(false);
  
  // Filter fields based on search and page
  const filteredFields = fields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPage = showAllPages || field.page === currentPage;
    return matchesSearch && matchesPage;
  });
  
  // Group fields by page
  const fieldsByPage: Record<number, Field[]> = {};
  filteredFields.forEach(field => {
    if (!fieldsByPage[field.page]) {
      fieldsByPage[field.page] = [];
    }
    fieldsByPage[field.page].push(field);
  });
  
  const handleFieldTypeChange = (type: FieldType) => {
    setCurrentFieldType(type);
  };
  
  const handleFieldUpdate = (id: string, key: keyof Field, value: any) => {
    updateField(id, { [key]: value } as Partial<Field>);
  };
  
  const handlePropertyUpdate = (id: string, key: string, value: any) => {
    if (!selectedField) return;
    
    const updatedProperties = {
      ...selectedField.properties,
      [key]: value
    };
    
    updateField(id, { properties: updatedProperties });
  };
  
  if (activeTab === 'fields') {
    return (
      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Field Type</h2>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded text-sm ${
                currentFieldType === 'text'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => handleFieldTypeChange('text')}
            >
              Text
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${
                currentFieldType === 'checkbox'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => handleFieldTypeChange('checkbox')}
            >
              Checkbox
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${
                currentFieldType === 'date'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => handleFieldTypeChange('date')}
            >
              Date
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Draw on the PDF to create a new {currentFieldType} field
          </p>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="showAllPages"
              checked={showAllPages}
              onChange={() => setShowAllPages(!showAllPages)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="showAllPages" className="ml-2 text-sm text-gray-700">
              Show fields from all pages
            </label>
          </div>
        </div>
        
        {Object.keys(fieldsByPage).length === 0 && (
          <div className="text-center py-6 text-gray-500">
            {pdfUrl ? 'No fields defined yet' : 'Load a PDF to start mapping fields'}
          </div>
        )}
        
        {Object.entries(fieldsByPage).map(([page, pageFields]) => (
          <div key={page} className="mb-4">
            {showAllPages && (
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Page {page}
              </h3>
            )}
            
            <div className="space-y-2">
              {pageFields.map(field => (
                <div
                  key={field.id}
                  className={`p-3 rounded-md border ${
                    selectedField?.id === field.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  } cursor-pointer`}
                  onClick={() => selectField(field.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{field.name}</div>
                      <div className="text-sm text-gray-500">
                        Type: {field.type} | Position: ({Math.round(field.x)}, {Math.round(field.y)})
                      </div>
                      <div className="text-sm text-gray-500">
                        Size: {Math.round(field.width)} × {Math.round(field.height)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteField(field.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {selectedField && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Field Properties</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name
                </label>
                <input
                  type="text"
                  value={selectedField.name}
                  onChange={(e) => handleFieldUpdate(selectedField.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type
                </label>
                <select
                  value={selectedField.type}
                  onChange={(e) => handleFieldUpdate(selectedField.id, 'type', e.target.value as FieldType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="text">Text</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="date">Date</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    X Position
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedField.x)}
                    onChange={(e) => handleFieldUpdate(selectedField.id, 'x', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Y Position
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedField.y)}
                    onChange={(e) => handleFieldUpdate(selectedField.id, 'y', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedField.width)}
                    onChange={(e) => handleFieldUpdate(selectedField.id, 'width', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedField.height)}
                    onChange={(e) => handleFieldUpdate(selectedField.id, 'height', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {selectedField.type === 'text' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Family
                    </label>
                    <select
                      value={selectedField.properties.fontFamily}
                      onChange={(e) => handlePropertyUpdate(selectedField.id, 'fontFamily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times-Roman">Times Roman</option>
                      <option value="Courier">Courier</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <input
                      type="number"
                      value={selectedField.properties.fontSize}
                      onChange={(e) => handlePropertyUpdate(selectedField.id, 'fontSize', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Alignment
                    </label>
                    <select
                      value={selectedField.properties.alignment}
                      onChange={(e) => handlePropertyUpdate(selectedField.id, 'alignment', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Settings tab
  return (
    <div className="p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-3">Application Settings</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">PDF Rendering</h3>
          <p className="text-sm text-gray-500 mb-2">
            The application uses PDF.js to render PDF documents directly in the browser.
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Coordinate System</h3>
          <p className="text-sm text-gray-500 mb-2">
            PDF coordinates start from the bottom-left corner of the page, with Y axis pointing upward.
            Screen coordinates start from the top-left, with Y axis pointing downward.
            The application handles this conversion automatically.
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Export Format</h3>
          <p className="text-sm text-gray-500 mb-2">
            Field definitions are exported in JSON format with the following structure:
          </p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
{`{
  "pdfName": "example.pdf",
  "fields": [
    {
      "id": "uuid",
      "name": "fieldName",
      "type": "text|checkbox|date",
      "page": 1,
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 30,
      "properties": {
        "fontSize": 12,
        "fontFamily": "Helvetica",
        "alignment": "left"
      }
    }
  ]
}`}
          </pre>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">About</h3>
          <p className="text-sm text-gray-500">
            PDF Coordinate Mapper v0.1.0
            <br />
            A web-based utility for mapping coordinates on PDF documents.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;