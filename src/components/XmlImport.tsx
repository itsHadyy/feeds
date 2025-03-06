// components/XmlImport.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useShops from '../hooks/useShops';
import { xml2js } from 'xml-js';

const XmlImport: React.FC = () => {
    const [xmlFiles, setXmlFiles] = useState<FileList | null>(null);
    const navigate = useNavigate();
    const { uploadXMLToShop } = useShops();
    const shopName = localStorage.getItem('shopName');
    const shops = JSON.parse(localStorage.getItem('shops') || "[]");
    const shopId = shops.find((shop: { name: string; }) => shop.name === shopName)?.id;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setXmlFiles(event.target.files);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (xmlFiles) {
            const file = xmlFiles[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                const xmlContent = e.target?.result as string;
                if (shopId) {
                    uploadXMLToShop(shopId, xmlContent);
                    navigate('/loading'); // Redirect to loading page
                }
            };

            reader.readAsText(file);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="xmlFiles">Upload XML Files:</label>
                <input type="file" id="xmlFiles" accept=".xml" onChange={handleFileChange} />
            </div>
            <button type="submit">Next</button>
        </form>
    );
};

export default XmlImport;