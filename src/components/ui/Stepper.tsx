'use client';

import { Minus, Plus } from 'lucide-react';

interface StepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    unit?: string;
}

export function Stepper({
    value,
    onChange,
    min = 0,
    max = 999,
    step = 1,
    label,
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
        <div className="flex flex-col gap-2">
            {label && (
                <span className="text-sm text-[#8E8E93] font-medium">{label}</span>
            )}
            <div className="flex items-center gap-3">
                {/* Decrement Button */}
                <button
                    type="button"
                    onClick={decrement}
                    className="
            w-14 h-14 rounded-xl bg-[#1C1C1E] border border-[#38383A]
            flex items-center justify-center
            active:scale-95 active:bg-[#2C2C2E]
            transition-all duration-150
            touch-target
          "
                >
                    <Minus className="w-6 h-6 text-[#0A84FF]" />
                </button>

                {/* Value Display */}
                <div className="flex-1 text-center">
                    <span className="text-3xl font-bold text-white tabular-nums">
                        {value}
                    </span>
                    {unit && (
                        <span className="text-lg text-[#8E8E93] ml-1">{unit}</span>
                    )}
                </div>

                {/* Increment Button */}
                <button
                    type="button"
                    onClick={increment}
                    className="
            w-14 h-14 rounded-xl bg-[#1C1C1E] border border-[#38383A]
            flex items-center justify-center
            active:scale-95 active:bg-[#2C2C2E]
            transition-all duration-150
            touch-target
          "
                >
                    <Plus className="w-6 h-6 text-[#30D158]" />
                </button>
            </div>
        </div>
    );
}

// Weight-specific stepper with decimal support
export function WeightStepper({
    value,
    onChange,
    label = 'Weight',
}: {
    value: number;
    onChange: (value: number) => void;
    label?: string;
}) {
    return (
        <Stepper
            value={value}
            onChange={onChange}
            min={0}
            max={500}
            step={2.5}
            label={label}
            unit="kg"
        />
    );
}

// Reps-specific stepper
export function RepsStepper({
    value,
    onChange,
    label = 'Reps',
}: {
    value: number;
    onChange: (value: number) => void;
    label?: string;
}) {
    return (
        <Stepper
            value={value}
            onChange={onChange}
            min={0}
            max={100}
            step={1}
            label={label}
        />
    );
}
