import { NextRequest, NextResponse } from 'next/server';
import { createParticipacion, updateParticipacion } from '@/models/Juego';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as number;

        const { aciertos, gano, numero_participante } = await request.json();

        // In a real scenario, we would create the participation at start and update it at end.
        // For simplicity, we create it here or just record it.
        // The model has createParticipacion and updateParticipacion.

        const id = await createParticipacion(userId, numero_participante || 1);
        await updateParticipacion(id, aciertos, gano);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error saving participation' }, { status: 500 });
    }
}
