
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { ArrowLeft, Check, X, RotateCcw, FileText, Clock, User } from 'lucide-react';

interface ProtocolDetail {
    _id: string;
    protocolNumber: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    workflowId: { name: string };
    currentStageId?: { _id: string, name: string, slaHours: number, responsibleSectorId: string };
    requesterId: { name: string, email: string };
    files: any[];
    history: any[];
}

export default function ProtocolDetailPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [protocol, setProtocol] = useState<ProtocolDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchProtocol = async () => {
            try {
                const res = await axios.get(`/api/protocols/${params.id}`);
                setProtocol(res.data);
            } catch (error) {
                console.error(error);
                // router.push('/dashboard/protocols');
            } finally {
                setLoading(false);
            }
        };

        if (session) fetchProtocol();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, params.id]);

    const handleTransition = async (action: 'approve' | 'reject' | 'return') => {
        if (!confirm(`Tem certeza que deseja ${action === 'approve' ? 'APROVAR' : action === 'reject' ? 'REJEITAR' : 'DEVOLVER'} este protocolo?`)) return;

        setActionLoading(true);
        try {
            await axios.post(`/api/protocols/${params.id}/transition`, {
                action,
                notes
            });
            router.refresh();
            window.location.reload(); // Quick refresh to show new state
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao processar ação');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando detalhes...</div>;
    if (!protocol) return <div className="p-8 text-center block">Protocolo não encontrado.</div>;

    // Determine if user can act
    const canAct = protocol.status === 'pending' || protocol.status === 'in_progress';

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <button onClick={() => router.back()} className="flex items-center text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </button>

            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Protocolo {protocol.protocolNumber}</h1>
                        <p className="text-sm text-gray-500 mt-1">Aberto em {format(new Date(protocol.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${protocol.status === 'completed' ? 'bg-green-100 text-green-800' :
                            protocol.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                        }`}>
                        {protocol.status.toUpperCase()}
                    </span>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Assunto</h3>
                        <p className="mt-1 text-lg text-gray-900">{protocol.subject}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Solicitante</h3>
                        <div className="mt-1 flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">{protocol.requesterId.name}</span>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
                        <div className="mt-1 text-gray-700 whitespace-pre-wrap p-4 bg-gray-50 rounded-md">
                            {protocol.description || 'Sem descrição.'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Workflow Status */}
            {protocol.currentStageId && (
                <div className="bg-white shadow rounded-lg p-6 border-l-4 border-indigo-500">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Etapa Atual</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xl font-bold text-indigo-600">{protocol.currentStageId.name}</p>
                            <p className="text-sm text-gray-500 mt-1">SLA estimado: {protocol.currentStageId.slaHours} horas</p>
                        </div>
                        <Clock className="h-8 w-8 text-indigo-200" />
                    </div>

                    {canAct && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Parecer / Observações</label>
                            <textarea
                                className="w-full shadow-sm rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                rows={3}
                                placeholder="Digite seu parecer..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => handleTransition('approve')}
                                    disabled={actionLoading}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                >
                                    <Check className="mr-2 h-4 w-4" /> Aprovar / Próxima
                                </button>
                                <button
                                    onClick={() => handleTransition('return')}
                                    disabled={actionLoading}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" /> Devolver / Correção
                                </button>
                                <button
                                    onClick={() => handleTransition('reject')}
                                    disabled={actionLoading}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                >
                                    <X className="mr-2 h-4 w-4" /> Rejeitar / Arquivar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Timeline */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Histórico de Tramitação</h2>
                <div className="flow-root">
                    <ul className="-mb-8">
                        {protocol.history.map((event, eventIdx) => (
                            <li key={event._id}>
                                <div className="relative pb-8">
                                    {eventIdx !== protocol.history.length - 1 ? (
                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                    ) : null}
                                    <div className="relative flex space-x-3">
                                        <div>
                                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${event.status === 'approved' ? 'bg-green-500' :
                                                    event.status === 'rejected' ? 'bg-red-500' :
                                                        event.status === 'returned' ? 'bg-yellow-500' :
                                                            'bg-gray-400'
                                                }`}>
                                                <FileText className="h-5 w-5 text-white" aria-hidden="true" />
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    <span className="font-medium text-gray-900">{event.stageId?.name}</span>
                                                    {' - '}{event.sectorId?.name}
                                                </p>
                                                {event.notes && (
                                                    <p className="mt-1 text-sm text-gray-700 italic">"{event.notes}"</p>
                                                )}
                                                {event.responsibleUserId && (
                                                    <p className="mt-1 text-xs text-gray-400">Por: {event.responsibleUserId.name}</p>
                                                )}
                                            </div>
                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                <time dateTime={event.startDate}>{format(new Date(event.startDate), "dd/MM/yy HH:mm", { locale: ptBR })}</time>
                                                <div className="text-xs font-semibold mt-1 uppercase text-gray-400">{event.status}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
