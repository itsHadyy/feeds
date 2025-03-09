import React, { useState, useEffect, useCallback } from 'react';
import { Save, Undo } from 'lucide-react'; // Import Undo icon for Cancel Changes
import MappingField from './components/MappingField';
import XMLUploader from './components/XMLUploader';
import ShopDashboard from './components/ShopDashboard';
import { FieldOption } from './types/mapping';
import { XMLData, XMLField, XMLMapping } from './types/xml';
import { XMLManager } from './services/XMLManager';
import useShops from './hooks/useShops';

function App() {
  const [xmlManager] = useState(() => new XMLManager());
  const [mappingFields, setMappingFields] = useState<XMLField[]>([]);
  const [mappings, setMappings] = useState<XMLMapping[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const { shops, addShop, uploadXMLToShop } = useShops();

  // State for comments, preview, and unsaved changes
  const [comments, setComments] = useState<{ [fieldName: string]: string }>({});
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewField, setPreviewField] = useState<XMLField | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track unsaved changes
  const [lastSavedState, setLastSavedState] = useState<{
    mappings: XMLMapping[];
    comments: { [fieldName: string]: string };
    mappingFields: XMLField[];
  }>({ mappings: [], comments: {}, mappingFields: [] }); // Track last saved state

  // Load comments from localStorage on component mount
  useEffect(() => {
    const savedComments: { [fieldName: string]: string } = {};
    mappingFields.forEach((field) => {
      const comment = localStorage.getItem(`comments-${field.name}`);
      if (comment) {
        savedComments[field.name] = comment;
      }
    });
    setComments(savedComments);
  }, [mappingFields]);

  // Get available field options for mapping
  const getFieldOptions = useCallback((xmlData: XMLData | null): FieldOption[] => {
    if (!xmlData) return [];
    const uniqueKeys = new Set<string>();
    xmlData.items.forEach((item) => {
      Object.keys(item).forEach((key) => uniqueKeys.add(key));
    });
    return Array.from(uniqueKeys).map((key) => ({
      value: key,
      label: key,
      type: 'input',
    }));
  }, []);

  // Handle field mapping changes
  const handleFieldChange = useCallback((fieldName: string, mapping: XMLMapping) => {
    setMappings((prev) => {
      const existingIndex = prev.findIndex((m) => m.targetField === fieldName);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...mapping, targetField: fieldName };
        return updated;
      }
      return [...prev, { ...mapping, targetField: fieldName }];
    });

    // Mark changes as unsaved
    setHasUnsavedChanges(true);

    // Update the field value in mappingFields
    setMappingFields((prev) =>
      prev.map((field) =>
        field.name === fieldName
          ? { ...field, value: mapping.value || field.value }
          : field
      )
    );
  }, []);

  // Handle save button click
  const handleSaveClick = useCallback(() => {
    console.log('Changes saved');
    setHasUnsavedChanges(false); // Mark changes as saved
    setLastSavedState({ mappings, comments, mappingFields }); // Update last saved state
    // Add your save logic here (e.g., save to backend)
  }, [mappings, comments, mappingFields]);

  // Handle cancel changes button click
  const handleCancelChanges = useCallback(() => {
    console.log('Changes canceled');
    setHasUnsavedChanges(false); // Mark changes as canceled
    setMappings(lastSavedState.mappings); // Revert to last saved mappings
    setComments(lastSavedState.comments); // Revert to last saved comments
    setMappingFields(lastSavedState.mappingFields); // Revert to last saved mapping fields
  }, [lastSavedState]);

  // Handle navigation away without saving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Handle back button click
  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      const confirmNavigation = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmNavigation) return;
    }
    setSelectedShopId(null);
  };

  // Extract fields from uploaded XML
  const handleFieldsExtracted = useCallback((data: XMLData) => {
    xmlManager.setData(data);
    const uniqueFields = new Set(data.items.flatMap((item) => Object.keys(item)));
    const newMappingFields = Array.from(uniqueFields).map((field) => ({
      name: field,
      value: '',
      required: data.schema.find((s) => s.name === field)?.required || false,
      helpText: data.schema.find((s) => s.name === field)?.helpText,
    }));
    setMappingFields(newMappingFields);
    setMappings([]);
    setLastSavedState({ mappings: [], comments: {}, mappingFields: newMappingFields }); // Initialize last saved state
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

  // Load XML content for the selected shop
  useEffect(() => {
    if (selectedShopId) {
      const selectedShop = shops.find((shop) => shop.id === selectedShopId);
      if (selectedShop && selectedShop.xmlContent) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(selectedShop.xmlContent, 'text/xml');
        const items = xmlDoc.getElementsByTagName('item');
        const schema = new Map<string, { required?: boolean; helpText?: string }>();
        Array.from(items).forEach((item) => {
          Array.from(item.children).forEach((child) => {
            if (!schema.has(child.nodeName)) {
              schema.set(child.nodeName, {
                required: child.hasAttribute('required'),
                helpText: child.getAttribute('description') || undefined,
              });
            }
          });
        });

        const itemsData = Array.from(items).map((item) => {
          const itemData: { [key: string]: string } = {};
          Array.from(item.children).forEach((child) => {
            if (child.textContent) {
              itemData[child.nodeName] = child.textContent;
            }
          });
          return itemData;
        });

        const schemaArray = Array.from(schema.entries()).map(([name, props]) => ({
          name,
          ...props,
        }));

        handleFieldsExtracted({ items: itemsData, schema: schemaArray });
      }
    }
  }, [selectedShopId, shops, handleFieldsExtracted]);

  // Handle comment button click
  const handleCommentClick = (fieldName: string) => {
    console.log('Comments button clicked for field:', fieldName);
    const comment = prompt('Enter your comment:');
    if (comment !== null) {
      setComments((prev) => ({
        ...prev,
        [fieldName]: comment,
      }));
      localStorage.setItem(`comments-${fieldName}`, comment);
    }
  };

  // Handle preview button click
  const handlePreviewClick = (field: XMLField) => {
    console.log('Preview button clicked for field:', field.name);
    setPreviewField(field);
    setShowPreviewDialog(true);
  };

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
              onClick={handleBackClick}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
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
                    {/* Save Button */}
                    <button
                      onClick={handleSaveClick}
                      disabled={!hasUnsavedChanges}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${!hasUnsavedChanges
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>

                    {/* Cancel Changes Button */}
                    <button
                      onClick={handleCancelChanges}
                      disabled={!hasUnsavedChanges}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${!hasUnsavedChanges
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                      <Undo className="h-4 w-4" />
                      <span>Cancel Changes</span>
                    </button>

                    {/* Apply & Download Button */}
                    <button
                      onClick={handleApplyChanges}
                      disabled={mappings.length === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${mappings.length === 0
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
              <XMLUploader shopId={selectedShopId} onFieldsExtracted={handleFieldsExtracted} />
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
                    onPreviewClick={() => handlePreviewClick(field)}
                    onCommentClick={() => handleCommentClick(field.name)}
                    onABTestClick={() => console.log('A/B Test clicked')}
                    onEditClick={() => console.log('Edit clicked')}
                  />
                ))}
              </div>
            )}

            {/* Preview Dialog */}
            {showPreviewDialog && previewField && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg w-96">
                  <h2 className="text-lg font-semibold mb-4">Preview: {previewField.name}</h2>
                  <div className="space-y-2">
                    <p>
                      <strong>Field Name:</strong> {previewField.name}
                    </p>
                    <p>
                      <strong>Field Value:</strong> {previewField.value}
                    </p>
                    <p>
                      <strong>Comment:</strong> {comments[previewField.name] || 'No comment'}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setShowPreviewDialog(false)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
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