import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as any[];

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        let importedCount = 0;
        let skippedCount = 0;
        const errors: string[] = [];

        try {
            console.log(`Processing ${rows.length} rows from Excel`);

            for (const [index, row] of rows.entries()) {
                // Expected columns: Pregunta, Pais, Marca, Respuesta1, Respuesta2, Respuesta3 (optional), Correcta (1, 2, or 3)
                let { Pregunta, Pais, Marca, Respuesta1, Respuesta2, Respuesta3, Correcta } = row;

                if (!Pregunta || !Pais || !Marca || !Respuesta1 || !Respuesta2 || !Correcta) {
                    console.log(`Row ${index + 1}: Missing required fields`, row);
                    skippedCount++;
                    errors.push(`Fila ${index + 1}: Faltan campos requeridos (Pregunta, Pais, Marca, Respuesta1, Respuesta2 o Correcta)`);
                    continue;
                }

                // Trim strings
                Pais = String(Pais).trim();
                Marca = String(Marca).trim();
                Pregunta = String(Pregunta).trim();
                Respuesta1 = String(Respuesta1).trim();
                Respuesta2 = String(Respuesta2).trim();
                Respuesta3 = String(Respuesta3).trim();

                // Find Pais ID
                const [paisRows] = await connection.query<RowDataPacket[]>('SELECT id FROM paises WHERE nombre = ?', [Pais]);
                if (paisRows.length === 0) {
                    console.log(`Row ${index + 1}: Pais not found: ${Pais}`);
                    skippedCount++;
                    errors.push(`Fila ${index + 1}: País "${Pais}" no encontrado`);
                    continue;
                }
                const paisId = paisRows[0].id;

                // Find Marca Bayer ID
                const [marcaRows] = await connection.query<RowDataPacket[]>('SELECT id FROM marcas_bayer WHERE nombre = ? AND pais_id = ?', [Marca, paisId]);
                if (marcaRows.length === 0) {
                    console.log(`Row ${index + 1}: Marca not found: ${Marca} in Pais ${Pais}`);
                    skippedCount++;
                    errors.push(`Fila ${index + 1}: Marca "${Marca}" no encontrada en ${Pais}`);
                    continue;
                }
                const marcaBayerId = marcaRows[0].id;

                // Check if question exists
                const [existingPregunta] = await connection.query<RowDataPacket[]>(
                    'SELECT id FROM preguntas WHERE texto = ? AND pais_id = ?',
                    [Pregunta, paisId]
                );

                if (existingPregunta.length > 0) {
                    console.log(`Row ${index + 1}: Pregunta already exists: ${Pregunta}`);
                    skippedCount++;
                    errors.push(`Fila ${index + 1}: La pregunta ya existe para "${Pais}"`);
                    continue;
                }

                // Insert Question
                const [questionResult] = await connection.query<ResultSetHeader>(
                    'INSERT INTO preguntas (texto, pais_id, marca_bayer_id) VALUES (?, ?, ?)',
                    [Pregunta, paisId, marcaBayerId]
                );
                const questionId = questionResult.insertId;

                // Insert Answers (Only those that have text)
                const answers = [
                    { texto: Respuesta1, es_correcta: Correcta === 1 || Correcta === '1' },
                    { texto: Respuesta2, es_correcta: Correcta === 2 || Correcta === '2' },
                ];
                
                if (Respuesta3 && String(Respuesta3).trim() !== '') {
                    answers.push({ texto: Respuesta3, es_correcta: Correcta === 3 || Correcta === '3' });
                }

                for (const answer of answers) {
                    await connection.query(
                        'INSERT INTO respuestas (pregunta_id, texto, es_correcta) VALUES (?, ?, ?)',
                        [questionId, String(answer.texto).trim(), answer.es_correcta]
                    );
                }
                importedCount++;
            }

            await connection.commit();
            console.log(`Import finished. Imported: ${importedCount}, Skipped: ${skippedCount}`);

            return NextResponse.json({
                success: true,
                message: `Proceso finalizado. Importadas: ${importedCount}, Omitidas: ${skippedCount}`,
                details: errors
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error processing Excel:', error);
        return NextResponse.json({ error: 'Error processing file' }, { status: 500 });
    }
}
