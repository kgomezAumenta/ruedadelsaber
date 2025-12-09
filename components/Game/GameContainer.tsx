'use client';

import { useState, useEffect, useRef } from 'react';
import { Pregunta, Respuesta } from '@/models/types';
import Wheel from './Wheel';
import QuestionCard from './QuestionCard';
import { Trophy, Frown, RefreshCw, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface GameContainerProps {
    preguntas: Pregunta[];
    paisId: string;
    marcaBayerId: string;
    totalParticipants: number;
}

type GameState = 'READY' | 'SPINNING' | 'QUESTION' | 'FEEDBACK' | 'FINISHED' | 'NEXT_PARTICIPANT';

export default function GameContainer({ preguntas, paisId, marcaBayerId, totalParticipants }: GameContainerProps) {
    const [gameState, setGameState] = useState<GameState>('READY');
    const [currentParticipant, setCurrentParticipant] = useState(1);
    const [currentRound, setCurrentRound] = useState(1);
    const [score, setScore] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [shuffledQuestions, setShuffledQuestions] = useState<Pregunta[]>([]);

    // Initialize questions on mount or when participant changes
    const [results, setResults] = useState<{ participant: number; score: number; gano: boolean }[]>([]);

    const shuffleQuestions = () => {
        // Shuffle questions and take 3 random ones
        const shuffled = [...preguntas].sort(() => Math.random() - 0.5).slice(0, 3);
        setShuffledQuestions(shuffled);
    };

    // Initialize questions on mount or when participant changes
    useEffect(() => {
        shuffleQuestions();
    }, [currentParticipant]);

    const scoreRef = useRef(0);

    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    // Timer logic
    useEffect(() => {
        if (gameState === 'QUESTION' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (gameState === 'QUESTION' && timeLeft === 0) {
            handleTimeOut();
        }
    }, [gameState, timeLeft]);

    const handleSpin = () => {
        setGameState('SPINNING');
    };

    const handleSpinEnd = () => {
        setGameState('QUESTION');
        setTimeLeft(15);
    };

    const handleAnswer = (respuesta: Respuesta) => {
        setGameState('FEEDBACK');
        if (respuesta.es_correcta) {
            setScore((prev) => prev + 1);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        setTimeout(() => {
            nextRound();
        }, 2000);
    };

    const handleTimeOut = () => {
        setGameState('FEEDBACK');
        setTimeout(() => {
            nextRound();
        }, 2000);
    };

    const nextRound = async () => {
        const currentScore = scoreRef.current;
        if (currentRound >= 3) {
            const gano = currentScore >= 2;

            // Save results for current participant
            try {
                await fetch('/api/game/participation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        aciertos: currentScore,
                        gano,
                        numero_participante: currentParticipant
                    }),
                });
            } catch (e) {
                console.error(e);
            }

            setResults(prev => [...prev, { participant: currentParticipant, score: currentScore, gano }]);

            if (currentParticipant < totalParticipants) {
                setGameState('NEXT_PARTICIPANT');
            } else {
                setGameState('FINISHED');
            }
        } else {
            setCurrentRound((prev) => prev + 1);
            setCurrentQuestionIndex((prev) => prev + 1);
            setGameState('READY');
        }
    };

    const startNextParticipant = () => {
        setCurrentParticipant(prev => prev + 1);
        setCurrentRound(1);
        setScore(0);
        setCurrentQuestionIndex(0);
        setGameState('READY');
    };

    const handleRestart = () => {
        window.location.reload();
    };

    if (preguntas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-white p-8 text-center bg-white/10 rounded-3xl backdrop-blur-sm">
                <Frown className="w-16 h-16 mb-4 opacity-80" />
                <h2 className="text-2xl font-bold mb-2">No hay preguntas disponibles</h2>
                <p className="opacity-80">Por favor contacta al administrador para configurar el juego.</p>
                <Link
                    href="/"
                    className="mt-6 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full transition-colors"
                >
                    Volver al Inicio
                </Link>
            </div>
        );
    }

    if (shuffledQuestions.length === 0) {
        return <div className="text-white text-xl animate-pulse">Cargando preguntas...</div>;
    }

    return (
        <div className="relative flex flex-col items-center justify-center w-full max-w-4xl mx-auto min-h-[600px]">
            {/* Header Left - Participant Info */}
            <div className="absolute top-6 left-6 z-20">
                <div className="bg-blue-600/90 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-lg border border-blue-400/30 backdrop-blur-md">
                    <Users className="w-6 h-6" />
                    <span className="font-bold text-lg">Participante {currentParticipant} de {totalParticipants}</span>
                </div>
            </div>

            {/* Header Right - Game Stats */}
            {gameState !== 'FINISHED' && gameState !== 'NEXT_PARTICIPANT' && (
                <div className="absolute top-6 right-6 flex flex-col items-end gap-4 text-white font-bold text-xl z-20">
                    <div className="bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm shadow-sm border border-white/10">
                        Ronda {currentRound}/3
                    </div>
                    <div className="bg-green-500/90 px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-transform border border-green-400/30">
                        Aciertos: {score}
                    </div>
                </div>
            )}

            {/* Game States */}
            {gameState === 'READY' && (
                <div className="text-center space-y-8 animate-in fade-in zoom-in mt-20">
                    <div className="relative inline-block">
                        <h2 className="text-5xl font-black text-white mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tight">
                            ¡ES TU TURNO!
                        </h2>
                        <div className="h-1 w-full bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                    </div>
                    <Wheel onSpinEnd={handleSpinEnd} spinning={false} />
                    <button
                        onClick={handleSpin}
                        className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold text-2xl px-12 py-4 rounded-full shadow-lg transition-transform hover:scale-105"
                    >
                        GIRAR RUEDA
                    </button>
                </div>
            )}

            {gameState === 'SPINNING' && (
                <div className="text-center space-y-8">
                    <Wheel onSpinEnd={handleSpinEnd} spinning={true} />
                    <p className="text-2xl text-white font-bold animate-pulse">
                        Girando...
                    </p>
                </div>
            )}

            {(gameState === 'QUESTION' || gameState === 'FEEDBACK') && shuffledQuestions[currentQuestionIndex] && (
                <QuestionCard
                    question={shuffledQuestions[currentQuestionIndex]}
                    onAnswer={handleAnswer}
                    timeLeft={timeLeft}
                />
            )}

            {/* Debug: Show if question is missing */}
            {(gameState === 'QUESTION' || gameState === 'FEEDBACK') && !shuffledQuestions[currentQuestionIndex] && (
                <div className="text-white text-center">
                    <p>Error: No hay pregunta disponible</p>
                    <p>Índice: {currentQuestionIndex}, Total: {shuffledQuestions.length}</p>
                </div>
            )}

            {gameState === 'NEXT_PARTICIPANT' && (
                <div className="bg-white rounded-3xl p-12 text-center shadow-2xl animate-in fade-in zoom-in max-w-2xl w-full">
                    {score >= 2 ? (
                        <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
                    ) : (
                        <Frown className="w-24 h-24 text-blue-300 mx-auto mb-6" />
                    )}
                    <h2 className="text-4xl font-bold text-blue-900 mb-4">
                        {score >= 2 ? '¡Felicidades!' : 'Buen intento'}
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Participante {currentParticipant} ha terminado con {score} aciertos.
                        <br />
                        <span className={`font-bold ${score >= 2 ? 'text-green-600' : 'text-red-500'}`}>
                            {score >= 2 ? '¡GANASTE!' : 'No ganaste esta vez'}
                        </span>
                    </p>
                    <button
                        onClick={startNextParticipant}
                        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-8 py-4 rounded-xl transition-colors shadow-lg"
                    >
                        Siguiente Participante
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            )}

            {gameState === 'FINISHED' && (
                <div className="bg-white rounded-3xl p-12 text-center shadow-2xl animate-in fade-in zoom-in max-w-2xl w-full">
                    <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
                    <h2 className="text-4xl font-bold text-blue-900 mb-8">¡Juego Completado!</h2>

                    <div className="grid gap-4 mb-8 max-h-60 overflow-y-auto">
                        {results.map((result) => (
                            <div key={result.participant} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="font-bold text-gray-700">Participante {result.participant}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-600">{result.score}/3 Aciertos</span>
                                    <span className={`font-bold px-3 py-1 rounded-full text-sm ${result.gano ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {result.gano ? 'GANÓ' : 'PERDIÓ'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleRestart}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Nuevo Juego
                        </button>
                        <Link
                            href="/"
                            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-8 py-3 rounded-xl transition-colors"
                        >
                            Salir
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
