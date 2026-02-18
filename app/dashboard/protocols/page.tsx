
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Plus, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Protocol {
    _id: string;
    protocolNumber: string;
    subject: string;
    status: string;
    currentStageId: { name: string } | null;
    createdAt: string;
    workflowId: { name: string };
}

export default function ProtocolsPage() {
    const { data: session } = useSession();
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProtocols = async () => {
            try {
                const res = await fetch('/api/protocols');
                if (res.ok) {
                    const data = await res.json();
                    setProtocols(data);
                }
            } catch (error) {
                console.error('Failed to fetch protocols', error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchProtocols();
        }
    }, [session]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Meus Protocolos</h1>
                <Link
                    href="/protocols/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Protocolo
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Buscar por número, assunto..."
                    />
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <Filter className="mr-2 h-4 w-4 text-gray-500" />
                    Filtrar
                </button>
            </div>

            {/* List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {loading ? (
                        <li className="p-4 text-center text-gray-500">Carregando...</li>
                    ) : protocols.length === 0 ? (
                        <li className="p-4 text-center text-gray-500">Nenhum protocolo encontrado.</li>
                    ) : (
                        protocols.map((protocol) => (
                            <li key={protocol._id}>
                                <Link href={`/protocols/${protocol._id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                {protocol.protocolNumber}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${protocol.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        protocol.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {protocol.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {protocol.subject}
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    Fluxo: {protocol.workflowId?.name}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>
                                                    Criado em <time dateTime={protocol.createdAt}>{format(new Date(protocol.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</time>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    Etapa Atual: <span className="font-semibold ml-1">{protocol.currentStageId?.name || 'Finalizado'}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
