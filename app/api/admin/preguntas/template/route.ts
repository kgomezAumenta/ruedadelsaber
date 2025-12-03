import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
    try {
        const worksheet = XLSX.utils.json_to_sheet([
            {
                Pregunta: '¿Cuál es el ingrediente activo de Aspirina?',
                Pais: 'Costa Rica',
                Marca: 'Aspirina',
                Respuesta1: 'Ácido Acetilsalicílico',
                Respuesta2: 'Ibuprofeno',
                Respuesta3: 'Paracetamol',
                Correcta: 1
            },
            {
                Pregunta: '¿Para qué sirve Alka-Seltzer?',
                Pais: 'Costa Rica',
                Marca: 'Alka-Seltzer',
                Respuesta1: 'Dolor de cabeza',
                Respuesta2: 'Malestar estomacal',
                Respuesta3: 'Ambos',
                Correcta: 3
            }
        ]);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="plantilla_preguntas.xlsx"'
            }
        });
    } catch (error) {
        console.error('Error generating template:', error);
        return NextResponse.json({ error: 'Error generating template' }, { status: 500 });
    }
}
