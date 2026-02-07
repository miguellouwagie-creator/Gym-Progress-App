'use client';

import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    elevated?: boolean;
    glow?: 'primary' | 'accent' | null;
}

export function Card({
    children,
    className = '',
    onClick,
    elevated = false,
    glow = null,
}: CardProps) {
    const baseStyles = `
    rounded-2xl p-4 transition-all duration-200
    ${elevated ? 'bg-[#2C2C2E]' : 'bg-[#1C1C1E]'}
    ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
  `;

    const glowStyles = {
        primary: 'ring-2 ring-[#0A84FF] shadow-[0_0_20px_rgba(10,132,255,0.3)]',
        accent: 'ring-2 ring-[#30D158] shadow-[0_0_20px_rgba(48,209,88,0.3)]',
    };

    return (
        <div
            onClick={onClick}
            className={`${baseStyles} ${glow ? glowStyles[glow] : ''} ${className}`}
        >
            {children}
        </div>
    );
}
