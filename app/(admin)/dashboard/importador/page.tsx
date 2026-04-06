'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';

export default function ImportadorPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [results, setResults] = useState<{ success?: string; errors?: string[] } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResults(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setResults(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Expected headers: País, Punto de Venta, Ubicación, Nombre Usuario, Email, Contraseña
            const json = XLSX.utils.sheet_to_json<any>(worksheet);

            // Mapping Excel columns to API payload
            const mappedRows = json.map(row => ({
                pais: row['País'] || row['Pais'],
                puntoVenta: row['Punto de Venta'] || row['Punto De Venta'],
                ubicacion: row['Ubicación'] || row['Ubicacion'],
                nombreUsuario: row['Nombre Usuario'] || row['Nombre'] || row['Usuario'],
                email: row['Email'] || row['Correo'],
                password: row['Contraseña'] || row['Clave'] || row['Password'],
                rol: row['Rol'] || 'promotor'
            }));

            const response = await fetch('/api/admin/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows: mappedRows })
            });

            const resultData = await response.json();

            if (response.ok) {
                setResults({
                    success: resultData.message,
                    errors: resultData.errors && resultData.errors.length > 0 ? resultData.errors : undefined
                });
                setFile(null); // Reset form
            } else {
                setResults({
                    errors: [resultData.error || 'Ocurrió un error al procesar el archivo']
                });
            }

        } catch (error) {
            console.error(error);
            setResults({
                errors: ['Error al leer el archivo. Asegúrate de que sea un Excel válido.']
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 mb-6">
                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-800">Carga Masiva de Datos</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <p className="text-gray-600 mb-6">
                    Sube un archivo de Excel (.xlsx, .csv) para importar Puntos de Venta, Ubicaciones y Usuarios simultáneamente. Las columnas obligatorias son: <strong>País, Punto de Venta, Ubicación, Nombre Usuario, Email, y Contraseña.</strong>
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                    <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleFileChange}
                        className="hidden" 
                        id="file-upload"
                    />
                    <label 
                        htmlFor="file-upload" 
                        className="cursor-pointer flex flex-col items-center gap-4"
                    >
                        <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <span className="text-lg font-medium text-gray-700">
                            {file ? file.name : "Seleccionar Archivo de Excel"}
                        </span>
                        <span className="text-sm text-gray-500">
                            Haz clic para buscar en tu dispositivo
                        </span>
                    </label>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {isUploading ? (
                            <>Procesando...</>
                        ) : (
                            <>
                                <UploadCloud className="w-5 h-5" />
                                Iniciar Importación
                            </>
                        )}
                    </button>
                </div>
            </div>

            {results && (
                <div className="space-y-4">
                    {results.success && (
                        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-6 flex items-start gap-4">
                            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-lg mb-1">¡Éxito!</h3>
                                <p>{results.success}</p>
                            </div>
                        </div>
                    )}

                    {results.errors && results.errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="w-full">
                                <h3 className="font-bold text-lg mb-2">Se encontraron algunos problemas:</h3>
                                <ul className="list-disc ml-5 space-y-1 text-sm">
                                    {results.errors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
