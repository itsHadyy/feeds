import React, { useState } from 'react';
import { Search, ChevronDown, MessageSquare, Shapes, PenSquare, Eye, Edit2, Save, X } from 'lucide-react';

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
  const [categories] = useState<string[]>(['General', 'Product Info', 'Pricing', 'Media']);

  const mappingTypes = [
    { value: 'rename', label: 'Rename', description: 'Use values from the selected field from your shop.' },
    { value: 'static', label: 'Add static value', description: 'Use a specific text as a value of this field.' },
    { value: 'combine', label: 'Combine', description: 'Use content of more than one field combined together.' },
    { value: 'lookup_table', label: 'Use lookup table', description: 'Use your shop\'s field and replace specific values.' },
    { value: 'extract_from', label: 'Extract from', description: 'Extract specific text values from selected field.' },
    { value: 'empty', label: 'Leave empty', description: 'Use empty value as the content.' },
  ];

  const toggleDropdown = (fieldName: string) => {
    setActiveDropdown(activeDropdown === fieldName ? null : fieldName);
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

  // Create a unique list of fields for the dropdown
  const uniqueFields = Array.from(new Set(fields.map(f => f.name))).map(name => {
    return fields.find(f => f.name === name)!;
  });

  // Group fields by category
  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, Field[]>);

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
                    <span>Rename</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {activeDropdown === 'mapping-type' && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                      {mappingTypes.map((type) => (
                        <button
                          key={type.value}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                          onClick={() => toggleDropdown('mapping-type')}
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
                  >
                    <option value="">Select field</option>
                    {uniqueFields.map((f, index) => (
                      <option key={`field-select-${f.name}-${index}`} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition Toggle */}
              <div className="col-span-3">
                <div className="flex rounded-md overflow-hidden border">
                  <button className="flex-1 px-3 py-2 text-sm bg-white hover:bg-gray-50 border-r">
                    All Products
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-white hover:bg-gray-50">
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
        {Object.entries(groupedFields).map(([category, categoryFields]) => (
          <div key={`category-${category}`} className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 px-6 py-4 border-b">
              {category}
            </h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryFields.map((field, index) => (
                  <tr key={`${category}-${field.name}-${index}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {field.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingField === field.name ? (
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleValueChange(field.name, e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        field.value
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={field.category}
                        onChange={(e) => handleCategoryChange(field.name, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        {categories.map((cat) => (
                          <option key={`${field.name}-category-${cat}`} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingField === field.name ? (
                        <button
                          onClick={() => setEditingField(null)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingField(field.name)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldMapper;