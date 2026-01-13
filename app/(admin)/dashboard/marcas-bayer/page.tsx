'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/Admin/DataTable';
import Modal from '@/components/Admin/Modal';
import { Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarcaBayer {
    id: number;
    nombre: string;
    pais_id: number;
    logo_url: string | null;
    banner_url: string | null;
    activa: boolean;
    pais_nombre: string;
}

interface Pais {
    id: number;
    nombre: string;
}

export default function MarcasBayerPage() {
    const [marcasBayer, setMarcasBayer] = useState<MarcaBayer[]>([]);
    const [paises, setPaises] = useState<Pais[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMarca, setEditingMarca] = useState<MarcaBayer | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        pais_id: '',
        logo_url: '',
        banner_url: '',
        activa: true
    });
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [marcasRes, paisesRes] = await Promise.all([
                fetch('/api/admin/marcas-bayer'),
                fetch('/api/admin/paises')
            ]);
            const marcasData = await marcasRes.json();
            const paisesData = await paisesRes.json();
            setMarcasBayer(marcasData);
            setPaises(paisesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingMarca(null);
        setFormData({ nombre: '', pais_id: '', logo_url: '', banner_url: '', activa: true });
        setModalOpen(true);
    };

    const handleEdit = (marca: MarcaBayer) => {
        setEditingMarca(marca);
        setFormData({
            nombre: marca.nombre,
            pais_id: marca.pais_id.toString(),
            logo_url: marca.logo_url || '',
            banner_url: marca.banner_url || '',
            activa: Boolean(marca.activa)
        });
        setModalOpen(true);
    };

    const handleDelete = async (marca: MarcaBayer) => {
        if (!confirm('¿Estás seguro de eliminar esta marca Bayer?')) return;

        try {
            await fetch(`/api/admin/marcas-bayer?id=${marca.id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error('Error deleting marca bayer:', error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const setUploading = type === 'logo' ? setUploadingLogo : setUploadingBanner;
        setUploading(true);

        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('type', type);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload,
            });
            const data = await res.json();

            if (data.url) {
                setFormData(prev => ({
                    ...prev,
                    [type === 'logo' ? 'logo_url' : 'banner_url']: data.url
                }));
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const method = editingMarca ? 'PUT' : 'POST';
            const body = editingMarca
                ? { id: editingMarca.id, ...formData, pais_id: parseInt(formData.pais_id) }
                : { ...formData, pais_id: parseInt(formData.pais_id) };

            await fetch('/api/admin/marcas-bayer', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            setModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving marca bayer:', error);
        }
    };

    const columns = [
        { header: 'Nombre', accessor: 'nombre' as keyof MarcaBayer },
        { header: 'País', accessor: 'pais_nombre' as keyof MarcaBayer },
        {
            header: 'Logo',
            accessor: ((item: MarcaBayer) => (
                item.logo_url ? (
                    <img src={item.logo_url} alt="Logo" className="h-8 w-auto object-contain" />
                ) : <span className="text-gray-400 text-xs">Sin logo</span>
            )) as any
        },
        {
            header: 'Banner',
            accessor: ((item: MarcaBayer) => (
                item.banner_url ? (
                    <img src={item.banner_url} alt="Banner" className="h-8 w-16 object-cover rounded" />
                ) : <span className="text-gray-400 text-xs">Sin banner</span>
            )) as any
        },
        {
            header: 'Estado',
            accessor: ((item: MarcaBayer) => (
                <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold",
                    item.activa ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                    {item.activa ? 'Activa' : 'Inactiva'}
                </span>
            )) as any
        },
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
                    <h1 className="text-3xl font-bold text-gray-800">Marcas Bayer</h1>
                    <p className="text-gray-500 mt-2">Gestión de marcas Bayer por país</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Marca Bayer
                </button>
            </div>

            <DataTable
                data={marcasBayer}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingMarca ? 'Editar Marca Bayer' : 'Nueva Marca Bayer'}>
                <form onSubmit={handleSubmit} className="space-y-6">
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

                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                        <div className="flex items-center gap-4">
                            {formData.logo_url && (
                                <div className="relative w-20 h-20 border rounded-lg overflow-hidden bg-gray-50">
                                    <img src={formData.logo_url} alt="Logo Preview" className="w-full h-full object-contain" />
                                </div>
                            )}
                            <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                                {uploadingLogo ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                    <Upload className="w-4 h-4 text-gray-600" />
                                )}
                                <span className="text-sm text-gray-600">Subir Logo</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'logo')}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Banner Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Banner</label>
                        <div className="flex items-center gap-4">
                            {formData.banner_url && (
                                <div className="relative w-32 h-16 border rounded-lg overflow-hidden bg-gray-50">
                                    <img src={formData.banner_url} alt="Banner Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                                {uploadingBanner ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                    <Upload className="w-4 h-4 text-gray-600" />
                                )}
                                <span className="text-sm text-gray-600">Subir Banner</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'banner')}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <input
                            type="checkbox"
                            role="switch"
                            id="activa"
                            checked={formData.activa}
                            onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="activa" className="text-sm font-bold text-gray-700 cursor-pointer">
                            Marca Activa (visible en el sitio)
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
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
