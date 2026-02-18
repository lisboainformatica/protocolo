
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        urgent: 0
    });

    // Mock fetching fetching stats
    useEffect(() => {
        // In real app, fetch from /api/dashboard/stats
        setStats({
            total: 125,
            pending: 45,
            completed: 80,
            urgent: 5
        });
    }, []);

    const data = [
        { name: 'Seg', protocolos: 12 },
        { name: 'Ter', protocolos: 19 },
        { name: 'Qua', protocolos: 15 },
        { name: 'Qui', protocolos: 22 },
        { name: 'Sex', protocolos: 28 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <span className="text-sm text-gray-500">Bem-vindo, {session?.user?.name}</span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card title="Total Protocolos" value={stats.total} icon={FileText} color="bg-blue-500" />
                <Card title="Em Análise" value={stats.pending} icon={Clock} color="bg-yellow-500" />
                <Card title="Concluídos" value={stats.completed} icon={CheckCircle} color="bg-green-500" />
                <Card title="Urgentes" value={stats.urgent} icon={AlertTriangle} color="bg-red-500" />
            </div>

            {/* Charts area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium mb-4">Volume de Protocolos (Semanal)</h3>
                    <div className="h-64 cursor-default">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="protocolos" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium mb-4">Atividades Recentes</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                                <span className="font-medium text-gray-700">Protocolo 2024-{100 + i}</span>
                                <span className="ml-auto text-gray-500 text-xs">Há {i} horas</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <div className={`p-4 rounded-full ${color} bg-opacity-10 mr-4`}>
                <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    )
}
