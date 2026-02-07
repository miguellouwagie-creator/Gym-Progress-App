'use client';

import { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui';

export function AppShell({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Database is ready immediately - no seeding needed (tabula rasa)
        setIsReady(true);
    }, []);

    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            <main className="min-h-screen px-4 pt-4">
                {children}
            </main>
            <BottomNav />
        </>
    );
}
