import React, { useState, useCallback } from 'react';
import { Save } from 'lucide-react';
import MappingField from './components/MappingField';
import XMLUploader from './components/XMLUploader';
import ShopDashboard from './components/ShopDashboard';
import { FieldOption } from './types/mapping';
import { XMLData, XMLField, XMLMapping } from './types/xml';
import { XMLManager } from './services/XMLManager';

function App() {
  const [xmlManager] = useState(() => new XMLManager());
  const [mappingFields, setMappingFields] = useState<XMLField[]>([]);
  const [mappings, setMappings] = useState<XMLMapping[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  // Get available field options for mapping
  const getFieldOptions = useCallback((xmlData: XMLData | null): FieldOption[] => {
    if (!xmlData) return [];
    const uniqueKeys = new Set<string>();
    xmlData.items.forEach(item => {
      Object.keys(item).forEach(key => uniqueKeys.add(key));
    });
    return Array.from(uniqueKeys).map(key => ({
      value: key,
      label: key,
      type: 'input'
    }));
  }, []);

  // Handle field mapping changes
  const handleFieldChange = useCallback((fieldName: string, mapping: XMLMapping) => {
    setMappings(prev => {
      const existingIndex = prev.findIndex(m => m.targetField === fieldName);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...mapping, targetField: fieldName };
        return updated;
      }
      return [...prev, { ...mapping, targetField: fieldName }];
    });
  }, []);

  // Extract fields from uploaded XML
  const handleFieldsExtracted = useCallback((data: XMLData) => {
    xmlManager.setData(data);
    const uniqueFields = new Set(data.items.flatMap(item => Object.keys(item)));
    setMappingFields(Array.from(uniqueFields).map(field => ({
      name: field,
      value: '',
      required: data.schema.find(s => s.name === field)?.required || false,
      helpText: data.schema.find(s => s.name === field)?.helpText
    })));
    setMappings([]);
  }, [xmlManager]);

  // Apply field mappings and generate XML
  const handleApplyChanges = useCallback(() => {
    const xmlData = xmlManager.getData();
    if (!xmlData || mappings.length === 0) return;
    const updatedData = xmlManager.applyMappings(mappings);
    if (updatedData) {
      const xmlString = xmlManager.generateXML(updatedData.items);
      xmlManager.downloadXML(xmlString);
    }
  }, [xmlManager, mappings]);

  const xmlData = xmlManager.getData();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">

        {/* Shop Selection */}
        {!selectedShopId ? (
          <ShopDashboard onSelectShop={setSelectedShopId} />
        ) : (
          <>
            <button
              onClick={() => setSelectedShopId(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Back to Shops
            </button>

            <h2 className="text-2xl font-semibold mt-4">Shop ID: {selectedShopId}</h2>

            {/* XML Upload Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upload XML File</h2>
                {mappingFields.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleApplyChanges}
                      disabled={mappings.length === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md ${mappings.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      <Save className="h-4 w-4" />
                      <span>Apply & Download</span>
                    </button>
                  </div>
                )}
              </div>
              <XMLUploader onFieldsExtracted={handleFieldsExtracted} />
            </div>

            {/* Field Mapping Section */}
            {mappingFields.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {mappingFields.map((field) => (
                  <MappingField
                    key={field.name}
                    fieldName={field.name}
                    fieldValue={field.value}
                    fieldOptions={getFieldOptions(xmlData)}
                    helpText={field.helpText}
                    onFieldChange={(mapping) => handleFieldChange(field.name, mapping)}
                    onPreviewClick={() => console.log('Preview clicked')}
                    onCommentClick={() => console.log('Comment clicked')}
                    onABTestClick={() => console.log('A/B Test clicked')}
                    onEditClick={() => console.log('Edit clicked')}
                  />
                ))}
              </div>
            )}

            
          </>
        )}

        {/* Empty State */}
        {mappingFields.length === 0 && !selectedShopId && (
          <div className="text-center py-12">
            <p className="text-gray-500">Select a shop and upload an XML file to start mapping fields</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;