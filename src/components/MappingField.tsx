import React, { useState } from 'react';
import { ChevronDown, MessageSquare, Shapes, PenSquare, Eye, Lock, Unlock } from 'lucide-react';
import { FieldOption } from '../types/mapping';
import { XMLMapping } from '../types/xml';
import FieldSelectionDropdown from './FieldSelectionDropdown';
import CombineFieldsUI from './CombineFieldsUI';
import { useMappingField } from '../hooks/useMappingField';

interface MappingFieldProps {
  fieldName: string;
  fieldValue: string;
  fieldOptions: FieldOption[];
  helpText?: string;
  onFieldChange: (mapping: XMLMapping) => void;
  onPreviewClick: () => void;
  onCommentClick: () => void; // Updated to handle field-specific comments
  onABTestClick: () => void;
  onEditClick: () => void;
}

const MappingField: React.FC<MappingFieldProps> = ({
  fieldName,
  fieldValue,
  fieldOptions,
  helpText,
  onFieldChange,
  onPreviewClick,
  onCommentClick,
  onABTestClick,
  onEditClick,
}) => {
  const {
    state,
    dropdownState,
    actions,
    setDropdownState
  } = useMappingField(fieldValue, fieldName);

  const { isLocked, mappingType, selectedField, selectedFields, separator } = state;
  const { activeDropdown, isFieldDropdownOpen } = dropdownState;
  const {
    toggleDropdown,
    handleMappingTypeChange,
    handleFieldSelect,
    handleRemoveField,
    toggleLock,
    setSeparator,
  } = actions;

  const [staticValue, setStaticValue] = useState('');

  const mappingTypes = [
    { value: 'rename', label: 'Rename' },
    { value: 'static', label: 'Add static value' },
    { value: 'combine', label: 'Combine' },
    { value: 'empty', label: 'Leave empty' },
  ];

  const handleStaticValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStaticValue(value);
    onFieldChange({
      targetField: fieldName,
      type: 'static',
      value: value
    });
  };

  const handleFieldSelection = (field: FieldOption) => {
    if (!field) return;

    handleFieldSelect(field, () => {
      if (mappingType === 'rename') {
        onFieldChange({
          targetField: fieldName,
          type: 'rename',
          sourceField: field.value
        });
      } else if (mappingType === 'combine') {
        const fieldWithType: FieldOption = {
          ...field,
          type: field.type || 'custom'
        };

        onFieldChange({
          targetField: fieldName,
          type: 'combine',
          fields: [...selectedFields, fieldWithType],
          separator: separator
        });
      }
    });
  };

  const handleSeparatorChange = (newSeparator: string) => {
    setSeparator(newSeparator);
    if (mappingType === 'combine' && selectedFields.length > 0) {
      onFieldChange({
        targetField: fieldName,
        type: 'combine',
        fields: selectedFields,
        separator: newSeparator
      });
    }
  };

  const handleMappingTypeSelect = (type: string) => {
    handleMappingTypeChange(type);
    if (type === 'empty') {
      onFieldChange({
        targetField: fieldName,
        type: 'empty'
      });
    } else if (type === 'static') {
      setStaticValue('');
      onFieldChange({
        targetField: fieldName,
        type: 'static',
        value: ''
      });
    }
  };

  const handleAddField = () => {
    if (!isLocked) {
      setDropdownState(prev => ({ ...prev, isFieldDropdownOpen: true }));
    }
  };

  const handleCloseDropdown = () => {
    setDropdownState(prev => ({ ...prev, isFieldDropdownOpen: false }));
  };

  return (
    <div className="border-b border-gray-200">
      <div className="p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
            {/* Comments Button */}
            <button
              onClick={onCommentClick} // This will trigger the field-specific comment dialog
              disabled={isLocked}
              className={`btn-sm flex items-center gap-2 ${isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Comments</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Lock/Unlock Button */}
            <button
              onClick={toggleLock}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isLocked
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
            >
              {isLocked ? (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Unlock</span>
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  <span>Lock</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mapping Controls */}
        <div className="grid grid-cols-12 gap-4">
          {/* Field Name */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">{fieldName}</span>
              {helpText && (
                <div className="text-gray-400 cursor-help" title={helpText}>
                  <span className="text-xs">?</span>
                </div>
              )}
            </div>
          </div>

          {/* Mapping Type Dropdown */}
          <div className="col-span-2">
            <div className="relative">
              <button
                onClick={() => toggleDropdown('mapping-type')}
                disabled={isLocked}
                className={`w-full px-3 py-2 text-left text-sm border rounded-md flex items-center justify-between bg-white ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
              >
                <span>{mappingTypes.find(t => t.value === mappingType)?.label || 'Rename'}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {activeDropdown === 'mapping-type' && !isLocked && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                  {mappingTypes.map((type) => (
                    <button
                      key={type.value}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => handleMappingTypeSelect(type.value)}
                    >
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Field Selection Area */}
          <div className="col-span-4">
            <div className="relative">
              {mappingType === 'combine' ? (
                <CombineFieldsUI
                  selectedFields={selectedFields}
                  onAddField={handleAddField}
                  onRemoveField={handleRemoveField}
                  onSeparatorChange={handleSeparatorChange}
                  separator={separator}
                  onFieldBoxClick={handleAddField}
                  isLocked={isLocked}
                />
              ) : mappingType === 'static' ? (
                <input
                  type="text"
                  value={staticValue}
                  onChange={handleStaticValueChange}
                  disabled={isLocked}
                  placeholder="Enter static value..."
                  className={`w-full px-3 py-2 text-sm border rounded-md ${isLocked ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                />
              ) : (
                <button
                  onClick={handleAddField}
                  disabled={isLocked}
                  className={`w-full px-3 py-2 text-left text-sm border rounded-md flex items-center justify-between bg-white ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                >
                  <span>{selectedField || 'Select field'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}

              {!isLocked && (
                <FieldSelectionDropdown
                  isOpen={isFieldDropdownOpen}
                  onClose={handleCloseDropdown}
                  onSelect={handleFieldSelection}
                  selectedValue={selectedField}
                  fieldOptions={fieldOptions}
                  mode={mappingType === 'combine' ? 'combine' : 'single'}
                  mappingType={mappingType}
                />
              )}
            </div>
          </div>

          {/* Condition Toggle */}
          <div className="col-span-2">
            <div className="flex rounded-md overflow-hidden border">
              <button
                disabled={isLocked}
                className={`flex-1 px-3 py-2 text-sm bg-white border-r ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
              >
                All Products
              </button>
              <button
                disabled={isLocked}
                className={`flex-1 px-3 py-2 text-sm bg-white ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
              >
                Only IF
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="col-span-2 flex justify-end gap-2">
            <button
              onClick={onEditClick}
              disabled={isLocked}
              className={`p-2 rounded-md ${isLocked
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <PenSquare className="h-4 w-4" />
            </button>
            <button
              onClick={onPreviewClick}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappingField;