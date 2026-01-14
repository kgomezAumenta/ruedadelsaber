'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/Admin/DataTable';
import Modal from '@/components/Admin/Modal';
import { Plus } from 'lucide-react';

interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    pais_id: number | null;
    pais_nombre: string | null;
    punto_venta_id: number | null;
    punto_venta_nombre: string | null;
}

interface Pais {
    id: number;
    nombre: string;
}

interface PuntoVenta {
    id: number;
    nombre: string;
    pais_id: number;
}

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [paises, setPaises] = useState<Pais[]>([]);
    const [puntosVenta, setPuntosVenta] = useState<PuntoVenta[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'promotor',
        pais_id: '',
        punto_venta_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usuariosRes, paisesRes, pvRes] = await Promise.all([
                fetch('/api/admin/usuarios'),
                fetch('/api/admin/paises'),
                fetch('/api/admin/puntos-venta')
            ]);
            const usuariosData = await usuariosRes.json();
            const paisesData = await paisesRes.json();
            const pvData = await pvRes.json();
            setUsuarios(usuariosData);
            setPaises(paisesData);
            setPuntosVenta(pvData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingUsuario(null);
        setFormData({ nombre: '', email: '', password: '', rol: 'promotor', pais_id: '', punto_venta_id: '' });
        setModalOpen(true);
    };

    const handleEdit = (usuario: Usuario) => {
        setEditingUsuario(usuario);
        setFormData({
            nombre: usuario.nombre,
            email: usuario.email,
            password: '',
            rol: usuario.rol,
            pais_id: usuario.pais_id?.toString() || '',
            punto_venta_id: usuario.punto_venta_id?.toString() || ''
        });
        setModalOpen(true);
    };

    const handleDelete = async (usuario: Usuario) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            await fetch(`/api/admin/usuarios?id=${usuario.id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error('Error deleting usuario:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const method = editingUsuario ? 'PUT' : 'POST';
            const body = editingUsuario
                ? {
                    id: editingUsuario.id,
                    ...formData,
                    pais_id: formData.pais_id ? parseInt(formData.pais_id) : null,
                    punto_venta_id: formData.punto_venta_id ? parseInt(formData.punto_venta_id) : null
                }
                : {
                    ...formData,
                    pais_id: formData.pais_id ? parseInt(formData.pais_id) : null,
                    punto_venta_id: formData.punto_venta_id ? parseInt(formData.punto_venta_id) : null
                };

            await fetch('/api/admin/usuarios', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            setModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving usuario:', error);
        }
    };

    const columns = [
        { header: 'Nombre', accessor: 'nombre' as keyof Usuario },
        { header: 'Email', accessor: 'email' as keyof Usuario },
        { header: 'Rol', accessor: 'rol' as keyof Usuario },
        { header: 'País', accessor: 'pais_nombre' as keyof Usuario },
        { header: 'Punto de Venta', accessor: 'punto_venta_nombre' as keyof Usuario },
    ];

    // Filter points of sale by selected country
    const filteredPuntosVenta = formData.pais_id
        ? puntosVenta.filter(pv => pv.pais_id === parseInt(formData.pais_id))
        : [];

    if (loading) {
        return <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Usuarios</h1>
                    <p className="text-gray-500 mt-2">Gestión de usuarios del sistema</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </div>

            <DataTable
                data={usuarios}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña {editingUsuario && '(dejar vacío)'}
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required={!editingUsuario}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                            <select
                                value={formData.rol}
                                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="promotor">Promotor</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">País (opcional)</label>
                            <select
                                value={formData.pais_id}
                                onChange={(e) => setFormData({ ...formData, pais_id: e.target.value, punto_venta_id: '' })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Sin país asignado</option>
                                {paises.map((pais) => (
                                    <option key={pais.id} value={pais.id}>{pais.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Punto de Venta (opcional)</label>
                            <select
                                value={formData.punto_venta_id}
                                onChange={(e) => setFormData({ ...formData, punto_venta_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={!formData.pais_id}
                            >
                                <option value="">Sin punto de venta</option>
                                {filteredPuntosVenta.map((pv) => (
                                    <option key={pv.id} value={pv.id}>{pv.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            {editingUsuario ? 'Actualizar' : 'Crear'}
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
