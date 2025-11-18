

import React, { useState } from 'react';
import { AppDataHook, Transaction } from '../types';
import { SparklesIcon, PlusIcon, VentureIcon, ArrowRightLeftIcon } from './ui/Icons';
import { useToast } from './ui/Toast';
import { parseTransaction } from '../services/geminiService';
import { TransactionModal } from './Transactions';
import { dateToDDMMYYYY } from '../utils/helpers';
import { View } from '../App';

export const AccionesRapidas: React.FC<{ appData: AppDataHook, setView: (view: View) => void, openTransferModal: () => void }> = ({ appData, setView, openTransferModal }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [parsedTx, setParsedTx] = useState<Partial<Transaction> | null>(null);
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);

    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        try {
            const parsed = await parseTransaction(input, appData.data.categories);
            
            const defaultCuenta = appData.data.cuentas.length > 0 ? appData.data.cuentas[0].id : null;
            
            setParsedTx({
                amount: parsed.amount,
                description: parsed.description,
                type: parsed.type,
                categoryId: parsed.categoryId,
                dateStr: dateToDDMMYYYY(new Date()),
                cuentaId: defaultCuenta
            });
            setIsTxModalOpen(true);

        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Error de IA', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleManualAdd = (type: 'Ingreso' | 'Egreso') => {
        setParsedTx({ type, dateStr: dateToDDMMYYYY(new Date()) });
        setIsTxModalOpen(true);
    };

    return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
            {isTxModalOpen && (
                <TransactionModal 
                    isOpen={isTxModalOpen}
                    onClose={() => {
                        setIsTxModalOpen(false);
                        setParsedTx(null);
                        setInput('');
                    }}
                    appData={appData}
                    existingTx={parsedTx}
                />
            )}
            <h3 className="text-base font-bold mb-3">Acciones Rápidas</h3>
            <form onSubmit={handleSubmit} className="space-y-2">
                 <div className="relative">
                    <input
                        id="ai-input"
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Usar IA: café de 15 soles..."
                        className="w-full p-2 pl-8 bg-panel border border-border rounded-md text-sm"
                        disabled={isLoading}
                    />
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted">
                        <SparklesIcon />
                    </div>
                </div>
                 <button type="submit" className="w-full px-4 py-2 rounded-lg bg-accent text-white font-bold text-sm shadow-md disabled:opacity-50" disabled={isLoading}>
                        {isLoading ? 'Procesando...' : 'Registrar con IA'}
                </button>
            </form>
             <div className="grid grid-cols-2 gap-2 mt-3">
                 <button onClick={() => handleManualAdd('Ingreso')} className="flex items-center justify-center gap-2 text-center bg-growth/20 text-growth font-bold py-2 px-3 rounded-md text-sm">
                    <PlusIcon /> Ingreso
                </button>
                <button onClick={() => handleManualAdd('Egreso')} className="flex items-center justify-center gap-2 text-center bg-danger/20 text-danger font-bold py-2 px-3 rounded-md text-sm">
                    <PlusIcon /> Egreso
                </button>
            </div>
             <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={openTransferModal} className="flex items-center justify-center gap-2 text-center bg-info/20 text-info font-bold py-2 px-3 rounded-md text-sm">
                    <ArrowRightLeftIcon /> Transferencia
                </button>
                 <button onClick={() => setView('ventures')} className="flex items-center justify-center gap-2 text-center bg-warning/20 text-warning font-bold py-2 px-3 rounded-md text-sm">
                    <VentureIcon /> Venture
                </button>
            </div>
        </div>
    );
};