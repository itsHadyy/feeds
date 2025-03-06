// components/LoadingBar.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingBar: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress >= 100) {
                    clearInterval(interval);
                    navigate('/next-page'); // Redirect to next page
                    return 100;
                }
                return prevProgress + 10;
            });
        }, 500);

        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <div>
            <h2>Downloading your products...</h2>
            <div style={{ width: `${progress}%`, height: '20px', backgroundColor: 'lightblue' }}></div>
        </div>
    );
};

export default LoadingBar;