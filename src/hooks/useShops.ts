import { useState, useEffect, useCallback } from "react";
import { customAlphabet } from "nanoid";

interface Shop {
    id: string;
    name: string;
    xmlContent?: string;
    productCount?: number;
    comments?: string;
    abTests?: string[];
    isLocked?: boolean;
}

const STORAGE_KEY = "shops";

const useShops = () => {
    const [shops, setShops] = useState<Shop[]>(() => {
        const storedShops = localStorage.getItem(STORAGE_KEY);
        return storedShops ? JSON.parse(storedShops) : [];
    });

    // Save to localStorage whenever shops change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(shops));
    }, [shops]);

    const nanoid = customAlphabet("1234567890abcdef", 5);

    // Add a shop (with optional XML)
    const addShop = useCallback((name: string, xmlContent?: string) => {
        setShops((prevShops) => {
            const newShop = { id: nanoid(), name, xmlContent, productCount: 0 };
            const newShops = [...prevShops, newShop];
            return newShops;
        });
    }, [nanoid]);

    // Delete a shop
    const deleteShop = useCallback((shopId: string) => {
        setShops((prevShops) => {
            const newShops = prevShops.filter((shop) => shop.id !== shopId);
            return newShops;
        });
    }, []);

    // Update a shop name
    const updateShop = useCallback((shopId: string, newName: string) => {
        setShops((prevShops) => {
            const newShops = prevShops.map((shop) =>
                shop.id === shopId ? { ...shop, name: newName } : shop
            );
            return newShops;
        });
    }, []);

    // Attach an XML file to a shop and update product count
    const uploadXMLToShop = useCallback((shopId: string, xmlContent: string) => {
        setShops((prevShops) => {
            const newShops = prevShops.map((shop) => {
                if (shop.id === shopId) {
                    const productCount = countProductsInXML(xmlContent); // Count products in XML
                    return { ...shop, xmlContent, productCount };
                }
                return shop;
            });
            return newShops;
        });
    }, []);

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

    const addComment = useCallback((shopId: string, comment: string) => {
        setShops((prevShops) => {
            const newShops = prevShops.map((shop) =>
                shop.id === shopId ? { ...shop, comments: comment } : shop
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newShops));
            return newShops;
        });
    }, []);

    // Add A/B test to a shop
    const addABTest = useCallback((shopId: string, abTest: string) => {
        setShops((prevShops) => {
            const newShops = prevShops.map((shop) =>
                shop.id === shopId
                    ? { ...shop, abTests: [...(shop.abTests || []), abTest] }
                    : shop
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newShops));
            return newShops;
        });
    }, []);

    // Toggle lock state for a shop
    const toggleLock = useCallback((shopId: string) => {
        setShops((prevShops) => {
            const newShops = prevShops.map((shop) =>
                shop.id === shopId ? { ...shop, isLocked: !shop.isLocked } : shop
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newShops));
            return newShops;
        });
    }, []);

    return { shops, addShop, deleteShop, updateShop, uploadXMLToShop, addComment, addABTest, toggleLock };
};

export default useShops;