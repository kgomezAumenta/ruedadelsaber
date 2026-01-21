import Link from 'next/link';
import { getPaises } from '@/models/Catalogos';
import { MapPin } from 'lucide-react';

export default async function Home() {
    const paises = await getPaises();

    // Mapping for manual silhouettes/styles if we had them, for now just code
    // Assuming paises returns { id, nombre, etc }

    return (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4">
            {/* Logo Placeholder */}
            <div className="mb-8">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-blue-200">
                    <span className="text-blue-600 font-bold text-xs text-center leading-tight">BAYER</span>
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center drop-shadow-sm">
                Bienvenido a la Rueda del saber
            </h1>
            <p className="text-xl md:text-2xl mb-16 text-blue-50 text-center font-light">
                Selecciona tu país para comenzar
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                {paises.map((pais) => (
                    <div key={pais.id} className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-xl flex flex-col items-center transform transition-transform hover:scale-105 duration-300">
                        {/* Map Placeholder */}
                        <div className="w-full h-40 mb-6 flex items-center justify-center">
                            {/* In a real app, we would use an SVG silhouette based on pais.nombre */}
                            <MapPin className="w-24 h-24 text-blue-500 opacity-20" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-8">
                            {pais.nombre}
                        </h2>

                        <Link
                            href={`/${pais.id}`}
                            className="w-full bg-[#00529C] hover:bg-[#003e7a] text-white font-medium py-3 px-6 rounded-full flex items-center justify-between transition-colors group"
                        >
                            <span>Ingresar</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
