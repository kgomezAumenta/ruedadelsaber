'use client';

import { useState, useEffect } from 'react';
import { Download, PieChart, BarChart, ShoppingBag } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch('/api/admin/reports?type=stats')
            .then(res => res.json())
            .then(data => setStats(data));
    }, []);

    const handleDownloadExcel = async () => {
        const res = await fetch('/api/admin/reports?type=csv');
        const data = await res.json();

        // Use xlsx to create a proper Excel file
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Participaciones");

        XLSX.writeFile(wb, "reporte_participaciones.xlsx");
    };

    if (!stats) return <div>Cargando reportes...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
                <button
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
                >
                    <Download className="w-5 h-5" />
                    Exportar Excel (.xlsx)
                </button>
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
                                            style={{ width: `${(item.count / stats.total) * 100}%` }}
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
                                            style={{ width: `${(item.count / stats.total) * 100}%` }}
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
                                            style={{ width: `${(item.count / stats.total) * 100}%` }}
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
