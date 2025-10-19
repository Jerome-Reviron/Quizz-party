
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
    const baseClasses = 'px-6 py-3 font-bold rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100';
    
    const variantClasses = {
        primary: 'bg-yellow-400 text-gray-900 hover:bg-yellow-300',
        secondary: 'bg-gray-600 text-white hover:bg-gray-500'
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
