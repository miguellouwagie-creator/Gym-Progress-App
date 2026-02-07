'use client';

import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
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
    font-semibold rounded-xl transition-all duration-200 
    touch-target flex items-center justify-center gap-2
    active:scale-95 disabled:opacity-50 disabled:active:scale-100
  `;

    const variants = {
        primary: 'bg-[#0A84FF] text-white hover:bg-[#0A84FF]/90',
        secondary: 'bg-[#1C1C1E] text-white border border-[#38383A] hover:bg-[#2C2C2E]',
        ghost: 'bg-transparent text-[#0A84FF] hover:bg-[#0A84FF]/10',
        accent: 'bg-[#30D158] text-black font-bold hover:bg-[#30D158]/90',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm min-h-[36px]',
        md: 'px-6 py-3 text-base min-h-[44px]',
        lg: 'px-8 py-4 text-lg min-h-[52px] w-full',
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
