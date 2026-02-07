'use client';

import { BarChart3, TrendingUp, Target, Flame } from 'lucide-react';
import { Card } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/PageTransition';

export default function StatsPage() {
    return (
        <div className="pb-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#1C1C1E] flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-[#30D158]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Statistics</h1>
                    <p className="text-sm text-[#8E8E93]">Track your progress</p>
                </div>
            </div>

            {/* Stats Cards */}
            <StaggerContainer>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <StaggerItem>
                        <Card className="text-center py-6">
                            <div className="w-10 h-10 rounded-xl bg-[#0A84FF]/20 flex items-center justify-center mx-auto mb-3">
                                <Flame className="w-5 h-5 text-[#0A84FF]" />
                            </div>
                            <p className="text-3xl font-bold text-white">0</p>
                            <p className="text-xs text-[#8E8E93] mt-1">Workouts This Week</p>
                        </Card>
                    </StaggerItem>

                    <StaggerItem>
                        <Card className="text-center py-6">
                            <div className="w-10 h-10 rounded-xl bg-[#30D158]/20 flex items-center justify-center mx-auto mb-3">
                                <Target className="w-5 h-5 text-[#30D158]" />
                            </div>
                            <p className="text-3xl font-bold text-white">0</p>
                            <p className="text-xs text-[#8E8E93] mt-1">Total Sets</p>
                        </Card>
                    </StaggerItem>

                    <StaggerItem>
                        <Card className="text-center py-6">
                            <div className="w-10 h-10 rounded-xl bg-[#FF9F0A]/20 flex items-center justify-center mx-auto mb-3">
                                <TrendingUp className="w-5 h-5 text-[#FF9F0A]" />
                            </div>
                            <p className="text-3xl font-bold text-white">0</p>
                            <p className="text-xs text-[#8E8E93] mt-1">Day Streak</p>
                        </Card>
                    </StaggerItem>

                    <StaggerItem>
                        <Card className="text-center py-6">
                            <div className="w-10 h-10 rounded-xl bg-[#FF453A]/20 flex items-center justify-center mx-auto mb-3">
                                <BarChart3 className="w-5 h-5 text-[#FF453A]" />
                            </div>
                            <p className="text-3xl font-bold text-white">0 kg</p>
                            <p className="text-xs text-[#8E8E93] mt-1">Total Volume</p>
                        </Card>
                    </StaggerItem>
                </div>
            </StaggerContainer>

            {/* Coming Soon */}
            <Card className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-[#636366] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Charts Coming Soon</h3>
                <p className="text-sm text-[#8E8E93]">
                    Progress graphs and exercise analytics will appear here as you log more workouts.
                </p>
            </Card>
        </div>
    );
}
