import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SeparatorOption {
  value: string;
  label: string;
}

interface SeparatorDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  isLocked?: boolean;
}

const SeparatorDropdown: React.FC<SeparatorDropdownProps> = ({
  value,
  onChange,
  onClose,
  isLocked = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'separator' | 'text'>('separator');
  const [customText, setCustomText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Simplified separator options - value is the actual separator
  const separatorOptions: SeparatorOption[] = [
    { value: '', label: 'None' },
    { value: ' ', label: 'Space' },
    { value: ',', label: 'Comma (,)' },
    { value: ';', label: 'Semicolon (;)' },
    { value: ':', label: 'Colon (:)' },
    { value: '-', label: 'Dash (-)' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSelect = (separatorValue: string) => {
    onChange(separatorValue);
    setIsOpen(false);
  };

  const handleConfirmCustomText = () => {
    if (customText.trim()) {
      onChange(customText);
      setCustomText('');
      setIsOpen(false);
    }
  };

  const getCurrentSeparatorLabel = () => {
    const option = separatorOptions.find(opt => opt.value === value);
    return option ? option.label : value || 'None';
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => !isLocked && setIsOpen(!isOpen)}
        disabled={isLocked}
        className={`w-full px-3 py-2 text-sm border rounded-md flex items-center justify-between bg-white ${
          isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'
        }`}
      >
        <span className="text-gray-700 truncate max-w-[160px]">{getCurrentSeparatorLabel()}</span>
        <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </button>

      {isOpen && !isLocked && (
        <div className="absolute z-20 w-[300px] mt-1 bg-white border rounded-md shadow-lg">
          <div className="flex border-b">
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'separator'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('separator')}
            >
              Common Separators
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'text'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('text')}
            >
              Custom Separator
            </button>
          </div>

          {activeTab === 'separator' ? (
            <div className="py-1">
              {separatorOptions.map((option) => (
                <button
                  key={option.value}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700"
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter custom separator..."
                className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mb-2"
                autoFocus
              />
              <button
                onClick={handleConfirmCustomText}
                disabled={!customText.trim()}
                className={`w-full px-4 py-1.5 text-sm font-medium rounded-md ${
                  customText.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeparatorDropdown;