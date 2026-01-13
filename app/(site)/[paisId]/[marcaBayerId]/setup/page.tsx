import { getGrupos, getMarcas, getUbicaciones } from '@/models/Catalogos';
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

    // Fetch all data for the country to pass to client component for filtering
    // Optimization: In a real large app, we might want to fetch only groups first, then others via API.
    // But for this scale, fetching all is fine.

    const grupos = await getGrupos(paisId);

    // We need to fetch ALL brands and locations that belong to these groups/brands
    // This is a bit inefficient with current model functions which filter by ID.
    // Let's do a custom query or fetch all for the country.

    // Fetch all brands for the country's groups
    const [marcasRows] = await pool.query<RowDataPacket[]>(
        'SELECT m.* FROM marcas m JOIN grupos g ON m.grupo_id = g.id WHERE g.pais_id = ?',
        [paisId]
    );
    const marcas = marcasRows as any[];

    // Fetch all locations for the country's brands
    const [ubicacionesRows] = await pool.query<RowDataPacket[]>(
        'SELECT u.* FROM ubicaciones u JOIN marcas m ON u.marca_id = m.id JOIN grupos g ON m.grupo_id = g.id WHERE g.pais_id = ?',
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
                    grupos={grupos}
                    marcas={marcas}
                    ubicaciones={ubicaciones}
                    paisId={paisIdStr}
                    marcaBayerId={marcaBayerId}
                />
            </div>
        </div>
    );
}
