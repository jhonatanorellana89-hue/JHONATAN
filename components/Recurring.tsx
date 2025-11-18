import React, { useState, useEffect } from 'react';
import { AppDataHook, RecurringExpense } from '../types';
import { fmtMoney } from '../utils/helpers';
import { PlusIcon, EditIcon, DeleteIcon, RepeatIcon } from './ui/Icons';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toast';

const RecurringExpenseModal: React.FC<{ isOpen: boolean; onClose: () => void; appData: AppDataHook; existingExpense: RecurringExpense | null; }> = ({ isOpen, onClose, appData, existingExpense }) => {
    const [expenseData, setExpenseData] = useState<Partial<RecurringExpense>>(existingExpense || { name: '', amount: 0 });
    const { showToast } = useToast();

    useEffect(() => {
        if (existingExpense) setExpenseData(existingExpense);
        else setExpenseData({ name: '', amount: 0 });
    }, [existingExpense, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!expenseData.name || !expenseData.amount || expenseData.amount <= 0 || !expenseData.cuentaId) {
            showToast('Datos inválidos. La cuenta es obligatoria.', 'error');
            return;
        }
        if (existingExpense) {
            await appData.updateRecurringExpense(existingExpense.id, expenseData);
        } else {
            await appData.addRecurringExpense(expenseData as any);
        }
        onClose();
    };

    if (!isOpen) return null;
    
    return (
        <Modal title={existingExpense ? 'Editar Gasto Recurrente' : 'Nuevo Gasto Recurrente'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 gap-4">
                     <div>
                        <label className="text-sm text-muted">Nombre</label>
                        <input type="text" value={expenseData.name || ''} onChange={e => setExpenseData({...expenseData, name: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm text-muted">Monto Mensual</label>
                        <input type="number" step="0.01" value={expenseData.amount || 0} onChange={e => setExpenseData({...expenseData, amount: parseFloat(e.target.value)})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm text-muted">Categoría</label>
                         <select value={expenseData.categoryId || ''} onChange={e => setExpenseData({...expenseData, categoryId: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md">
                            <option value="">-- Seleccionar --</option>
                            {appData.data.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm text-muted">Pagar desde Cuenta</label>
                        <select value={expenseData.cuentaId || ''} onChange={e => setExpenseData({...expenseData, cuentaId: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md">
                            <option value="">-- Seleccionar --</option>
                            {appData.data.cuentas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-card font-semibold">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-2 text-white font-bold">Guardar</button>
                </div>
            </form>
        </Modal>
    );
};

export const Recurring: React.FC<{ appData: AppDataHook }> = ({ appData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const openModal = (expense: RecurringExpense | null = null) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        await appData.generateRecurringTransactions();
        setIsGenerating(false);
    }

    const handleDelete = (id: string) => {
        appData.requestConfirmation(
            'Eliminar Gasto Recurrente',
            () => appData.deleteRecurringExpense(id)
        );
    };

    return (
        <div className="space-y-4">
            <RecurringExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} appData={appData} existingExpense={editingExpense} />
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-2xl font-extrabold text-primary">Gastos Recurrentes</h1>
                    <p className="text-muted">Automatiza tus gastos fijos mensuales.</p>
                </div>
                <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-2 text-white font-bold text-sm shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-shadow">
                    <PlusIcon /> Nuevo
                </button>
            </div>

            <div className="glass-card rounded-xl p-4 shadow-lg">
                <button onClick={handleGenerate} disabled={isGenerating} className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-info/10 text-info font-bold text-sm shadow-md hover:bg-info/20 border border-info/20 transition-colors disabled:opacity-50">
                    <RepeatIcon /> {isGenerating ? 'Generando...' : 'Generar Gastos de Este Mes'}
                </button>
                <div className="space-y-2">
                    {appData.data.recurringExpenses.map(exp => (
                        <div key={exp.id} className="glass-card p-3 rounded-lg flex justify-between items-center transition-all hover:bg-glass">
                            <div>
                                <p className="font-bold">{exp.name}</p>
                                <p className="text-sm text-muted">
                                    {appData.data.categories.find(c => c.id === exp.categoryId)?.name || 'Sin categoría'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                               <p className="font-mono font-semibold text-danger">{fmtMoney(exp.amount)}</p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openModal(exp)} className="text-muted hover:text-accent-2"><EditIcon /></button>
                                    <button onClick={() => handleDelete(exp.id)} className="text-muted hover:text-danger"><DeleteIcon /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};