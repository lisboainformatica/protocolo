
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Plus, Settings, Eye } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

interface Workflow {
    _id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
}

export default function WorkflowsPage() {
    const { data: session } = useSession();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const res = await axios.get('/api/admin/workflows');
                setWorkflows(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (session) fetchWorkflows();
    }, [session]);

    if (!session?.user?.roles?.includes('administrador') && !session?.user?.roles?.includes('gestor')) {
        return <div className="p-8">Acesso não autorizado.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Gerenciar Workflows</h1>
                {/* For MVP we might not have the create UI fully built, but let's put the button */}
                <button
                    onClick={() => alert('Funcionalidade de criação em desenvolvimento. Use o seed data por enquanto.')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Workflow
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {loading ? (
                        <li className="p-4 text-center text-gray-500">Carregando...</li>
                    ) : workflows.length === 0 ? (
                        <li className="p-4 text-center text-gray-500">Nenhum workflow encontrado.</li>
                    ) : (
                        workflows.map((wf) => (
                            <li key={wf._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center">
                                        <p className="text-sm font-medium text-indigo-600 truncate">{wf.name}</p>
                                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${wf.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {wf.isActive ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                {wf.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <Eye className="h-5 w-5" />
                                    </button>
                                    <button className="text-gray-400 hover:text-indigo-600">
                                        <Settings className="h-5 w-5" />
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
