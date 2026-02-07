'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, TrendingUp, Settings } from 'lucide-react';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/progress', icon: TrendingUp, label: 'Progress' },
    { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
    const pathname = usePathname();

    // Hide on workout page for focus
    if (pathname.startsWith('/workout')) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`
                flex flex-col items-center justify-center
                w-20 h-full gap-1
                transition-colors duration-150
                ${isActive ? 'text-[#FF0000]' : 'text-[#71717a]'}
              `}
                        >
                            <Icon
                                className="w-6 h-6"
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
