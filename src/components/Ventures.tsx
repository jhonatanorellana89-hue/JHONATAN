import React, { useState, useMemo } from 'react';
import { AppDataHook, Venture } from '../types';
import { fmtMoney } from '../utils/helpers';
import { PlusIcon, EditIcon, DeleteIcon, VentureIcon } from './ui/Icons';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toast';

const VentureModal: React.FC<{ isOpen: boolean; onClose: () => void; appData: AppDataHook; existingVenture: Venture | null; }> = ({ isOpen, onClose, appData, existingVenture }) => {
    const [ventureData, setVentureData] = useState<Partial<Venture>>(existingVenture || { name: '', targetAmount: 10000 });
    const { showToast } = useToast();
    
    React.useEffect(() => {
        if (existingVenture) setVentureData(existingVenture);
        else setVentureData({ name: '', targetAmount: 10000 });
    }, [existingVenture, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ventureData.name || !ventureData.targetAmount || ventureData.targetAmount <= 0) {
            showToast('Datos inválidos.', 'error');
            return;
        }
        if (existingVenture) {
            await appData.updateVenture(existingVenture.id, ventureData);
        } else {
            await appData.addVenture(ventureData as any);
        }
        onClose();
    };
    
    if (!isOpen) return null;
    
    return (
        <Modal title={existingVenture ? 'Editar Venture' : 'Nuevo Venture de Inversión'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 gap-4">
                     <div>
                        <label className="text-sm text-muted">Nombre del Venture</label>
                        <input type="text" value={ventureData.name || ''} onChange={e => setVentureData({...ventureData, name: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm text-muted">Capital Requerido (Costo)</label>
                        <input type="number" step="100" value={ventureData.targetAmount || 10000} onChange={e => setVentureData({...ventureData, targetAmount: parseInt(e.target.value)})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                </div>
                 <div className="flex justify-end items-center gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-card font-semibold">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-2 text-white font-bold">Guardar Venture</button>
                </div>
            </form>
        </Modal>
    );
};

const VentureCard: React.FC<{ venture: Venture, appData: AppDataHook, onEdit: () => void, onDelete: () => void }> = ({ venture, appData, onEdit, onDelete }) => {
    const { income, expense, netProfit, roi } = useMemo(() => {
        const ventureTxs = appData.data.transactions.filter(t => t.ventureId === venture.id);
        const income = ventureTxs.filter(t => t.type === 'Ingreso').reduce((sum, t) => sum + t.amount, 0);
        const expense = ventureTxs.filter(t => t.type === 'Egreso' && t.categoryId !== 'c_5').reduce((sum, t) => sum + t.amount, 0);
        const netProfit = income - expense;
        const totalInvestment = venture.currentAmount;
        const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
        return { income, expense, netProfit, roi };
    }, [appData.data.transactions, venture.id, venture.currentAmount]);

    const progress = Math.min((venture.currentAmount / venture.targetAmount) * 100, 100);

    return (
        <div className="glass-card p-4 rounded-xl shadow-lg space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-base flex items-center gap-2"><VentureIcon /> {venture.name}</p>
                    <p className="text-sm text-muted mt-1">Capital Requerido: {fmtMoney(venture.targetAmount)}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onEdit} className="text-muted hover:text-info"><EditIcon /></button>
                    <button onClick={onDelete} className="text-muted hover:text-danger"><DeleteIcon /></button>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-bold text-primary">Capital Aportado: {fmtMoney(venture.currentAmount)}</span>
                    <span className="text-xs font-mono text-muted">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2.5 border border-border-subtle">
                    <div className="bg-gradient-to-r from-accent-2 to-accent h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            
            <div className="border-t border-border-subtle pt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                    <p className="text-xs text-muted font-bold">Ingresos</p>
                    <p className="font-mono text-sm font-semibold text-growth">{fmtMoney(income)}</p>
                </div>
                 <div>
                    <p className="text-xs text-muted font-bold">Gastos/Op.</p>
                    <p className="font-mono text-sm font-semibold text-danger">{fmtMoney(expense)}</p>
                </div>
                <div>
                    <p className="text-xs text-muted font-bold">Profit/Loss</p>
                    <p className={`font-mono text-sm font-bold ${netProfit >= 0 ? 'text-growth' : 'text-danger'}`}>{fmtMoney(netProfit)}</p>
                </div>
            </div>
        </div>
    );
};

export const Ventures: React.FC<{ appData: AppDataHook }> = ({ appData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVenture, setEditingVenture] = useState<Venture | null>(null);

    const openModal = (venture: Venture | null = null) => {
        setEditingVenture(venture);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        appData.requestConfirmation(
            'Eliminar Venture',
            () => appData.deleteVenture(id)
        );
    };

    return (
        <div className="space-y-4">
            <VentureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} appData={appData} existingVenture={editingVenture} />
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-2xl font-extrabold text-primary">Ventures</h1>
                    <p className="text-muted">Tus proyectos de inversión y su estado de resultados (P&L).</p>
                </div>
                <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-2 text-white font-bold text-sm shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-shadow">
                    <PlusIcon /> Nuevo Venture
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {appData.data.ventures.map(v => (
                    <VentureCard key={v.id} venture={v} appData={appData} onEdit={() => openModal(v)} onDelete={() => handleDelete(v.id)} />
                ))}
            </div>
        </div>
    );
};
