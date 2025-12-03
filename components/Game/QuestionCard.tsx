'use client';

import { Pregunta, Respuesta } from '@/models/types';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
    question: Pregunta;
    onAnswer: (respuesta: Respuesta) => void;
    timeLeft: number;
}

export default function QuestionCard({ question, onAnswer, timeLeft }: QuestionCardProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    // Reset state when question changes
    useEffect(() => {
        setSelectedAnswer(null);
        setShowFeedback(false);
    }, [question]);

    const handleSelect = (respuesta: Respuesta) => {
        if (showFeedback) return;
        setSelectedAnswer(respuesta.id);
        setShowFeedback(true);

        // Small delay to show selection before triggering parent callback
        setTimeout(() => {
            onAnswer(respuesta);
        }, 1000);
    };

    // Guard clause - don't render if question is undefined
    if (!question || !question.respuestas) {
        return null;
    }

    return (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-blue-900">Pregunta</h2>
                <div className={cn(
                    "text-2xl font-bold rounded-full w-12 h-12 flex items-center justify-center border-4",
                    timeLeft <= 5 ? "border-red-500 text-red-600" : "border-blue-500 text-blue-600"
                )}>
                    {timeLeft}
                </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                {question.texto}
            </h3>

            <div className="space-y-4">
                {question.respuestas?.map((respuesta) => (
                    <button
                        key={respuesta.id}
                        onClick={() => handleSelect(respuesta)}
                        disabled={showFeedback}
                        className={cn(
                            "w-full p-4 text-lg font-medium rounded-xl border-2 transition-all duration-200",
                            showFeedback && respuesta.es_correcta
                                ? "bg-green-100 border-green-500 text-green-800"
                                : showFeedback && selectedAnswer === respuesta.id && !respuesta.es_correcta
                                    ? "bg-red-100 border-red-500 text-red-800"
                                    : selectedAnswer === respuesta.id
                                        ? "bg-blue-100 border-blue-500 text-blue-800"
                                        : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700"
                        )}
                    >
                        {respuesta.texto}
                    </button>
                ))}
            </div>
        </div>
    );
}
