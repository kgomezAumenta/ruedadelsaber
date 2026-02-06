import Link from 'next/link';
import { getMarcasBayer } from '@/models/Catalogos';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function BrandSelection({ params }: { params: Promise<{ paisId: string }> }) {
    const { paisId } = await params;

    // Validate that paisId is a valid number
    const paisIdNum = parseInt(paisId);
    if (isNaN(paisIdNum)) {
        redirect('/');
    }

    const marcasBayer = await getMarcasBayer(paisIdNum);

    return (
        <div className="w-full max-w-4xl text-center">
            <Link href="/" className="absolute top-8 left-8 text-white/70 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-6 h-6" />
                Volver
            </Link>

            <h1 className="text-4xl md:text-6xl font-bold mb-12 text-white drop-shadow-lg">
                Selecciona la Marca
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4 md:px-0">
                {marcasBayer.map((marca) => (
                    <Link
                        key={marca.id}
                        href={`/${paisId}/${marca.id}/login`}
                        className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-[#2563EB] to-[#60A5FA] p-8 hover:scale-105 transition-all duration-300 shadow-lg flex flex-col items-center justify-between aspect-square border border-white/10"
                    >
                        <div className="w-full flex-1 flex items-center justify-center p-4">
                            {marca.logo_url ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        src={marca.logo_url}
                                        alt={marca.nombre}
                                        className="max-w-full max-h-32 object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                                    {/* Placeholder for missing logo, using yellow dot from reference somewhat */}
                                </div>
                            )}
                        </div>


                    </Link>
                ))}
            </div>
        </div>
    );
}
