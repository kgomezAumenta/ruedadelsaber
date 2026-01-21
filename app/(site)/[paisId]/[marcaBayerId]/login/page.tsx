import { getMarcaBayerById } from '@/models/Catalogos';
import LoginForm from './LoginForm';
import { redirect } from 'next/navigation';

export default async function LoginPage({ params }: { params: Promise<{ paisId: string; marcaBayerId: string }> }) {
    const { paisId, marcaBayerId } = await params;

    const marcaIdNum = parseInt(marcaBayerId);
    if (isNaN(marcaIdNum)) {
        redirect('/');
    }

    const marca = await getMarcaBayerById(marcaIdNum);

    return (
        <div className="w-full flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Left Side - Login Form */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
                    <LoginForm paisId={paisId} marcaBayerId={marcaBayerId} marca={marca} />
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

                        {/* Brand Text Removed */}
                        <p className="text-xl text-white/90 font-light">
                            Bienvenido al portal
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
