'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/Admin/DataTable';
import Modal from '@/components/Admin/Modal';
import { Plus } from 'lucide-react';

interface Marca {
    id: number;
    nombre: string;
    grupo_id: number;
    grupo_nombre: string;
    pais_nombre: string;
}

interface Grupo {
    id: number;
    nombre: string;
    pais_nombre: string;
}

export default function MarcasPage() {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMarca, setEditingMarca] = useState<Marca | null>(null);
    const [formData, setFormData] = useState({ nombre: '', grupo_id: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [marcasRes, gruposRes] = await Promise.all([
                fetch('/api/admin/marcas'),
                fetch('/api/admin/grupos')
            ]);
            const marcasData = await marcasRes.json();
            const gruposData = await gruposRes.json();
            setMarcas(marcasData);
            setGrupos(gruposData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingMarca(null);
        setFormData({ nombre: '', grupo_id: '' });
        setModalOpen(true);
    };

    const handleEdit = (marca: Marca) => {
        setEditingMarca(marca);
        setFormData({ nombre: marca.nombre, grupo_id: marca.grupo_id.toString() });
        setModalOpen(true);
    };

    const handleDelete = async (marca: Marca) => {
        if (!confirm('¿Estás seguro de eliminar esta marca?')) return;

        try {
            await fetch(`/api/admin/marcas?id=${marca.id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error('Error deleting marca:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const method = editingMarca ? 'PUT' : 'POST';
            const body = editingMarca
                ? { id: editingMarca.id, ...formData, grupo_id: parseInt(formData.grupo_id) }
                : { ...formData, grupo_id: parseInt(formData.grupo_id) };

            await fetch('/api/admin/marcas', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            setModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving marca:', error);
        }
    };

    const columns = [
        { header: 'Nombre', accessor: 'nombre' as keyof Marca },
        { header: 'Grupo', accessor: 'grupo_nombre' as keyof Marca },
        { header: 'País', accessor: 'pais_nombre' as keyof Marca },
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
                    <h1 className="text-3xl font-bold text-gray-800">Marcas</h1>
                    <p className="text-gray-500 mt-2">Gestión de marcas por grupo</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Marca
                </button>
            </div>

            <DataTable
                data={marcas}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingMarca ? 'Editar Marca' : 'Nueva Marca'}>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Grupo</label>
                        <select
                            value={formData.grupo_id}
                            onChange={(e) => setFormData({ ...formData, grupo_id: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Seleccionar grupo</option>
                            {grupos.map((grupo) => (
                                <option key={grupo.id} value={grupo.id}>
                                    {grupo.nombre} ({grupo.pais_nombre})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            {editingMarca ? 'Actualizar' : 'Crear'}
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
