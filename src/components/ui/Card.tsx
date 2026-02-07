'use client';

import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    active?: boolean;
}

export function Card({
    children,
    className = '',
    onClick,
    active = false,
}: CardProps) {
    const baseStyles = `
    rounded-lg p-4 transition-all duration-150
    bg-[#09090b] border border-[#27272a]
    ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
    ${active ? 'border-[#FF0000] shadow-[0_0_15px_rgba(255,0,0,0.2)]' : ''}
  `;

    return (
        <div
            onClick={onClick}
            className={`${baseStyles} ${className}`}
        >
            {children}
        </div>
    );
}
