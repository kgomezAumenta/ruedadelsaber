'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface WheelProps {
    onSpinEnd: () => void;
    spinning: boolean;
}

export default function Wheel({ onSpinEnd, spinning }: WheelProps) {
    const wheelRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        if (spinning && wheelRef.current) {
            // Random rotation between 5 and 10 full spins (1800 - 3600 degrees) + random offset
            const newRotation = rotation + 1800 + Math.random() * 1800;
            setRotation(newRotation);

            const timeout = setTimeout(() => {
                onSpinEnd();
            }, 5000); // 5 seconds spin duration matching CSS transition

            return () => clearTimeout(timeout);
        }
    }, [spinning, onSpinEnd]);

    return (
        <div className="relative w-80 h-80 md:w-96 md:h-96">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-8 h-12 bg-red-600 clip-triangle shadow-lg" />

            {/* Wheel */}
            <div
                ref={wheelRef}
                className="w-full h-full rounded-full border-8 border-white shadow-2xl overflow-hidden transition-transform duration-[5000ms] cubic-bezier(0.25, 0.1, 0.25, 1)"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-blue-700">
                    {/* Segments */}
                    {[...Array(8)].map((_, i) => {
                        const colors = ['#3b82f6', '#22c55e', '#a855f7', '#ffffff', '#f97316'];
                        const color = colors[i % colors.length];
                        const isWhite = color === '#ffffff';

                        return (
                            <div
                                key={i}
                                className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left border-b border-white/20"
                                style={{
                                    transform: `rotate(${i * 45}deg) skewY(-45deg)`,
                                    backgroundColor: color
                                }}
                            >
                                <span
                                    className={cn(
                                        "absolute left-8 top-12 font-bold text-2xl transform -skewY(45deg) rotate(-22.5deg)",
                                        isWhite ? "text-black" : "text-white"
                                    )}
                                >
                                    ?
                                </span>
                            </div>
                        );
                    })}

                    {/* Center Hub */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-inner flex items-center justify-center z-10">
                        <div className="w-12 h-12 bg-blue-900 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
