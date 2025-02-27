import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { FieldOption } from '../types/mapping';

interface FieldSelectionDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (field: FieldOption) => void;
  selectedValue?: string;
  fieldOptions: FieldOption[];
  mode?: 'single' | 'combine';
  mappingType?: string;
}

const FieldSelectionDropdown: React.FC<FieldSelectionDropdownProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedValue,
  fieldOptions = [], // Provide default empty array
  mode = 'single',
  mappingType = 'rename',
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'input' | 'text'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [staticValue, setStaticValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (mappingType === 'rename' && activeTab === 'text') {
      setActiveTab('all');
    }
  }, [mappingType]);

  const getFilteredFields = () => {
    if (activeTab === 'text') return [];
    
    let filteredFields = fieldOptions;

    if (activeTab === 'input') {
      filteredFields = filteredFields.filter(field => field?.type === 'input');
    }

    if (searchTerm) {
      filteredFields = filteredFields.filter(field =>
        field?.label?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredFields;
  };

  const handleStaticValueSubmit = () => {
    if (staticValue.trim()) {
      onSelect({
        value: staticValue.trim(),
        label: staticValue.trim(),
        type: 'custom'
      });
      setStaticValue('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && staticValue.trim()) {
      handleStaticValueSubmit();
    }
  };

  const handleFieldSelect = (field: FieldOption) => {
    if (!field) return;
    onSelect({
      ...field,
      type: field.type || 'input' // Ensure type is always defined
    });
    // Close dropdown immediately for rename mode
    if (mappingType === 'rename') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'input'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('input')}
        >
          Input Fields
        </button>
        {mappingType !== 'rename' && (
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'text'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('text')}
          >
            Enter Text
          </button>
        )}
      </div>

      {activeTab === 'text' ? (
        <div className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={staticValue}
              onChange={(e) => setStaticValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter static value..."
              className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={handleStaticValueSubmit}
              disabled={!staticValue.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                staticValue.trim()
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {getFilteredFields().map((field) => (
              <button
                key={field.value}
                className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between ${
                  selectedValue === field.value ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleFieldSelect(field)}
              >
                <span>{field.label}</span>
                {field.type && (
                  <span className="text-xs text-gray-500">
                    {field.type === 'input' ? 'Input' : ''}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FieldSelectionDropdown;