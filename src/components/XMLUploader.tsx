import React, { useState } from 'react';
import { Upload, FileText, X, Link as LinkIcon, Save } from 'lucide-react';
import { XMLData } from '../types/xml';
import useShops from "../hooks/useShops";

interface XMLUploaderProps {
  onFieldsExtracted: (data: XMLData) => void;
  shopId: string;
  onUploadSuccess?: () => void; // Callback for successful upload
}

const XMLUploader: React.FC<XMLUploaderProps> = ({ onFieldsExtracted, shopId, onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [xmlUrl, setXmlUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { uploadXMLToShop } = useShops();
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const parseXMLContent = (text: string) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid XML format');
      }

      const items = xmlDoc.getElementsByTagName('item');
      if (items.length === 0) throw new Error('No items found in XML');

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

      onFieldsExtracted({ items: itemsData, schema: schemaArray });
      setError(null);
      setXmlContent(text); // Store the XML content
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error parsing XML data');
      console.error(err);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      setFileName(file.name);
      parseXMLContent(text);
    } catch (error) {
      setError("Failed to read the XML file.");
    }
  };

  const handleUrlUpload = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/fetch-xml?url=${encodeURIComponent(xmlUrl)}`, {
        mode: 'cors',
      });

      if (!response.ok) throw new Error('Failed to fetch XML');

      const text = await response.text();
      parseXMLContent(text);
      setFileName(xmlUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching XML');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (xmlContent && shopId) {
      try {
        // Log the size of the XML content
        console.log("XML Content Size:", xmlContent.length);

        // Check if the content exceeds localStorage quota
        if (xmlContent.length > 5 * 1024 * 1024) { // 5MB limit
          throw new Error("XML content is too large for localStorage. Consider using a backend database.");
        }

        await uploadXMLToShop(shopId, xmlContent); // Save XML content to the shop
        setSaveSuccess(true); // Show success message
        setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds

        // Trigger the onUploadSuccess callback if provided
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error saving XML');
        console.error("Error saving XML:", err);
      }
    } else {
      setError("No XML content or shop ID provided.");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* File upload and URL input UI */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file && file.name.toLowerCase().endsWith('.xml')) {
            handleFileUpload(file);
          } else {
            setError('Please upload a valid XML file');
          }
        }}
      >
        <input
          type="file"
          accept=".xml"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.name.toLowerCase().endsWith('.xml')) {
              handleFileUpload(file);
            } else if (file) {
              setError('Please upload a valid XML file');
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Drag and drop an XML file, or click to browse</p>
          <p className="mt-1 text-xs text-gray-500">Only XML files are supported</p>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm font-medium">OR</div>

      <div className="flex items-center gap-2">
        <input
          type="url"
          placeholder="Enter XML file URL..."
          value={xmlUrl}
          onChange={(e) => setXmlUrl(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleUrlUpload}
          disabled={loading || !xmlUrl}
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${!xmlUrl
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          <LinkIcon className="h-4 w-4" />
          <span>{loading ? 'Loading...' : 'Fetch XML'}</span>
        </button>
      </div>

      {fileName && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-700">{fileName}</span>
          </div>
          <button onClick={() => setFileName(null)} className="p-1 hover:bg-gray-200 rounded-full">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}

      {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

      {xmlContent && (
        <div className="mt-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Save className="h-4 w-4" />
            <span>Save XML</span>
          </button>
          {saveSuccess && (
            <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-md text-sm">
              XML file saved successfully!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default XMLUploader;