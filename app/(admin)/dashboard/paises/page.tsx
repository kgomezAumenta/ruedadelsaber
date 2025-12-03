'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/Admin/DataTable';
import Modal from '@/components/Admin/Modal';
import { Plus } from 'lucide-react';
import { Pais } from '@/models/types';

export default function PaisesPage() {
    const [paises, setPaises] = useState<Pais[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPais, setCurrentPais] = useState<Partial<Pais>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPaises();
    }, []);

    const fetchPaises = async () => {
        const res = await fetch('/api/admin/paises');
        const data = await res.json();
        setPaises(data);
        setLoading(false);
    };

    const handleSave = async () => {
        const method = currentPais.id ? 'PUT' : 'POST';
        const body = JSON.stringify(currentPais);

        await fetch('/api/admin/paises', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body,
        });

        setIsModalOpen(false);
        fetchPaises();
    };

    const handleDelete = async (pais: Pais) => {
        if (confirm('¿Estás seguro de eliminar este país?')) {
            await fetch(`/api/admin/paises?id=${pais.id}`, { method: 'DELETE' });
            fetchPaises();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Países</h1>
                <button
                    onClick={() => {
                        setCurrentPais({});
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo País
                </button>
            </div>

            {loading ? (
                <div>Cargando...</div>
            ) : (
                <DataTable
                    data={paises}
                    columns={[
                        { header: 'ID', accessor: 'id' },
                        { header: 'Nombre', accessor: 'nombre' },
                    ]}
                    onEdit={(pais) => {
                        setCurrentPais(pais);
                        setIsModalOpen(true);
                    }}
                    onDelete={handleDelete}
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentPais.id ? 'Editar País' : 'Nuevo País'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={currentPais.nombre || ''}
                            onChange={(e) => setCurrentPais({ ...currentPais, nombre: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
