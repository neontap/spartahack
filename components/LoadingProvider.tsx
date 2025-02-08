// app/providers.tsx
'use client';
import React, { useState, useEffect, Suspense } from 'react';
import {usePathname, useSearchParams} from "next/navigation";

const AnimatedLoader = () => {
    const [currentFrame, setCurrentFrame] = React.useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame((prev) => (prev + 1) % 4);
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        // Container div that centers the SVG
        <div className="relative flex items-center justify-center h-36 w-36">
            {/* Each SVG wrapper with centered rotation */}
            <div
                className="absolute inset-0 flex items-center justify-center transition-all duration-1000"
                style={{
                    opacity: currentFrame === 0 ? 1 : 0,
                    transform: `rotate(${currentFrame * 90}deg)`,
                    transformOrigin: 'center center'
                }}
            >
                <svg width="142" height="112" viewBox="0 0 142 112" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform-origin-center">
                    <path d="M141.824 22.4776C141.352 24.2713 137.092 26.4985 135.485 27.7392C127.583 33.8528 119.932 41.506 112.944 49.7123C104.968 59.0845 98.673 74.4956 93.7048 85.7811C86.5105 102.044 79.1982 111.237 53.7675 111.969C38.0669 112.418 25.3294 107.934 15.5552 98.4716C5.78094 89.0397 0.665319 76.4537 0.208304 60.6988L0.0313947 54.2863C-0.410878 38.6211 3.8202 25.7512 12.6951 15.7362C21.5701 5.72125 33.5557 0.47461 48.6077 0.0411266C64.7359 -0.422252 77.2964 3.03066 86.3188 10.37C93.3804 16.1248 97.7147 24.077 99.3364 34.1816C99.4248 34.7796 99.1742 35.3924 98.7024 35.7512C95.4444 38.2175 92.4074 40.6839 89.6506 43.1353C89.0167 43.7033 88.2206 44.0172 87.3803 44.0471L73.6551 44.4507C72.343 44.4956 71.1636 43.4941 71.0604 42.1338C70.5739 35.4821 68.8048 30.6689 65.7384 27.6943C62.3181 24.3909 56.834 22.8214 49.2711 23.0307C42.6517 23.225 37.6393 26.08 34.2486 31.5658C30.8578 37.0815 29.2951 44.3012 29.5457 53.2549L29.7374 59.8468C29.988 68.8752 32.1257 76.0352 36.1798 81.3566C40.234 86.648 45.8803 89.2041 53.1483 88.9948C59.9004 88.8005 64.7064 86.947 67.6107 83.4343C70.2791 80.2355 71.6206 75.1383 71.6501 68.1428C71.6501 66.8573 72.0481 65.6017 72.859 64.6151C78.5938 57.5598 85.2279 50.8932 92.3779 44.8244C92.7612 44.5105 93.174 44.1667 93.5721 43.8528C95.636 42.2384 97.7442 40.5643 99.9408 38.8603C100.811 38.1577 101.695 37.4701 102.594 36.7975C109.17 31.9993 115.995 27.7242 122.895 24.1966C126.241 22.4926 134.173 18.4268 137.505 17.6495C138.669 17.3954 139.966 17.6794 140.851 18.4866C141.898 19.4432 142.222 21.1174 141.854 22.4627L141.824 22.4776Z" fill="#4F3078"/>
                </svg>
            </div>

            {/* Repeat for other states with the same centering */}
            <div
                className="absolute inset-0 flex items-center justify-center transition-all duration-1000"
                style={{
                    opacity: currentFrame === 1 ? 1 : 0,
                    transform: `rotate(${currentFrame * 90}deg)`,
                    transformOrigin: 'center center'
                }}
            >
                <svg width="112" height="142" viewBox="0 0 112 142" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform-origin-center">
                    <path d="M89.5224 141.824C87.7287 141.352 85.5015 137.092 84.2608 135.485C78.1472 127.583 70.494 119.932 62.2877 112.944C52.9155 104.968 37.5044 98.673 26.2189 93.7048C9.95584 86.5105 0.763012 79.1982 0.0305763 53.7675C-0.417856 38.0669 4.06646 25.3294 13.5284 15.5552C22.9603 5.78094 35.5463 0.665316 51.3012 0.208301L57.7137 0.0313924C73.3789 -0.41088 86.2488 3.8202 96.2638 12.6951C106.279 21.5701 111.525 33.5557 111.959 48.6077C112.422 64.7359 108.969 77.2964 101.63 86.3188C95.8752 93.3804 87.923 97.7147 77.8183 99.3364C77.2204 99.4248 76.6076 99.1742 76.2488 98.7024C73.7825 95.4444 71.3161 92.4074 68.8647 89.6506C68.2967 89.0167 67.9828 88.2206 67.9529 87.3803L67.5493 73.6551C67.5044 72.343 68.5059 71.1636 69.8662 71.0604C76.5179 70.5739 81.3311 68.8048 84.3056 65.7384C87.6091 62.3181 89.1786 56.834 88.9693 49.2711C88.775 42.6517 85.92 37.6393 80.4342 34.2486C74.9185 30.8578 67.6988 29.2951 58.7451 29.5457L52.1532 29.7374C43.1248 29.988 35.9648 32.1256 30.6434 36.1798C25.352 40.234 22.7959 45.8803 23.0052 53.1483C23.1995 59.9004 25.053 64.7064 28.5657 67.6107C31.7645 70.279 36.8617 71.6206 43.8572 71.6501C45.1427 71.6501 46.3983 72.0481 47.3849 72.859C54.4402 78.5938 61.1068 85.2279 67.1756 92.3779C67.4895 92.7612 67.8333 93.174 68.1472 93.5721C69.7615 95.636 71.4357 97.7442 73.1397 99.9408C73.8423 100.811 74.5299 101.695 75.2025 102.594C80.0007 109.17 84.2757 115.995 87.8034 122.895C89.5074 126.241 93.5732 134.173 94.3505 137.505C94.6046 138.669 94.3206 139.966 93.5134 140.851C92.5568 141.898 90.8826 142.222 89.5373 141.854L89.5224 141.824Z" fill="white"/>
                </svg>
            </div>

            {/* Repeat for remaining frames with same pattern */}
            {/* ... other frames ... */}
        </div>
    );
};

const LoadingScreen = ({ isLoading }: { isLoading: boolean }) => {
    if (!isLoading) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-purple-100 transition-opacity duration-300"
            style={{ opacity: isLoading ? 1 : 0 }}
        >
            <div className="flex flex-col items-center gap-28">
                <AnimatedLoader />
                <p className="text-purple-800 font-bold text-2xl">Loading...</p>
            </div>
        </div>
    );
};

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Start loading when route changes
        setIsLoading(true);

        // Add a small delay before hiding the loader to prevent flashing
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]); // This will trigger when the route changes

    return (
        <Suspense>
            <LoadingScreen isLoading={isLoading} />
            {children}
        </Suspense>
    );
}