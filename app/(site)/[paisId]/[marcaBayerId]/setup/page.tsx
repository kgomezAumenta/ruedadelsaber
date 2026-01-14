import SetupForm from '@/components/SetupForm';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { redirect } from 'next/navigation';

export default async function SetupPage({ params }: { params: Promise<{ paisId: string; marcaBayerId: string }> }) {
    const { paisId: paisIdStr, marcaBayerId } = await params;
    const paisId = parseInt(paisIdStr);
    const marcaBayerIdNum = parseInt(marcaBayerId);

    // Validate that parameters are valid numbers
    if (isNaN(paisId) || isNaN(marcaBayerIdNum)) {
        redirect('/');
    }

    // Fetch points of sale and locations for the country
    const [pvRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM puntos_venta WHERE pais_id = ? ORDER BY nombre',
        [paisId]
    );
    const puntosVenta = pvRows as any[];

    const [ubicacionesRows] = await pool.query<RowDataPacket[]>(
        'SELECT u.* FROM ubicaciones u JOIN puntos_venta pv ON u.punto_venta_id = pv.id WHERE pv.pais_id = ?',
        [paisId]
    );
    const ubicaciones = ubicacionesRows as any[];

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
                <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
                    Configuración de Juego
                </h1>

                <SetupForm
                    puntosVenta={puntosVenta}
                    ubicaciones={ubicaciones}
                    paisId={paisIdStr}
                    marcaBayerId={marcaBayerId}
                />
            </div>
        </div>
    );
}
