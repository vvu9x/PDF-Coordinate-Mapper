import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Field, FieldType } from '../types';
import { usePdfStore } from './pdfStore';

interface FieldState {
  fields: Field[];
  selectedField: Field | null;
  currentFieldType: FieldType;
  
  // Actions
  addField: (field: Omit<Field, 'id'>) => void;
  updateField: (id: string, updates: Partial<Field>) => void;
  deleteField: (id: string) => void;
  selectField: (id: string | null) => void;
  clearFields: () => void;
  setCurrentFieldType: (type: FieldType) => void;
  
  // Import/Export
  importFields: (data: any) => void;
  exportFields: () => any;
}

export const useFieldStore = create<FieldState>((set, get) => ({
  fields: [],
  selectedField: null,
  currentFieldType: 'text',
  
  addField: (field) => {
    const id = uuidv4();
    set(state => ({
      fields: [...state.fields, { ...field, id }],
      selectedField: { ...field, id },
    }));
  },
  
  updateField: (id, updates) => {
    set(state => {
      const updatedFields = state.fields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      );
      
      const updatedSelectedField = state.selectedField?.id === id
        ? { ...state.selectedField, ...updates }
        : state.selectedField;
      
      return {
        fields: updatedFields,
        selectedField: updatedSelectedField,
      };
    });
  },
  
  deleteField: (id) => {
    set(state => {
      const updatedFields = state.fields.filter(field => field.id !== id);
      const updatedSelectedField = state.selectedField?.id === id
        ? null
        : state.selectedField;
      
      return {
        fields: updatedFields,
        selectedField: updatedSelectedField,
      };
    });
  },
  
  selectField: (id) => {
    set(state => ({
      selectedField: id ? state.fields.find(field => field.id === id) || null : null,
    }));
  },
  
  clearFields: () => {
    set({
      fields: [],
      selectedField: null,
    });
  },
  
  setCurrentFieldType: (type) => {
    set({ currentFieldType: type });
  },
  
  importFields: (data) => {
    try {
      if (data && Array.isArray(data.fields)) {
        const convertedFields = data.fields.map(field => {
            const width = field.pdfWidth;
            const height = field.pdfHeight;
            const x = field.pdfX;
            const y = field.pdfY;
            return {
              ...field,
              x,
              y,
              width,
              height,
            };
        });
        set({
          fields: convertedFields,
          selectedField: null,
        });
      }
    } catch (error) {
      console.error('Error importing fields:', error);
    }
  },
  
exportFields: () => {
  const { fields } = get();
  const { pdfName } = usePdfStore.getState();

  const POINT_TO_MM = 25.4 / 72;
  const PAGE_HEIGHT_POINTS = 842; 
  const PAGE_HEIGHT_MM = 297; 

  const pdfCoordinatesToMM = (pdfX: number, pdfY: number, pdfWidth: number, pdfHeight: number) => {
    const x_mm = (pdfX + 0.5 * pdfWidth) * POINT_TO_MM;
    const width_mm = pdfWidth * POINT_TO_MM;
    const height_mm = pdfHeight * POINT_TO_MM;
    const y_mm = (pdfY + 0.5 * pdfHeight) * POINT_TO_MM;

    return { x: Number(x_mm.toFixed(2)), y: Number(y_mm.toFixed(2)), width: Number(width_mm.toFixed(2)), height: Number(height_mm.toFixed(2)), pdfX: pdfX, pdfY: pdfY, pdfWidth: pdfWidth, pdfHeight: pdfHeight };
  };

  const convertedFields = fields.map(field => ({
    ...field,
    ...pdfCoordinatesToMM(field.x, field.y, field.width, field.height)
  }));

  return {
    pdfName,
    fields: convertedFields,
  };
}

}));