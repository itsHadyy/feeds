import React, { useState } from 'react';
import { Search, ChevronDown, MessageSquare, Shapes, PenSquare, Eye, Edit2, Save } from 'lucide-react';

interface Field {
  name: string;
  value: string;
  category: string;
}

interface FieldMapperProps {
  fields: Field[];
  onFieldsUpdate: (fields: Field[]) => void;
}

const FieldMapper: React.FC<FieldMapperProps> = ({ fields, onFieldsUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('input');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [selectedMapping, setSelectedMapping] = useState('Rename'); // Default mapping type
  const [conditionType, setConditionType] = useState('All Products'); // Toggle between All Products & Only IF
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const categories = ['General', 'Product Info', 'Pricing', 'Media'];

  const mappingTypes = [
    { value: 'rename', label: 'Rename' },
    { value: 'static', label: 'Add static value' },
    { value: 'combine', label: 'Combine' },
    { value: 'lookup_table', label: 'Use lookup table' },
    { value: 'extract_from', label: 'Extract from' },
    { value: 'empty', label: 'Leave empty' },
  ];

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleMappingSelection = (type: string) => {
    setSelectedMapping(type);
    setActiveDropdown(null);
  };

  const handleCategoryChange = (fieldName: string, newCategory: string) => {
    const updatedFields = fields.map(field =>
      field.name === fieldName ? { ...field, category: newCategory } : field
    );
    onFieldsUpdate(updatedFields);
  };

  const handleValueChange = (fieldName: string, newValue: string) => {
    const updatedFields = fields.map(field =>
      field.name === fieldName ? { ...field, value: newValue } : field
    );
    onFieldsUpdate(updatedFields);
  };

  const handleFieldSelection = (fieldName: string) => {
    setSelectedField(fieldName);
  };

  return (
    <div className="space-y-8">
      {/* Field Mapper Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Header Actions */}
          <div className="flex items-center gap-4 mb-6 border-b pb-4">
            <button className="btn-sm flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <MessageSquare className="h-4 w-4" />
              <span>Comments</span>
            </button>
            <button className="btn-sm flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <Shapes className="h-4 w-4" />
              <span>A/B Tests</span>
            </button>
          </div>

          {/* Mapping Controls */}
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Mapping Type Dropdown */}
              <div className="col-span-2">
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('mapping-type')}
                    className="w-full px-3 py-2 text-left text-sm border rounded-md flex items-center justify-between bg-white"
                  >
                    <span>{selectedMapping}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {activeDropdown === 'mapping-type' && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                      {mappingTypes.map((type) => (
                        <button
                          key={type.value}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                          onClick={() => handleMappingSelection(type.label)}
                        >
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Field Selection */}
              <div className="col-span-4">
                <div className="relative">
                  <select
                    className="w-full px-3 py-2 text-sm border rounded-md bg-white"
                    value={selectedField || ''}
                    onChange={(e) => handleFieldSelection(e.target.value)}
                  >
                    <option value="">Select field</option>
                    {fields.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition Toggle */}
              <div className="col-span-3">
                <div className="flex rounded-md overflow-hidden border">
                  <button
                    className={`flex-1 px-3 py-2 text-sm ${
                      conditionType === 'All Products' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setConditionType('All Products')}
                  >
                    All Products
                  </button>
                  <button
                    className={`flex-1 px-3 py-2 text-sm ${
                      conditionType === 'Only IF' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setConditionType('Only IF')}
                  >
                    Only IF
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-3 flex justify-end gap-2">
                <button className="p-2 text-gray-600 hover:text-gray-800 rounded-md">
                  <PenSquare className="h-4 w-4" />
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mapped Fields Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {fields.map((field) => (
          <div key={field.name} className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">{field.name}</span>
              {editingField === field.name ? (
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleValueChange(field.name, e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
              ) : (
                <span className="text-sm text-gray-500">{field.value}</span>
              )}
              <select
                value={field.category}
                onChange={(e) => handleCategoryChange(field.name, e.target.value)}
                className="border rounded px-2 py-1"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button onClick={() => setEditingField(field.name)}>
                <Edit2 className="h-4 w-4 text-blue-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldMapper;