'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Grupo, Marca, Ubicacion } from '@/models/types';
import { Users, MapPin, Building2, Store } from 'lucide-react';

interface SetupFormProps {
    grupos: Grupo[];
    marcas: Marca[];
    ubicaciones: Ubicacion[];
    paisId: string;
    marcaBayerId: string;
}

export default function SetupForm({ grupos, marcas, ubicaciones, paisId, marcaBayerId }: SetupFormProps) {
    const router = useRouter();
    const [selectedGrupo, setSelectedGrupo] = useState<string>('');
    const [selectedMarca, setSelectedMarca] = useState<string>('');
    const [selectedUbicacion, setSelectedUbicacion] = useState<string>('');
    const [participantes, setParticipantes] = useState<number>(1);

    // Filter brands based on selected group
    const filteredMarcas = useMemo(() => {
        return marcas.filter(m => m.grupo_id === parseInt(selectedGrupo));
    }, [selectedGrupo, marcas]);

    // Filter locations based on selected brand
    const filteredUbicaciones = useMemo(() => {
        return ubicaciones.filter(u => u.marca_id === parseInt(selectedMarca));
    }, [selectedMarca, ubicaciones]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Save setup to sessionStorage or context if needed, or pass via URL params
        // For now, we'll pass via URL params to the game/institutional page
        const query = new URLSearchParams({
            grupo: selectedGrupo,
            marca: selectedMarca,
            ubicacion: selectedUbicacion,
            participantes: participantes.toString(),
        });

        router.push(`/${paisId}/${marcaBayerId}/institutional?${query.toString()}`);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Grupo</label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                        value={selectedGrupo}
                        onChange={(e) => {
                            setSelectedGrupo(e.target.value);
                            setSelectedMarca('');
                            setSelectedUbicacion('');
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 appearance-none bg-white"
                        required
                    >
                        <option value="">Seleccione un Grupo</option>
                        {grupos.map(g => (
                            <option key={g.id} value={g.id}>{g.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Marca</label>
                <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                        value={selectedMarca}
                        onChange={(e) => {
                            setSelectedMarca(e.target.value);
                            setSelectedUbicacion('');
                        }}
                        disabled={!selectedGrupo}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 appearance-none bg-white disabled:bg-gray-100"
                        required
                    >
                        <option value="">Seleccione una Marca</option>
                        {filteredMarcas.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
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
                        disabled={!selectedMarca}
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
