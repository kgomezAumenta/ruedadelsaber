import SetupForm from '@/components/SetupForm';
import pool from '@/lib/db';
import { getMarcaBayerById } from '@/models/Catalogos';
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

    // Fetch brand data for the visual side
    const marca = await getMarcaBayerById(marcaBayerIdNum);

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
        <div className="w-full flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Left Side - Setup Form */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
                        Configuración de Juego
                    </h1>
                    <div className="w-full max-w-md">
                        <SetupForm
                            puntosVenta={puntosVenta}
                            ubicaciones={ubicaciones}
                            paisId={paisIdStr}
                            marcaBayerId={marcaBayerId}
                        />
                    </div>
                </div>

                {/* Right Side - Brand Visual */}
                <div className="hidden md:flex w-full md:w-1/2 bg-[#8B2D78] items-center justify-center p-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-800 to-pink-700 opacity-90"></div>

                    <div className="relative z-10 flex flex-col items-center justify-center text-center">
                        {/* Brand Logo Large - No White Circle */}
                        {marca?.logo_url ? (
                            <div className="w-64 h-64 flex items-center justify-center mb-8">
                                <img
                                    src={marca.logo_url}
                                    alt={marca.nombre}
                                    className="max-w-full max-h-full object-contain filter drop-shadow-xl"
                                />
                            </div>
                        ) : (
                            <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center mb-8 animate-pulse"></div>
                        )}

                        <p className="text-xl text-white/90 font-light">
                            Bienvenido al portal
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
