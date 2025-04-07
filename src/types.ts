export type FieldType = 'text' | 'checkbox' | 'date';

export interface FieldProperties {
  fontSize?: number;
  fontFamily?: string;
  alignment?: 'left' | 'center' | 'right';
  [key: string]: any;
}

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: FieldProperties;
}