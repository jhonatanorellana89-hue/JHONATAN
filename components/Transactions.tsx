import React, { useState, useMemo, FC } from 'react';
import { AppDataHook, Transaction } from '../types';
import { fmtMoney, parseDateDDMMYYYY, dateToDDMMYYYY } from '../utils/helpers';
import { PlusIcon, EditIcon, DeleteIcon, ArrowRightLeftIcon } from './ui/Icons';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toast';

export const TransferModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    appData: AppDataHook;
}> = ({ isOpen, onClose, appData }) => {
    const [transferData, setTransferData] = useState({
        amount: 0,
        fromCuentaId: '',
        toCuentaId: '',
        dateStr: dateToDDMMYYYY(new Date()),
        description: 'Transferencia entre cuentas'
    });
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { amount, fromCuentaId, toCuentaId } = transferData;
        if (amount <= 0 || !fromCuentaId || !toCuentaId || fromCuentaId === toCuentaId) {
            showToast('Datos de transferencia inválidos.', 'error');
            return;
        }
        await appData.addTransfer(transferData);
        onClose();
        // Reset form
        setTransferData({ amount: 0, fromCuentaId: '', toCuentaId: '', dateStr: dateToDDMMYYYY(new Date()), description: 'Transferencia entre cuentas' });
    };

    if (!isOpen) return null;

    return (
        <Modal title="Nueva Transferencia" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-sm text-muted">Monto a Transferir</label>
                        <input type="number" step="0.01" value={transferData.amount || ''} onChange={e => setTransferData({...transferData, amount: parseFloat(e.target.value)})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm text-muted">Desde Cuenta</label>
                        <select value={transferData.fromCuentaId} onChange={e => setTransferData({...transferData, fromCuentaId: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md">
                            <option value="">-- Origen --</option>
                            {appData.data.cuentas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-muted">Hacia Cuenta</label>
                        <select value={transferData.toCuentaId} onChange={e => setTransferData({...transferData, toCuentaId: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md">
                            <option value="">-- Destino --</option>
                            {appData.data.cuentas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm text-muted">Descripción</label>
                        <input type="text" value={transferData.description} onChange={e => setTransferData({...transferData, description: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-card font-semibold">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-2 text-white font-bold">Confirmar Transferencia</button>
                </div>
            </form>
        </Modal>
    );
}


const TransactionRow: React.FC<{ tx: Transaction, appData: AppDataHook, onEdit: (tx: Transaction) => void }> = ({ tx, appData, onEdit }) => {
    const cuenta = appData.data.cuentas.find(c => c.id === tx.cuentaId);
    const toCuenta = tx.toCuentaId ? appData.data.cuentas.find(c => c.id === tx.toCuentaId) : null;
    const category = appData.data.categories.find(c => c.id === tx.categoryId);

    const handleDelete = () => {
        appData.requestConfirmation(
            'Confirmar Eliminación',
            () => appData.deleteTransaction(tx.id)
        );
    };

    if (tx.type === 'Transferencia') {
        return (
            <tr className="border-b border-border-subtle hover:bg-glass transition-colors">
                <td className="p-3 text-sm">{tx.dateStr}</td>
                <td className="p-3 text-sm hidden sm:table-cell">{tx.description}</td>
                <td className="p-3 text-sm text-muted hidden md:table-cell">
                    <div className="flex items-center gap-2">
                        <ArrowRightLeftIcon />
                        <span>{cuenta?.name} → {toCuenta?.name}</span>
                    </div>
                </td>
                <td className="p-3 text-sm text-muted">N/A</td>
                <td className="p-3 text-sm text-right font-semibold font-mono text-muted">{fmtMoney(tx.amount)}</td>
                <td className="p-3">
                    <div className="flex justify-end gap-2">
                        <button onClick={handleDelete} className="text-muted hover:text-danger"><DeleteIcon /></button>
                    </div>
                </td>
            </tr>
        )
    }

    return (
        <tr className="border-b border-border-subtle hover:bg-glass transition-colors">
            <td className="p-3 text-sm">
                <div>{tx.dateStr}</div>
                <div className="text-xs text-muted sm:hidden">{tx.description}</div>
            </td>
            <td className="p-3 text-sm hidden sm:table-cell">{tx.description}</td>
            <td className="p-3 text-sm hidden md:table-cell">{cuenta?.name || '-'}</td>
            <td className="p-3 text-sm">{category?.name || '-'}</td>
            <td className={`p-3 text-sm text-right font-semibold font-mono ${tx.type === 'Ingreso' ? 'text-growth' : 'text-danger'}`}>{fmtMoney(tx.amount)}</td>
            <td className="p-3">
                <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(tx)} className="text-muted hover:text-info"><EditIcon /></button>
                    <button onClick={handleDelete} className="text-muted hover:text-danger"><DeleteIcon /></button>
                </div>
            </td>
        </tr>
    );
};

export const TransactionModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    appData: AppDataHook;
    existingTx: Partial<Transaction> | null;
}> = ({ isOpen, onClose, appData, existingTx }) => {
    
    const getInitialTxState = (): Partial<Transaction> => {
        if (existingTx) {
            return { ...existingTx };
        }
        return { type: 'Egreso', dateStr: dateToDDMMYYYY(new Date()), incomeType: 'Activo' };
    };

    const [txData, setTxData] = useState<Partial<Transaction>>(getInitialTxState());
    const { showToast } = useToast();

    React.useEffect(() => {
        setTxData(getInitialTxState());
    }, [existingTx, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!txData.amount || txData.amount <= 0 || !txData.dateStr || !parseDateDDMMYYYY(txData.dateStr) || !txData.cuentaId) {
            showToast('Datos inválidos. La cuenta es obligatoria.', 'error');
            return;
        }
        if (txData.type === 'Ingreso' && !txData.incomeType) {
            showToast('Debe especificar si el ingreso es Activo o Pasivo.', 'error');
            return;
        }

        const finalTxData = txData.type === 'Egreso' ? { ...txData, incomeType: undefined } : txData;

        if (existingTx && 'id' in existingTx && existingTx.id) {
            await appData.updateTransaction(existingTx.id!, finalTxData);
        } else {
            await appData.addTransaction(finalTxData as any);
        }
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <Modal title={existingTx && 'id' in existingTx ? 'Editar Movimiento' : 'Nuevo Movimiento'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted">Tipo</label>
                        <select value={txData.type} onChange={e => setTxData({...txData, type: e.target.value as 'Ingreso' | 'Egreso'})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md">
                            <option>Egreso</option>
                            <option>Ingreso</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm text-muted">Monto</label>
                        <input type="number" step="0.01" value={txData.amount || ''} onChange={e => setTxData({...txData, amount: parseFloat(e.target.value)})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    {txData.type === 'Ingreso' && (
                        <div className="col-span-2">
                             <label className="text-sm text-muted">Tipo de Ingreso</label>
                            <select value={txData.incomeType} onChange={e => setTxData({...txData, incomeType: e.target.value as 'Activo' | 'Pasivo'})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md">
                                <option value="Activo">Activo (Sueldo, trabajo)</option>
                                <option value="Pasivo">Pasivo (de un Activo)</option>
                            </select>
                        </div>
                    )}
                     <div className="col-span-2">
                        <label className="text-sm text-muted">Descripción</label>
                        <input type="text" value={txData.description || ''} onChange={e => setTxData({...txData, description: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm text-muted">Desde/Hacia Cuenta</label>
                        <select value={txData.cuentaId || ''} onChange={e => setTxData({...txData, cuentaId: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md">
                            <option value="">-- Seleccionar --</option>
                            {appData.data.cuentas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-muted">Categoría</label>
                        <select value={txData.categoryId || ''} onChange={e => setTxData({...txData, categoryId: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md">
                            <option value="">-- Seleccionar --</option>
                            {appData.data.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-muted">Fecha (dd/mm/yyyy)</label>
                        <input type="text" value={txData.dateStr || ''} onChange={e => setTxData({...txData, dateStr: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                     <div>
                        <label className="text-sm text-muted">Vincular a Venture</label>
                        <select value={txData.ventureId || ''} onChange={e => setTxData({...txData, ventureId: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md">
                            <option value="">-- Ninguno --</option>
                            {appData.data.ventures.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-card font-semibold">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-teal text-white font-bold">Guardar</button>
                </div>
            </form>
        </Modal>
    );
};

export const Transactions: React.FC<{ appData: AppDataHook }> = ({ appData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [cuentaFilter, setCuentaFilter] = useState('');

    const openModal = (tx: Transaction | null = null) => {
        setEditingTx(tx);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTx(null);
    };

    const filteredTransactions = useMemo(() => {
        return appData.data.transactions
            .filter(tx => {
                if (cuentaFilter && tx.cuentaId !== cuentaFilter) return false;
                if (searchTerm) {
                    const category = appData.data.categories.find(c => c.id === tx.categoryId);
                    const search = searchTerm.toLowerCase();
                    return tx.description.toLowerCase().includes(search) || category?.name.toLowerCase().includes(search);
                }
                return true;
            })
            .sort((a, b) => (parseDateDDMMYYYY(b.dateStr)?.getTime() || 0) - (parseDateDDMMYYYY(a.dateStr)?.getTime() || 0));
    }, [appData.data.transactions, appData.data.categories, cuentaFilter, searchTerm]);

    return (
        <div className="space-y-4">
            <TransactionModal isOpen={isModalOpen} onClose={closeModal} appData={appData} existingTx={editingTx} />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-primary">Libro de Transacciones</h1>
                    <p className="text-muted">El registro detallado de cada movimiento.</p>
                </div>
                <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-teal text-white font-bold text-sm shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-shadow">
                    <PlusIcon /> Registrar
                </button>
            </div>
            <div className="glass-card rounded-xl p-4 shadow-lg">
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input type="text" placeholder="Buscar por descripción o categoría..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-grow p-2 bg-panel border border-border rounded-md text-sm" />
                    <select value={cuentaFilter} onChange={e => setCuentaFilter(e.target.value)} className="p-2 bg-panel border border-border rounded-md text-sm">
                        <option value="">Todas las Cuentas</option>
                        {appData.data.cuentas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto -mx-4">
                    <table className="w-full">
                        <thead className="text-left text-xs text-muted">
                            <tr>
                                <th className="p-3 font-semibold">Fecha</th>
                                <th className="p-3 font-semibold hidden sm:table-cell">Descripción</th>
                                <th className="p-3 font-semibold hidden md:table-cell">Cuenta</th>
                                <th className="p-3 font-semibold">Categoría</th>
                                <th className="p-3 font-semibold text-right">Monto</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(tx => (
                                <TransactionRow key={tx.id} tx={tx} appData={appData} onEdit={() => openModal(tx)} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};