import { useState } from 'react';

interface ShopManagerProps {
    onAddShop: (name: string) => void;
}

const ShopManager: React.FC<ShopManagerProps> = ({ onAddShop }) => {
    const [shopName, setShopName] = useState('');

    const handleAddShop = () => {
        if (shopName.trim()) {
            onAddShop(shopName);
            setShopName('');
        }
    };

    return (
        <div>
            <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Enter shop name"
            />
            <button onClick={handleAddShop}>Add Shop</button>
        </div>
    );
};

export default ShopManager;