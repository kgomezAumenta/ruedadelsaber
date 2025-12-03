'use client';

import { useEffect, useState } from 'react';
import { Users, Target, CheckCircle, TrendingUp, Clock } from 'lucide-react';

interface DashboardStats {
    totalUsers: number;
    totalParticipations: number;
    successRate: number;
}

interface RecentActivity {
    id: number;
    usuario: string;
    pais: string;
    aciertos: number;
    gano: boolean;
    fecha_hora: string;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/admin/dashboard');
            const data = await res.json();
            setStats(data.stats);
            setRecentActivity(data.recentActivity);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Hace un momento';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Hace ${diffHours} h`;
        const diffDays = Math.floor(diffHours / 24);
        return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500 mt-2">Resumen general de la plataforma</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-10 h-10 opacity-80" />
                        <TrendingUp className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Usuarios Totales</p>
                    <p className="text-4xl font-bold">{stats?.totalUsers || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <Target className="w-10 h-10 opacity-80" />
                        <TrendingUp className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="text-green-100 text-sm font-medium mb-1">Partidas Jugadas</p>
                    <p className="text-4xl font-bold">{stats?.totalParticipations || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <CheckCircle className="w-10 h-10 opacity-80" />
                        <TrendingUp className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Tasa de Éxito</p>
                    <p className="text-4xl font-bold">{stats?.successRate || 0}%</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-bold text-gray-800">Actividad Reciente</h2>
                </div>

                {recentActivity.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
                ) : (
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.gano ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {activity.gano ? '🏆' : '🎯'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{activity.usuario}</p>
                                        <p className="text-sm text-gray-500">
                                            {activity.gano ? 'Ganó' : 'Jugó'} en {activity.pais} • {activity.aciertos}/3 aciertos
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400">{getTimeAgo(activity.fecha_hora)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
