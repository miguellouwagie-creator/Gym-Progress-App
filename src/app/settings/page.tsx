'use client';

import { Settings as SettingsIcon, Trash2, Database, Info } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { db } from '@/lib/db';

export default function SettingsPage() {
    const handleClearData = async () => {
        if (confirm('This will delete ALL your workout data. Are you sure?')) {
            await db.delete();
            window.location.reload();
        }
    };

    return (
        <div className="pb-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-[#FF0000] flex items-center justify-center">
                    <SettingsIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Settings</h1>
                    <p className="text-sm text-[#71717a]">App configuration</p>
                </div>
            </div>

            {/* App Info */}
            <Card className="mb-4">
                <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-[#71717a]" />
                    <div>
                        <p className="font-semibold text-white">TITAN LOG</p>
                        <p className="text-xs text-[#71717a]">Red Edition v1.0</p>
                    </div>
                </div>
            </Card>

            {/* Data Management */}
            <h2 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-3 mt-6">
                Data Management
            </h2>

            <Card className="mb-4">
                <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-[#71717a]" />
                    <div className="flex-1">
                        <p className="font-semibold text-white">Local Storage</p>
                        <p className="text-xs text-[#71717a]">All data is stored offline on this device</p>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 text-[#ef4444]" />
                        <div>
                            <p className="font-semibold text-white">Clear All Data</p>
                            <p className="text-xs text-[#71717a]">Delete all workouts and exercises</p>
                        </div>
                    </div>
                    <Button variant="danger" size="sm" onClick={handleClearData}>
                        Clear
                    </Button>
                </div>
            </Card>
        </div>
    );
}
