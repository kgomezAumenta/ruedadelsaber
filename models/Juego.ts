import pool from '@/lib/db';
import { Pregunta, Respuesta } from './types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function getPreguntasByMarcaBayer(paisId: number, marcaBayerId: number): Promise<Pregunta[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM preguntas WHERE pais_id = ? AND marca_bayer_id = ?',
        [paisId, marcaBayerId]
    );

    const preguntas = rows as Pregunta[];

    // Fetch answers for each question
    for (const pregunta of preguntas) {
        const [respuestas] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM respuestas WHERE pregunta_id = ?',
            [pregunta.id]
        );
        pregunta.respuestas = respuestas as Respuesta[];
    }

    return preguntas;
}

export async function createParticipacion(usuarioId: number, numeroParticipante: number = 1): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO participaciones (usuario_id, fecha, numero_participante) VALUES (?, NOW(), ?)',
        [usuarioId, numeroParticipante]
    );
    return result.insertId;
}

export async function updateParticipacion(id: number, aciertos: number, gano: boolean): Promise<void> {
    await pool.query(
        'UPDATE participaciones SET aciertos = ?, gano = ? WHERE id = ?',
        [aciertos, gano, id]
    );
}

export async function saveRespuestaParticipante(
    participacionId: number,
    preguntaId: number,
    respuestaId: number,
    esCorrecta: boolean
): Promise<void> {
    await pool.query(
        'INSERT INTO respuestas_participantes (participacion_id, pregunta_id, respuesta_id, es_correcta) VALUES (?, ?, ?, ?)',
        [participacionId, preguntaId, respuestaId, esCorrecta]
    );
}
