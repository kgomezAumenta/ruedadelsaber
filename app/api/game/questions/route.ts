import { NextResponse } from 'next/server';
import { getPreguntasByMarcaBayer } from '@/models/Juego';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const paisId = searchParams.get('paisId');
    const marcaBayerId = searchParams.get('marcaBayerId');

    if (!paisId || !marcaBayerId) {
        return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    try {
        const preguntas = await getPreguntasByMarcaBayer(parseInt(paisId), parseInt(marcaBayerId));
        return NextResponse.json(preguntas);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al obtener preguntas' }, { status: 500 });
    }
}
