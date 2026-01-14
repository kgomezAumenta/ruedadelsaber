'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PuntoVenta, Ubicacion } from '@/models/types';
import { Users, MapPin, Store } from 'lucide-react';

interface SetupFormProps {
    puntosVenta: PuntoVenta[];
    ubicaciones: Ubicacion[];
    paisId: string;
    marcaBayerId: string;
}

export default function SetupForm({ puntosVenta, ubicaciones, paisId, marcaBayerId }: SetupFormProps) {
    const router = useRouter();
    const [selectedPuntoVenta, setSelectedPuntoVenta] = useState<string>('');
    const [selectedUbicacion, setSelectedUbicacion] = useState<string>('');
    const [participantes, setParticipantes] = useState<number>(1);

    // Filter locations based on selected point of sale
    const filteredUbicaciones = useMemo(() => {
        return ubicaciones.filter(u => u.punto_venta_id === parseInt(selectedPuntoVenta));
    }, [selectedPuntoVenta, ubicaciones]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const query = new URLSearchParams({
            punto_venta: selectedPuntoVenta,
            ubicacion: selectedUbicacion,
            participantes: participantes.toString(),
        });

        router.push(`/${paisId}/${marcaBayerId}/institutional?${query.toString()}`);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Punto de Venta</label>
                <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                        value={selectedPuntoVenta}
                        onChange={(e) => {
                            setSelectedPuntoVenta(e.target.value);
                            setSelectedUbicacion('');
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 appearance-none bg-white"
                        required
                    >
                        <option value="">Seleccione un Punto de Venta</option>
                        {puntosVenta?.map(pv => (
                            <option key={pv.id} value={pv.id}>{pv.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ubicación</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                        value={selectedUbicacion}
                        onChange={(e) => setSelectedUbicacion(e.target.value)}
                        disabled={!selectedPuntoVenta}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 appearance-none bg-white disabled:bg-gray-100"
                        required
                    >
                        <option value="">Seleccione una Ubicación</option>
                        {filteredUbicaciones.map(u => (
                            <option key={u.id} value={u.id}>{u.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cantidad de Participantes</label>
                <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={participantes}
                        onChange={(e) => setParticipantes(parseInt(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
                Continuar
            </button>
        </form>
    );
}
