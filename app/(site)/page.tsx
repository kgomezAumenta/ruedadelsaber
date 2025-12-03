import Link from 'next/link';
import { getPaises } from '@/models/Catalogos';
import { MapPin } from 'lucide-react';

export default async function Home() {
    const paises = await getPaises();

    return (
        <div className="w-full max-w-4xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-12 text-white drop-shadow-lg">
                Bienvenido a la Rueda del Saber
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Selecciona tu país para comenzar
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paises.map((pais) => (
                    <Link
                        key={pais.id}
                        href={`/${pais.id}`}
                        className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm p-8 hover:bg-white/20 transition-all duration-300 border border-white/10 hover:border-white/30 hover:scale-105"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-blue-500/20 group-hover:bg-blue-500/40 transition-colors">
                                <MapPin className="w-8 h-8 text-blue-300 group-hover:text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
                                {pais.nombre}
                            </h2>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
