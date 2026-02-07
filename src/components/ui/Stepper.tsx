'use client';

import { Minus, Plus } from 'lucide-react';

interface StepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
}

export function Stepper({
    value,
    onChange,
    min = 0,
    max = 999,
    step = 1,
    unit,
}: StepperProps) {
    const decrement = () => {
        const newValue = value - step;
        if (newValue >= min) onChange(newValue);
    };

    const increment = () => {
        const newValue = value + step;
        if (newValue <= max) onChange(newValue);
    };

    return (
        <div className="flex items-center gap-2">
            {/* Decrement Button */}
            <button
                type="button"
                onClick={decrement}
                className="
          w-12 h-12 rounded-lg bg-[#09090b] border border-[#27272a]
          flex items-center justify-center
          active:scale-95 active:border-[#FF0000]
          transition-all duration-100
        "
            >
                <Minus className="w-5 h-5 text-[#a1a1aa]" />
            </button>

            {/* Value Display */}
            <div className="flex-1 text-center min-w-[60px]">
                <span className="text-2xl font-bold text-white tabular-nums">
                    {value}
                </span>
                {unit && (
                    <span className="text-sm text-[#71717a] ml-1">{unit}</span>
                )}
            </div>

            {/* Increment Button */}
            <button
                type="button"
                onClick={increment}
                className="
          w-12 h-12 rounded-lg bg-[#09090b] border border-[#27272a]
          flex items-center justify-center
          active:scale-95 active:border-[#FF0000]
          transition-all duration-100
        "
            >
                <Plus className="w-5 h-5 text-[#FF0000]" />
            </button>
        </div>
    );
}

export function WeightStepper({
    value,
    onChange,
}: {
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <div>
            <span className="text-xs text-[#71717a] uppercase tracking-wide mb-1 block">Weight</span>
            <Stepper value={value} onChange={onChange} min={0} max={500} step={2.5} unit="kg" />
        </div>
    );
}

export function RepsStepper({
    value,
    onChange,
}: {
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <div>
            <span className="text-xs text-[#71717a] uppercase tracking-wide mb-1 block">Reps</span>
            <Stepper value={value} onChange={onChange} min={0} max={100} step={1} />
        </div>
    );
}
