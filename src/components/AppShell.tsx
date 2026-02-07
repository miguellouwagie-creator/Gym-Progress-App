'use client';

import { useEffect, useState } from 'react';
import { seedDatabase } from '@/lib/db';
import { BottomNav } from '@/components/ui';
import { PageTransition } from '@/components/PageTransition';

export function AppShell({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Seed database on first load
        seedDatabase().then(() => setIsReady(true));
    }, []);

    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[#8E8E93] text-sm">Loading Titan Log...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageTransition>
                <main className="min-h-screen px-4 pt-4">
                    {children}
                </main>
            </PageTransition>
            <BottomNav />
        </>
    );
}
