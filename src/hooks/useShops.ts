// src/hooks/useShops.ts
import { useState, useEffect } from 'react';

interface Shop {
    id: string;
    name: string;
}

const useShops = () => {
    const [shops, setShops] = useState<Shop[]>([]);

    useEffect(() => {
        const storedShops = localStorage.getItem('shops');
        if (storedShops) {
            setShops(JSON.parse(storedShops));
        }
    }, []);

    const addShop = (name: string) => {
        const newShop = { id: Date.now().toString(), name };
        const updatedShops = [...shops, newShop];
        setShops(updatedShops);
        localStorage.setItem('shops', JSON.stringify(updatedShops));
    };

    return { shops, addShop };
};

export default useShops;