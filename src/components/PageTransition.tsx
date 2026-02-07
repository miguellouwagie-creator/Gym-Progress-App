'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
    children: ReactNode;
}

// iOS-style slide animation variants
const pageVariants = {
    initial: {
        x: '100%',
        opacity: 0,
    },
    animate: {
        x: 0,
        opacity: 1,
    },
    exit: {
        x: '-30%',
        opacity: 0,
    },
};

const pageTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
};

export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                className="min-h-screen"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

// Simple fade for modals/overlays
export function FadeTransition({
    children,
    show
}: {
    children: ReactNode;
    show: boolean;
}) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Scale up animation for cards
export function ScaleIn({
    children,
    delay = 0
}: {
    children: ReactNode;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay, duration: 0.2 }}
        >
            {children}
        </motion.div>
    );
}

// Stagger list items
export function StaggerContainer({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={{
                initial: {},
                animate: { transition: { staggerChildren: 0.05 } },
            }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children }: { children: ReactNode }) {
    return (
        <motion.div
            variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
}
