'use client';

import { use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Play } from 'lucide-react';

export default function InstitutionalPage({ params }: { params: Promise<{ paisId: string; marcaBayerId: string }> }) {
    const { paisId, marcaBayerId } = use(params);
    const searchParams = useSearchParams();

    // Preserve query params for the game
    const nextUrl = `/${paisId}/${marcaBayerId}/game?${searchParams.toString()}`;

    return (
        <div className="w-full max-w-4xl text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white drop-shadow-lg">
                    ¡Prepárate para ganar!
                </h1>

                <div className="space-y-6 text-xl text-blue-100 mb-12">
                    <p>
                        Bienvenido a la experiencia interactiva de Bayer.
                    </p>
                    <p>
                        Gira la rueda, responde correctamente y demuestra tus conocimientos.
                    </p>
                    <p className="font-bold text-yellow-400 text-2xl">
                        ¡Mucha suerte!
                    </p>
                </div>

                <Link
                    href={nextUrl}
                    className="inline-flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold text-2xl px-12 py-6 rounded-full transition-transform hover:scale-105 shadow-lg"
                >
                    <Play className="w-8 h-8 fill-current" />
                    Comenzar Juego
                </Link>
            </div>
        </div>
    );
}
