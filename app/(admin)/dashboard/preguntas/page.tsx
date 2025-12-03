'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/Admin/DataTable';
import Modal from '@/components/Admin/Modal';
import { Plus, Check, X, FileSpreadsheet, Upload } from 'lucide-react';

interface Respuesta {
    texto: string;
    es_correcta: boolean;
}

interface Pregunta {
    id: number;
    texto: string;
    pais_id: number;
    marca_bayer_id: number;
    pais_nombre: string;
    marca_bayer_nombre: string;
    respuestas?: Respuesta[];
}

interface Pais {
    id: number;
    nombre: string;
}

interface MarcaBayer {
    id: number;
    nombre: string;
    pais_nombre: string;
}

export default function PreguntasPage() {
    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [paises, setPaises] = useState<Pais[]>([]);
    const [marcasBayer, setMarcasBayer] = useState<MarcaBayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPregunta, setEditingPregunta] = useState<Pregunta | null>(null);
    const [formData, setFormData] = useState({
        texto: '',
        pais_id: '',
        marca_bayer_id: '',
        respuestas: [
            { texto: '', es_correcta: true },
            { texto: '', es_correcta: false },
            { texto: '', es_correcta: false }
        ]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [preguntasRes, paisesRes, marcasRes] = await Promise.all([
                fetch('/api/admin/preguntas'),
                fetch('/api/admin/paises'),
                fetch('/api/admin/marcas-bayer')
            ]);
            const preguntasData = await preguntasRes.json();
            const paisesData = await paisesRes.json();
            const marcasData = await marcasRes.json();
            setPreguntas(preguntasData);
            setPaises(paisesData);
            setMarcasBayer(marcasData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPregunta(null);
        setFormData({
            texto: '',
            pais_id: '',
            marca_bayer_id: '',
            respuestas: [
                { texto: '', es_correcta: true },
                { texto: '', es_correcta: false },
                { texto: '', es_correcta: false }
            ]
        });
        setModalOpen(true);
    };

    const handleEdit = (pregunta: Pregunta) => {
        setEditingPregunta(pregunta);
        setFormData({
            texto: pregunta.texto,
            pais_id: pregunta.pais_id.toString(),
            marca_bayer_id: pregunta.marca_bayer_id.toString(),
            respuestas: pregunta.respuestas || [
                { texto: '', es_correcta: true },
                { texto: '', es_correcta: false },
                { texto: '', es_correcta: false }
            ]
        });
        setModalOpen(true);
    };

    const handleDelete = async (pregunta: Pregunta) => {
        if (!confirm('¿Estás seguro de eliminar esta pregunta?')) return;

        try {
            await fetch(`/api/admin/preguntas?id=${pregunta.id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error('Error deleting pregunta:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate at least one correct answer
        const hasCorrect = formData.respuestas.some(r => r.es_correcta);
        if (!hasCorrect) {
            alert('Debe haber al menos una respuesta correcta');
            return;
        }

        try {
            const method = editingPregunta ? 'PUT' : 'POST';
            const body = editingPregunta
                ? {
                    id: editingPregunta.id,
                    ...formData,
                    pais_id: parseInt(formData.pais_id),
                    marca_bayer_id: parseInt(formData.marca_bayer_id)
                }
                : {
                    ...formData,
                    pais_id: parseInt(formData.pais_id),
                    marca_bayer_id: parseInt(formData.marca_bayer_id)
                };

            await fetch('/api/admin/preguntas', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            setModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving pregunta:', error);
        }
    };

    const updateRespuesta = (index: number, field: 'texto' | 'es_correcta', value: string | boolean) => {
        const newRespuestas = [...formData.respuestas];
        if (field === 'es_correcta' && value === true) {
            // Only one correct answer
            newRespuestas.forEach((r, i) => r.es_correcta = i === index);
        } else {
            newRespuestas[index] = { ...newRespuestas[index], [field]: value };
        }
        setFormData({ ...formData, respuestas: newRespuestas });
    };

    const columns = [
        { header: 'Pregunta', accessor: 'texto' as keyof Pregunta },
        { header: 'País', accessor: 'pais_nombre' as keyof Pregunta },
        { header: 'Marca Bayer', accessor: 'marca_bayer_nombre' as keyof Pregunta },
        {
            header: 'Respuestas',
            accessor: ((item: Pregunta) => (
                <span className="text-sm text-gray-600">
                    {item.respuestas?.length || 0} respuestas
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
                    <h1 className="text-3xl font-bold text-gray-800">Preguntas</h1>
                    <p className="text-gray-500 mt-2">Gestión de preguntas y respuestas</p>
                </div>
                <div className="flex gap-3">
                    <a
                        href="/api/admin/preguntas/template"
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors shadow-md"
                    >
                        <FileSpreadsheet className="w-5 h-5" />
                        Descargar Plantilla
                    </a>
                    <label className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition-colors shadow-md cursor-pointer">
                        <Upload className="w-5 h-5" />
                        Cargar Excel
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const formData = new FormData();
                                formData.append('file', file);

                                try {
                                    setLoading(true);
                                    const res = await fetch('/api/admin/preguntas/upload', {
                                        method: 'POST',
                                        body: formData,
                                    });
                                    if (res.ok) {
                                        const data = await res.json();
                                        let msg = data.message;
                                        if (data.details && data.details.length > 0) {
                                            msg += '\n\nDetalles:\n' + data.details.join('\n');
                                        }
                                        alert(msg);
                                        fetchData();
                                    } else {
                                        alert('Error al cargar preguntas');
                                    }
                                } catch (error) {
                                    console.error(error);
                                    alert('Error al cargar preguntas');
                                } finally {
                                    setLoading(false);
                                    e.target.value = ''; // Reset input
                                }
                            }}
                        />
                    </label>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Pregunta
                    </button>
                </div>
            </div>

            <DataTable
                data={preguntas}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingPregunta ? 'Editar Pregunta' : 'Nueva Pregunta'}>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pregunta</label>
                        <textarea
                            value={formData.texto}
                            onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                            <select
                                value={formData.pais_id}
                                onChange={(e) => setFormData({ ...formData, pais_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Seleccionar</option>
                                {paises.map((pais) => (
                                    <option key={pais.id} value={pais.id}>{pais.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Marca Bayer</label>
                            <select
                                value={formData.marca_bayer_id}
                                onChange={(e) => setFormData({ ...formData, marca_bayer_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Seleccionar</option>
                                {marcasBayer.map((marca) => (
                                    <option key={marca.id} value={marca.id}>
                                        {marca.nombre} ({marca.pais_nombre})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-medium text-gray-800 mb-3">Respuestas (marca la correcta)</h3>
                        {formData.respuestas.map((respuesta, index) => (
                            <div key={index} className="flex gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => updateRespuesta(index, 'es_correcta', true)}
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${respuesta.es_correcta
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                        }`}
                                >
                                    {respuesta.es_correcta ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                </button>
                                <input
                                    type="text"
                                    value={respuesta.texto}
                                    onChange={(e) => updateRespuesta(index, 'texto', e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={`Respuesta ${index + 1}`}
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            {editingPregunta ? 'Actualizar' : 'Crear'}
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
