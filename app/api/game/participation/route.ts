import { NextRequest, NextResponse } from 'next/server';
import { createParticipacion, updateParticipacion } from '@/models/Juego';
import { getUserById } from '@/models/Usuarios';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as number;

        const { aciertos, gano, marca_bayer_id, numero_participante, punto_venta_id, ubicacion_id, respuestas } = await request.json();
        const marcaId = parseInt(marca_bayer_id);

        if (isNaN(marcaId)) {
            return NextResponse.json({ error: 'Invalid Marca Bayer ID' }, { status: 400 });
        }

        const user = await getUserById(userId);

        // In a real scenario, we would create the participation at start and update it at end.
        // For simplicity, we create it here or just record it.
        // The model has createParticipacion and updateParticipacion.

        const id = await createParticipacion(
            userId, 
            marcaId, 
            numero_participante || 1, 
            punto_venta_id || user?.punto_venta_id || null, 
            ubicacion_id || user?.ubicacion_id || null
        );
        await updateParticipacion(id, aciertos, gano);

        // Save individual answers for training reports
        if (respuestas && Array.isArray(respuestas)) {
            const { saveRespuestaParticipante } = await import('@/models/Juego');
            for (const r of respuestas) {
                await saveRespuestaParticipante(
                    id,
                    r.pregunta_id,
                    r.respuesta_id, // can be null if timed out
                    r.es_correcta
                );
            }
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error saving participation' }, { status: 500 });
    }
}
