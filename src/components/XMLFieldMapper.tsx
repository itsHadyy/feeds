import React, { useState } from 'react';
import { Save, Edit2, X } from 'lucide-react';

interface XMLField {
  name: string;
  value: string;
  category: string;
}

interface XMLFieldMapperProps {
  fields: XMLField[];
  onFieldsUpdate: (fields: XMLField[]) => void;
}

const XMLFieldMapper: React.FC<XMLFieldMapperProps> = ({ fields, onFieldsUpdate }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [categories] = useState<string[]>(['General', 'Product Info', 'Pricing', 'Media']);

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

  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, XMLField[]>);

  return (
    <div className="mt-8 w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">XML Field Mapping</h2>
      
      {Object.entries(groupedFields).map(([category, categoryFields], categoryIndex) => (
        <div key={`xml-category-${category}-${categoryIndex}`} className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-3">{category}</h3>
          <div className="bg-white rounded-lg shadow">
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
                {categoryFields.map((field, fieldIndex) => {
                  const uniqueFieldId = `xml-field-${category}-${field.name}-${fieldIndex}`;
                  return (
                    <tr key={uniqueFieldId}>
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
                          {categories.map((cat, catIndex) => (
                            <option key={`${uniqueFieldId}-category-${cat}-${catIndex}`} value={cat}>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default XMLFieldMapper;