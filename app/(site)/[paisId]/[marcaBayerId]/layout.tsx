import { getMarcaBayerById } from '@/models/Catalogos';

export default async function BrandLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ marcaBayerId: string }>;
}) {
    const { marcaBayerId } = await params;
    const marca = await getMarcaBayerById(parseInt(marcaBayerId));

    return (
        <div className="w-full min-h-screen flex flex-col">
            {marca?.banner_url && (
                <div className="w-full h-32 md:h-48 bg-white relative overflow-hidden shadow-lg z-10">
                    <img
                        src={marca.banner_url}
                        alt={`Banner ${marca.nombre}`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                </div>
            )}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 py-8">
                {children}
            </div>
        </div>
    );
}
