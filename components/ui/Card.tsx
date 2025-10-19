
import React from 'react';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => {
    return (
        <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
