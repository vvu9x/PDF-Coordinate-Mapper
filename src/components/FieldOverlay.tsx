import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { Field } from '../types';

interface FieldOverlayProps {
  field: Field;
  scale: number;
  canvasHeight: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<Field>) => void;
}

const FieldOverlay: React.FC<FieldOverlayProps> = ({
  field,
  scale,
  canvasHeight,
  isSelected,
  onSelect,
  onUpdate,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setPosition({
      x: field.x * scale,
      y: canvasHeight - (field.y + field.height) * scale,
    });

    setSize({
      width: field.width * scale,
      height: field.height * scale,
    });
  }, [field, scale, canvasHeight]);

  return (
    <Rnd
      size={size}
      position={position}
      bounds="parent"
      minWidth={20}
      minHeight={20}
      onDragStop={(e, d) => {
        const pdfX = d.x / scale;
        const pdfY = (canvasHeight - (d.y + size.height)) / scale;

        setPosition({ x: d.x, y: d.y });
        onUpdate(field.id, { x: pdfX, y: pdfY });
      }}
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        const newWidth = ref.offsetWidth;
        const newHeight = ref.offsetHeight;

        setSize({ width: newWidth, height: newHeight });
        setPosition(newPosition);

        const pdfWidth = newWidth / scale;
        const pdfHeight = newHeight / scale;
        const pdfX = newPosition.x / scale;
        const pdfY = (canvasHeight - (newPosition.y + newHeight)) / scale;

        onUpdate(field.id, {
          width: pdfWidth,
          height: pdfHeight,
          x: pdfX,
          y: pdfY,
        });
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`field-overlay ${isSelected ? 'selected' : ''}`}
    >
      <div className="field-label">
        {field.name} ({field.type})
      </div>
    </Rnd>
  );
};

export default FieldOverlay;
