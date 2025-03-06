import { useState } from 'react';

interface ShopManagerProps {
    onAddShop: (name: string, xmlContent?: string) => void;
}

const ShopManager: React.FC<ShopManagerProps> = ({ onAddShop }) => {
    const [shopName, setShopName] = useState('');

    const handleAddShop = () => {
        if (shopName.trim()) {
            onAddShop(shopName); // No need to generate ID here
            setShopName('');
        }
    };

    return (
        <div className="flex items-center gap-4 bg-gray-100 p-4 rounded-lg shadow-sm">
            {/* Input Field */}
            <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Enter shop name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Add Button */}
            <button
                onClick={handleAddShop}
                disabled={!shopName.trim()}
                className={`px-4 py-2 rounded-md transition-all ${
                    shopName.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-400 text-gray-700 cursor-not-allowed"
                }`}
            >
                Add Shop
            </button>
        </div>
    );
};

export default ShopManager;