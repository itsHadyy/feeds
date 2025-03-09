import React, { useState, useEffect, useCallback } from 'react';
import { Save, Undo, Settings, ArrowLeft } from 'lucide-react'; // Import icons
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
  const { shops, addShop, deleteShop, updateShop, uploadXMLToShop } = useShops();

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

  // State for settings view
  const [showSettings, setShowSettings] = useState(false);

  // State for feedback messages
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

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
    setFeedbackMessage('Changes saved successfully!');
    setTimeout(() => setFeedbackMessage(null), 3000); // Clear feedback message after 3 seconds
    // Add your save logic here (e.g., save to backend)
  }, [mappings, comments, mappingFields]);

  // Handle discard changes button click
  const handleDiscardChanges = useCallback(() => {
    console.log('Changes discarded');
    setHasUnsavedChanges(false); // Mark changes as discarded
    setMappings(lastSavedState.mappings); // Revert to last saved mappings
    setComments(lastSavedState.comments); // Revert to last saved comments
    setMappingFields(lastSavedState.mappingFields); // Revert to last saved mapping fields
    setFeedbackMessage('Changes discarded successfully!');
    setTimeout(() => setFeedbackMessage(null), 3000); // Clear feedback message after 3 seconds
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
    setShowSettings(false); // Reset settings view
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
            {/* Navigation Bar */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  <Settings className="h-4 w-4 inline-block mr-2" />
                  Settings
                </button>

                {/* Back Button */}
                <button
                  onClick={handleBackClick}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 inline-block mr-2" />
                  Back to Shops
                </button>
              </div>
            </div>

            {/* Shop Name and ID */}
            <div className="mt-4">
              <h2 className="text-2xl font-semibold">
                {shops.find((shop) => shop.id === selectedShopId)?.name}
              </h2>
              <p className="text-sm text-gray-500">ID: {selectedShopId}</p>
            </div>

            {/* Settings View */}
            {showSettings ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Settings</h3>

                {/* Change Shop Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Shop Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shops.find((shop) => shop.id === selectedShopId)?.name || ''}
                      onChange={(e) => {
                        const newName = e.target.value;
                        updateShop(selectedShopId, newName);
                        setHasUnsavedChanges(true); // Mark changes as unsaved
                      }}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Re-upload XML */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-2">Re-upload XML</h4>
                  <XMLUploader
                    shopId={selectedShopId}
                    onFieldsExtracted={handleFieldsExtracted}
                  />
                </div>

                {/* Delete Shop */}
                <div>
                  <button
                    onClick={() => deleteShop(selectedShopId)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete Shop
                  </button>
                </div>

                {/* Save and Discard Changes Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={handleDiscardChanges}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    <Undo className="h-4 w-4 inline-block mr-2" />
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSaveClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 inline-block mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* XML Upload Section (Visible only during shop creation) */}
                {!shops.find((shop) => shop.id === selectedShopId)?.xmlContent && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload XML File</h2>
                    <XMLUploader
                      shopId={selectedShopId}
                      onFieldsExtracted={handleFieldsExtracted}
                    />
                  </div>
                )}

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

                {/* Save and Discard Changes Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={handleDiscardChanges}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    <Undo className="h-4 w-4 inline-block mr-2" />
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSaveClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 inline-block mr-2" />
                    Save Changes
                  </button>
                </div>
              </>
            )}

            {/* Feedback Message */}
            {feedbackMessage && (
              <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
                {feedbackMessage}
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