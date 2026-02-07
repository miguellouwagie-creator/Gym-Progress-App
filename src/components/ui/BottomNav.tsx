'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, BarChart3 } from 'lucide-react';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/logs', icon: Calendar, label: 'Logs' },
    { href: '/stats', icon: BarChart3, label: 'Stats' },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="
        fixed bottom-0 left-0 right-0 z-50
        glass border-t border-[#38383A]
        pb-[env(safe-area-inset-bottom)]
      "
        >
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
                transition-colors duration-200
                ${isActive ? 'text-[#0A84FF]' : 'text-[#8E8E93]'}
              `}
                        >
                            <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
