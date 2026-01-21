'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';
import { MarcaBayer } from '@/models/types';

interface LoginFormProps {
    paisId: string;
    marcaBayerId: string;
    marca: MarcaBayer | null;
}

export default function LoginForm({ paisId, marcaBayerId, marca }: LoginFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push(`/${paisId}/${marcaBayerId}/setup`);
            } else {
                const data = await res.json();
                setError(data.error || 'Credenciales inválidas');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-center text-blue-900 mb-2">
                Ingreso
            </h1>
            {/* Logo in form if needed, or consistent headers */}
            {marca?.logo_url && (
                <div className="w-32 h-32 mx-auto mb-6 relative flex items-center justify-center">
                    <img src={marca.logo_url} alt={marca.nombre} className="max-w-full max-h-full object-contain" />
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-800">Email</label>
                    <div className="relative">
                        {/* Removed icons to match clean design if needed, but keeping for now as they look good */}
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-gray-50"
                            placeholder="email@mail.com"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-800">Contraseña</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-gray-50 text-2xl tracking-widest"
                            placeholder="••••••"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#4285F4] hover:bg-blue-600 text-white font-bold py-3 rounded-full transition-colors disabled:opacity-50 mt-8"
                >
                    {loading ? 'Ingresando...' : 'Continuar'}
                </button>
            </form>
        </div>
    );
}
