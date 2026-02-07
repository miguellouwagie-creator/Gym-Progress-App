'use client';

import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit';
}

export function Button({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    type = 'button',
}: ButtonProps) {
    const baseStyles = `
    font-semibold rounded-lg transition-all duration-150 
    touch-target flex items-center justify-center gap-2
    active:scale-95 disabled:opacity-50 disabled:active:scale-100
    border
  `;

    const variants = {
        primary: 'bg-[#FF0000] text-white border-[#FF0000] hover:bg-[#CC0000]',
        secondary: 'bg-[#09090b] text-white border-[#27272a] hover:bg-[#18181b] hover:border-[#3f3f46]',
        ghost: 'bg-transparent text-[#FF0000] border-transparent hover:bg-[#FF0000]/10',
        danger: 'bg-transparent text-[#ef4444] border-[#ef4444] hover:bg-[#ef4444]/10',
    };

    const sizes = {
        sm: 'px-3 py-2 text-sm min-h-[36px]',
        md: 'px-5 py-3 text-base min-h-[44px]',
        lg: 'px-6 py-4 text-lg min-h-[52px] w-full',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
}
