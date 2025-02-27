// src/components/ShopDashboard.tsx
import React from 'react';
import ShopManager from './ShopManager';
import useShops from '../hooks/useShops';

interface ShopDashboardProps {
    onSelectShop: (shopId: string) => void;
}

const ShopDashboard: React.FC<ShopDashboardProps> = ({ onSelectShop }) => {
    const { shops, addShop } = useShops();

    return (
        <div>
        <h2>Shops </h2>
        < ShopManager onAddShop = { addShop } />
            <ul>
            {
                shops.map((shop) => (
                    <li key= { shop.id } >
                    { shop.name } < button onClick = {() => onSelectShop(shop.id)}> Select </button>
                        </li>
        ))}
</ul>
    </div>
  );
};

export default ShopDashboard;