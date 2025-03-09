import React, { useState } from "react";
import ShopManager from "./ShopManager";
import useShops from "../hooks/useShops";
import XMLUploader from "./XMLUploader";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { CopyIcon } from "@radix-ui/react-icons";
import { EditIcon, SaveIcon, TrashIcon, CheckIcon } from "lucide-react";
import { XMLManager } from "../services/XMLManager"; // Import XMLManager

interface ShopDashboardProps {
    onSelectShop: (shopId: string) => void;
}

const ShopDashboard: React.FC<ShopDashboardProps> = ({ onSelectShop }) => {
    const { shops, addShop, deleteShop, updateShop } = useShops();
    const [editingShopId, setEditingShopId] = useState<string | null>(null);
    const [editedName, setEditedName] = useState<string>("");
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

    // Helper function to count products in XML
    const countProductsInXML = (xmlContent: string): number => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
            const items = xmlDoc.getElementsByTagName("item");
            return items.length;
        } catch (err) {
            console.error("Error parsing XML:", err);
            return 0;
        }
    };

    // Helper function to generate a downloadable XML link using XMLManager
    const getXMLDownloadLink = (xmlContent: string): string => {
        const xmlManager = new XMLManager();
        const parsedData = xmlManager.parseXMLString(xmlContent); // Parse the XML content
        xmlManager.setData(parsedData); // Initialize XMLManager with the parsed data
        const modifiedXML = xmlManager.generateXML(); // Generate modified XML
        return xmlManager.generateDownloadLink(modifiedXML); // Generate download link
    };

    const handleEditClick = (shopId: string, currentName: string) => {
        setEditingShopId(shopId);
        setEditedName(currentName);
    };

    const handleSaveEdit = (shopId: string) => {
        updateShop(shopId, editedName);
        setEditingShopId(null);
    };

    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(link);
    };

    const handleSelectShop = (shopId: string) => {
        setSelectedShopId(shopId);
        onSelectShop(shopId);
    };

    const handleDeleteShop = (shopId: string) => {
        deleteShop(shopId);
        setShowDeleteModal(null);
    };

    return (
        <div className="mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Shops</h2>

            {/* Add Shop */}
            <ShopManager onAddShop={addShop} />

            {/* Shop List */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ backgroundColor: "#f0f0f0" }}>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Shop Name</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Source Link</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>File Type</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Last Update</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Product Count</th>
                    </tr>
                </thead>
                <tbody>
                    {shops.map((shop) => (
                        <tr
                            key={shop.id}
                            onClick={() => handleSelectShop(shop.id)}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{shop.id}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                {editingShopId === shop.id ? (
                                    <input
                                        type="text"
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                                    />
                                ) : (
                                    shop.name
                                )}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                {shop.xmlContent ? (
                                    <a
                                        href={getXMLDownloadLink(shop.xmlContent)}
                                        download="transformed.xml" // Set the filename to "transformed.xml"
                                        onClick={(e) => e.stopPropagation()} // Prevent row click
                                    >
                                        Download XML
                                    </a>
                                ) : (
                                    "N/A"
                                )}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>XML</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>N/A</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                {shop.xmlContent ? countProductsInXML(shop.xmlContent) : "N/A"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                        <p className="text-gray-600 mb-6">This action cannot be undone.</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteShop(showDeleteModal)}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* XML Uploader for Selected Shop */}
            {selectedShopId && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Upload XML for {shops.find(shop => shop.id === selectedShopId)?.name}</h3>
                    <XMLUploader shopId={selectedShopId} onFieldsExtracted={(data) => console.log(data)} />
                </div>
            )}
        </div>
    );
};

export default ShopDashboard;