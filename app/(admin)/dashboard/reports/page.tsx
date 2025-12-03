'use client';

import { useState, useEffect } from 'react';
import { Download, PieChart } from 'lucide-react';

export default function ReportsPage() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch('/api/admin/reports?type=stats')
            .then(res => res.json())
            .then(data => setStats(data));
    }, []);

    const handleDownloadCSV = async () => {
        const res = await fetch('/api/admin/reports?type=csv');
        const data = await res.json();

        // Convert to CSV
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map((row: any) => Object.values(row).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_participaciones.csv';
        a.click();
    };

    if (!stats) return <div>Cargando reportes...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
                <button
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Download className="w-5 h-5" />
                    Exportar CSV
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
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen General</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                            <p className="text-sm text-blue-600 font-medium">Total Participaciones</p>
                            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                            <p className="text-sm text-green-600 font-medium">Ganadores</p>
                            <p className="text-3xl font-bold text-green-900">{stats.ganadores}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
