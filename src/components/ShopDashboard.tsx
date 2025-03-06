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
import { EditIcon, SaveIcon, TrashIcon, CheckIcon } from "lucide-react"; // Import valid icons

interface ShopDashboardProps {
    onSelectShop: (shopId: string) => void;
}

const ShopDashboard: React.FC<ShopDashboardProps> = ({ onSelectShop }) => {
    const { shops, addShop, deleteShop, updateShop } = useShops();
    const [editingShopId, setEditingShopId] = useState<string | null>(null);
    const [editedName, setEditedName] = useState<string>("");
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null); // Track which shop's delete modal is open

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
        setShowDeleteModal(null); // Close the modal after deletion
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
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Options</th>
                    </tr>
                </thead>
                <tbody>
                    {shops.map((shop) => (
                        <tr
                            key={shop.id}
                            onClick={() => handleSelectShop(shop.id)} // Add onClick handler to the row
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
                                        href={shop.xmlContent}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <CopyIcon
                                            className="inline-block ml-2 cursor-pointer"
                                            onClick={() => handleCopyLink(shop.xmlContent || "")}
                                        />
                                    </a>
                                ) : (
                                    "N/A"
                                )}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>XML</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>N/A</td>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        className="px-3 py-1 text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                                        asChild
                                    >
                                        <button onClick={(e) => e.stopPropagation()}> {/* Prevent row click from triggering dropdown */}
                                            Options <ChevronDownIcon className="inline-block ml-2 h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="bg-white shadow-lg rounded-md p-2 min-w-[160px] border border-gray-200"
                                        side="bottom"
                                        align="end"
                                    >
                                        {editingShopId === shop.id ? (
                                            <DropdownMenuItem
                                                onClick={() => handleSaveEdit(shop.id)}
                                                className="px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
                                            >
                                                <SaveIcon className="h-4 w-4" />
                                                <span>Save</span>
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem
                                                onClick={() => handleEditClick(shop.id, shop.name)}
                                                className="px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-50 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
                                            >
                                                <EditIcon className="h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            onClick={() => handleSelectShop(shop.id)}
                                            className="px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                            <span>Select</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setShowDeleteModal(shop.id)}
                                            className="px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </th>
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