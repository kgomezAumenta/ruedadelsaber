'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/Admin/DataTable';
import Modal from '@/components/Admin/Modal';
import { Plus } from 'lucide-react';

interface Ubicacion {
    id: number;
    nombre: string;
    punto_venta_id: number;
    punto_venta_nombre: string;
    pais_nombre: string;
}

interface PuntoVenta {
    id: number;
    nombre: string;
    pais_nombre: string;
}

export default function UbicacionesPage() {
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [puntosVenta, setPuntosVenta] = useState<PuntoVenta[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUbicacion, setEditingUbicacion] = useState<Ubicacion | null>(null);
    const [formData, setFormData] = useState({ nombre: '', punto_venta_id: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ubicacionesRes, pvRes] = await Promise.all([
                fetch('/api/admin/ubicaciones'),
                fetch('/api/admin/puntos-venta')
            ]);
            const ubicacionesData = await ubicacionesRes.json();
            const pvData = await pvRes.json();
            setUbicaciones(ubicacionesData);
            setPuntosVenta(pvData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingUbicacion(null);
        setFormData({ nombre: '', punto_venta_id: '' });
        setModalOpen(true);
    };

    const handleEdit = (ubicacion: Ubicacion) => {
        setEditingUbicacion(ubicacion);
        setFormData({ nombre: ubicacion.nombre, punto_venta_id: ubicacion.punto_venta_id.toString() });
        setModalOpen(true);
    };

    const handleDelete = async (ubicacion: Ubicacion) => {
        if (!confirm('¿Estás seguro de eliminar esta ubicación?')) return;

        try {
            await fetch(`/api/admin/ubicaciones?id=${ubicacion.id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error('Error deleting ubicacion:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const method = editingUbicacion ? 'PUT' : 'POST';
            const body = editingUbicacion
                ? { id: editingUbicacion.id, ...formData, punto_venta_id: parseInt(formData.punto_venta_id) }
                : { ...formData, punto_venta_id: parseInt(formData.punto_venta_id) };

            await fetch('/api/admin/ubicaciones', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            setModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving ubicacion:', error);
        }
    };

    const columns = [
        { header: 'Nombre', accessor: 'nombre' as keyof Ubicacion },
        { header: 'Punto de Venta', accessor: 'punto_venta_nombre' as keyof Ubicacion },
        { header: 'País', accessor: 'pais_nombre' as keyof Ubicacion },
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
                    <h1 className="text-3xl font-bold text-gray-800">Ubicaciones</h1>
                    <p className="text-gray-500 mt-2">Gestión de ubicaciones por punto de venta</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Ubicación
                </button>
            </div>

            <DataTable
                data={ubicaciones}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUbicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Punto de Venta</label>
                        <select
                            value={formData.punto_venta_id}
                            onChange={(e) => setFormData({ ...formData, punto_venta_id: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Seleccionar punto de venta</option>
                            {puntosVenta.map((pv) => (
                                <option key={pv.id} value={pv.id}>
                                    {pv.nombre} ({pv.pais_nombre})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            {editingUbicacion ? 'Actualizar' : 'Crear'}
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
