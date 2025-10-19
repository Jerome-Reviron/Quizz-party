
import React from 'react';

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
    return (
        <input
            {...props}
            className="w-full bg-gray-900 border-2 border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors"
        />
    );
};

export default Input;
