'use client';

import { useState, useEffect } from 'react';
import { Download, PieChart, BarChart, ShoppingBag, Filter, FileWarning } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [paises, setPaises] = useState<any[]>([]);
    const [filterMonth, setFilterMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [filterYear, setFilterYear] = useState<string>(String(new Date().getFullYear()));
    const [filterPais, setFilterPais] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const months = [
        { value: '1', label: 'Enero' },
        { value: '2', label: 'Febrero' },
        { value: '3', label: 'Marzo' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Mayo' },
        { value: '6', label: 'Junio' },
        { value: '7', label: 'Julio' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' },
    ];

    const currentYear = new Date().getFullYear();
    const years = [String(currentYear - 1), String(currentYear)];

    useEffect(() => {
        fetchStats();
        fetchPaises();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/reports?type=stats');
            const data = await res.json();
            setStats(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaises = async () => {
        try {
            const res = await fetch('/api/admin/paises');
            const data = await res.json();
            setPaises(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDownloadExcel = async () => {
        let url = `/api/admin/reports?type=csv&month=${filterMonth}&year=${filterYear}`;
        if (filterPais) url += `&paisId=${filterPais}`;
        
        const res = await fetch(url);
        const data = await res.json();

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Participaciones");

        const fileName = `reporte_participaciones_${filterMonth}_${filterYear}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const handleDownloadIncorrect = async () => {
        let url = `/api/admin/reports?type=incorrect&month=${filterMonth}&year=${filterYear}`;
        if (filterPais) url += `&paisId=${filterPais}`;
        
        const res = await fetch(url);
        const data = await res.json();

        if (data.length === 0) {
            alert('No hay datos de respuestas incorrectas para los filtros seleccionados.');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Errores Capacitacion");

        const fileName = `reporte_errores_capacitacion_${filterMonth}_${filterYear}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    if (loading || !stats) return <div className="p-8 text-center">Cargando reportes...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
                    <p className="text-gray-500">Analiza el desempeño y genera reportes para capacitación</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleDownloadExcel}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        Participaciones (.xlsx)
                    </button>
                    <button
                        onClick={handleDownloadIncorrect}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md text-sm font-medium"
                    >
                        <FileWarning className="w-4 h-4" />
                        Errores para Capacitación (.xlsx)
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <Filter className="w-5 h-5" />
                    <span className="font-medium">Filtros de Exportación:</span>
                </div>
                
                <select 
                    value={filterMonth} 
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    {months.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>

                <select 
                    value={filterYear} 
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>

                <select 
                    value={filterPais} 
                    onChange={(e) => setFilterPais(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">Todos los Países</option>
                    {paises.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                </select>
                
                <p className="text-xs text-gray-400 italic">Los filtros aplican solo a las descargas de Excel.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-blue-600" />
                        Participaciones por País
                    </h3>
                    <div className="space-y-4">
                        {stats.porPais.map((item: any) => (
                            <div key={item.nombre} className="flex justify-between items-center">
                                <span className="text-gray-600">{item.nombre}</span>
                                <div className="flex items-center gap-4">
                                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-gray-800">{item.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-green-600" />
                        Participaciones por Punto de Venta
                    </h3>
                    <div className="space-y-4">
                        {stats.porPuntoVenta.map((item: any) => (
                            <div key={item.nombre} className="flex justify-between items-center">
                                <span className="text-gray-600">{item.nombre}</span>
                                <div className="flex items-center gap-4">
                                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-gray-800">{item.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-purple-600" />
                        Participaciones por Marca Bayer
                    </h3>
                    <div className="space-y-4">
                        {stats.porMarcaBayer.map((item: any) => (
                            <div key={item.nombre} className="flex justify-between items-center">
                                <span className="text-gray-600">{item.nombre || 'Sin Marca'}</span>
                                <div className="flex items-center gap-4">
                                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500"
                                            style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-gray-800">{item.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 col-span-1 md:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen General</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="p-6 bg-blue-50 rounded-2xl text-center border border-blue-100">
                            <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">Total Participaciones</p>
                            <p className="text-4xl font-black text-blue-900">{stats.total}</p>
                        </div>
                        <div className="p-6 bg-green-50 rounded-2xl text-center border border-green-100">
                            <p className="text-sm text-green-600 font-bold uppercase tracking-wider mb-2">Ganadores</p>
                            <p className="text-4xl font-black text-green-900">{stats.ganadores}</p>
                        </div>
                        <div className="p-6 bg-purple-50 rounded-2xl text-center border border-purple-100">
                            <p className="text-sm text-purple-600 font-bold uppercase tracking-wider mb-2">Efectividad</p>
                            <p className="text-4xl font-black text-purple-900">
                                {stats.total > 0 ? Math.round((stats.ganadores / stats.total) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
