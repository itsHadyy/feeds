import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { XMLData } from '../types/xml';

interface XMLUploaderProps {
  onFieldsExtracted: (data: XMLData) => void;
}

const XMLUploader: React.FC<XMLUploaderProps> = ({ onFieldsExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseXMLFile = async (file: File) => {
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      
      // Check if the XML is valid
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        throw new Error('Invalid XML format');
      }
      
      const items = xmlDoc.getElementsByTagName('item');
      if (items.length === 0) {
        throw new Error('No items found in XML');
      }

      // Extract schema from all items
      const schema = new Map<string, { required?: boolean; helpText?: string }>();
      Array.from(items).forEach(item => {
        Array.from(item.children).forEach(child => {
          if (!schema.has(child.nodeName)) {
            schema.set(child.nodeName, {
              required: child.hasAttribute('required'),
              helpText: child.getAttribute('description') || undefined
            });
          }
        });
      });

      // Extract data from all items
      const itemsData = Array.from(items).map(item => {
        const itemData: { [key: string]: string } = {};
        Array.from(item.children).forEach(child => {
          if (child.textContent) {
            itemData[child.nodeName] = child.textContent;
          }
        });
        return itemData;
      });

      // Convert schema to array format
      const schemaArray = Array.from(schema.entries()).map(([name, props]) => ({
        name,
        ...props
      }));

      onFieldsExtracted({
        items: itemsData,
        schema: schemaArray
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error parsing XML file');
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.xml')) {
      setFileName(file.name);
      await parseXMLFile(file);
    } else {
      setError('Please upload a valid XML file');
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.xml')) {
      setFileName(file.name);
      await parseXMLFile(file);
    } else if (file) {
      setError('Please upload a valid XML file');
    }
  };

  const clearFile = () => {
    setFileName(null);
    setError(null);
    onFieldsExtracted({ items: [], schema: [] });
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".xml"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your XML file here, or click to browse
          </p>
          <p className="mt-1 text-xs text-gray-500">Only XML files are supported</p>
        </div>

        {fileName && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-700">{fileName}</span>
            </div>
            <button
              onClick={clearFile}
              className="p-1 hover:bg-gray-200 rounded-full"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default XMLUploader;