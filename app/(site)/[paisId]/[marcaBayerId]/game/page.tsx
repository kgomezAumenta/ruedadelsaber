import GameContainer from '@/components/Game/GameContainer';
import { getPreguntasByMarcaBayer } from '@/models/Juego';
import { getMarcaBayerById } from '@/models/Catalogos';
import { redirect } from 'next/navigation';

export default async function GamePage({
    params,
    searchParams
}: {
    params: Promise<{ paisId: string; marcaBayerId: string }>;
    searchParams: Promise<{ participantes?: string }>;
}) {
    const { paisId: paisIdStr, marcaBayerId: marcaBayerIdStr } = await params;
    const { participantes } = await searchParams;

    const paisId = parseInt(paisIdStr);
    const marcaBayerId = parseInt(marcaBayerIdStr);
    const totalParticipants = participantes ? parseInt(participantes) : 1;

    // Validate that parameters are valid numbers
    if (isNaN(paisId) || isNaN(marcaBayerId)) {
        redirect('/');
    }

    const marca = await getMarcaBayerById(marcaBayerId);

    // Fetch questions server-side
    const preguntas = await getPreguntasByMarcaBayer(paisId, marcaBayerId);

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center py-8">
            <GameContainer
                preguntas={preguntas}
                paisId={paisIdStr}
                marcaBayerId={marcaBayerIdStr}
                totalParticipants={totalParticipants}
                marcaLogoUrl={marca?.logo_url}
            />
        </div>
    );
}
