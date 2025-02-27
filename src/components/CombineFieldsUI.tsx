import React from 'react';
import { Plus, X } from 'lucide-react';
import { FieldOption } from '../types/mapping';
import SeparatorDropdown from './SeparatorDropdown';

interface CombineFieldsUIProps {
  selectedFields: FieldOption[];
  onAddField: () => void;
  onRemoveField: (value: string) => void;
  onSeparatorChange: (separator: string) => void;
  separator: string;
  onFieldBoxClick?: () => void;
  isLocked?: boolean;
}

const CombineFieldsUI: React.FC<CombineFieldsUIProps> = ({
  selectedFields,
  onAddField,
  onRemoveField,
  onSeparatorChange,
  separator,
  onFieldBoxClick,
  isLocked = false,
}) => {
  const handleAddFieldClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLocked) {
      onAddField();
    }
  };

  const handleSeparatorChange = (newSeparator: string) => {
    // Directly use the separator value
    onSeparatorChange(newSeparator);
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border rounded-md p-2 min-h-[40px] ${
          isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        onClick={!isLocked ? onFieldBoxClick : undefined}
      >
        <div className="flex flex-wrap gap-2">
          {selectedFields.map((field) => (
            <div
              key={field.value}
              className={`inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-sm ${
                isLocked ? 'opacity-75' : ''
              }`}
            >
              <span className="text-gray-600">{field.label}</span>
              {!isLocked && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveField(field.value);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleAddFieldClick}
          disabled={isLocked}
          className={`inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm ${
            isLocked
              ? 'opacity-75 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Add Field or Text</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Separator:</span>
          <div className="w-[200px]">
            <SeparatorDropdown
              value={separator}
              onChange={handleSeparatorChange}
              isLocked={isLocked}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombineFieldsUI;