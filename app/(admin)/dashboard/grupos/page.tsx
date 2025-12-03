'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/Admin/DataTable';
import Modal from '@/components/Admin/Modal';
import { Plus } from 'lucide-react';

interface Grupo {
    id: number;
    nombre: string;
    pais_id: number;
    pais_nombre: string;
}

interface Pais {
    id: number;
    nombre: string;
}

export default function GruposPage() {
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [paises, setPaises] = useState<Pais[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingGrupo, setEditingGrupo] = useState<Grupo | null>(null);
    const [formData, setFormData] = useState({ nombre: '', pais_id: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [gruposRes, paisesRes] = await Promise.all([
                fetch('/api/admin/grupos'),
                fetch('/api/admin/paises')
            ]);
            const gruposData = await gruposRes.json();
            const paisesData = await paisesRes.json();
            setGrupos(gruposData);
            setPaises(paisesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingGrupo(null);
        setFormData({ nombre: '', pais_id: '' });
        setModalOpen(true);
    };

    const handleEdit = (grupo: Grupo) => {
        setEditingGrupo(grupo);
        setFormData({ nombre: grupo.nombre, pais_id: grupo.pais_id.toString() });
        setModalOpen(true);
    };

    const handleDelete = async (grupo: Grupo) => {
        if (!confirm('¿Estás seguro de eliminar este grupo?')) return;

        try {
            await fetch(`/api/admin/grupos?id=${grupo.id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error('Error deleting grupo:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const method = editingGrupo ? 'PUT' : 'POST';
            const body = editingGrupo
                ? { id: editingGrupo.id, ...formData, pais_id: parseInt(formData.pais_id) }
                : { ...formData, pais_id: parseInt(formData.pais_id) };

            await fetch('/api/admin/grupos', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            setModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving grupo:', error);
        }
    };

    const columns = [
        { header: 'Nombre', accessor: 'nombre' as keyof Grupo },
        { header: 'País', accessor: 'pais_nombre' as keyof Grupo },
    ];

    if (loading) {
        return <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Grupos</h1>
                    <p className="text-gray-500 mt-2">Gestión de grupos por país</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Grupo
                </button>
            </div>

            <DataTable
                data={grupos}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingGrupo ? 'Editar Grupo' : 'Nuevo Grupo'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                        <select
                            value={formData.pais_id}
                            onChange={(e) => setFormData({ ...formData, pais_id: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Seleccionar país</option>
                            {paises.map((pais) => (
                                <option key={pais.id} value={pais.id}>{pais.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            {editingGrupo ? 'Actualizar' : 'Crear'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
