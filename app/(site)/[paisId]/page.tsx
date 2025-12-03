import Link from 'next/link';
import { getMarcasBayer } from '@/models/Catalogos';
import { ArrowLeft } from 'lucide-react';

export default async function BrandSelection({ params }: { params: Promise<{ paisId: string }> }) {
    const { paisId } = await params;
    const marcasBayer = await getMarcasBayer(parseInt(paisId));

    return (
        <div className="w-full max-w-4xl text-center">
            <Link href="/" className="absolute top-8 left-8 text-white/70 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-6 h-6" />
                Volver
            </Link>

            <h1 className="text-4xl md:text-6xl font-bold mb-12 text-white drop-shadow-lg">
                Selecciona la Marca
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {marcasBayer.map((marca) => (
                    <Link
                        key={marca.id}
                        href={`/${paisId}/${marca.id}/login`}
                        className="group relative overflow-hidden rounded-2xl bg-white p-8 hover:scale-105 transition-all duration-300 shadow-xl"
                    >
                        <div className="flex flex-col items-center gap-6">
                            {marca.logo_url ? (
                                <div className="w-32 h-32 relative flex items-center justify-center">
                                    <img
                                        src={marca.logo_url}
                                        alt={marca.nombre}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-gray-400 text-xl">{marca.nombre[0]}</span>
                                </div>
                            )}
                            <h2 className="text-2xl font-bold text-blue-900">
                                {marca.nombre}
                            </h2>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
