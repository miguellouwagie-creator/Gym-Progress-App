'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Dumbbell, Hash, Calendar } from 'lucide-react';
import { Card } from '@/components/ui';
import { getTotalWorkouts, getTotalSets, getExerciseCount } from '@/lib/db';

export default function ProgressPage() {
    const [stats, setStats] = useState({
        workouts: 0,
        sets: 0,
        exercises: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [workouts, sets, exercises] = await Promise.all([
                getTotalWorkouts(),
                getTotalSets(),
                getExerciseCount(),
            ]);
            setStats({ workouts, sets, exercises });
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="pb-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-[#FF0000] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Progress</h1>
                    <p className="text-sm text-[#71717a]">Your lifetime stats</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <Card className="text-center py-6">
                    <Calendar className="w-8 h-8 text-[#FF0000] mx-auto mb-2" />
                    <p className="text-3xl font-bold text-white">{stats.workouts}</p>
                    <p className="text-xs text-[#71717a] uppercase tracking-wide">Workouts</p>
                </Card>

                <Card className="text-center py-6">
                    <Hash className="w-8 h-8 text-[#FF0000] mx-auto mb-2" />
                    <p className="text-3xl font-bold text-white">{stats.sets}</p>
                    <p className="text-xs text-[#71717a] uppercase tracking-wide">Total Sets</p>
                </Card>

                <Card className="text-center py-6 col-span-2">
                    <Dumbbell className="w-8 h-8 text-[#FF0000] mx-auto mb-2" />
                    <p className="text-3xl font-bold text-white">{stats.exercises}</p>
                    <p className="text-xs text-[#71717a] uppercase tracking-wide">Unique Exercises</p>
                </Card>
            </div>

            {/* Coming Soon */}
            <Card className="text-center py-8">
                <TrendingUp className="w-10 h-10 text-[#27272a] mx-auto mb-3" />
                <p className="text-sm text-[#71717a]">Detailed progress charts coming soon</p>
            </Card>
        </div>
    );
}
