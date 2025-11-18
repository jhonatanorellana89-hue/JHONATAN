import React, { useState, useEffect } from 'react';
import { AppDataHook, Category } from '../types';
import { fmtMoney } from '../utils/helpers';
import { PlusIcon, EditIcon, DeleteIcon } from './ui/Icons';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toast';

const CategoryModal: React.FC<{ isOpen: boolean; onClose: () => void; appData: AppDataHook; existingCategory: Category | null; }> = ({ isOpen, onClose, appData, existingCategory }) => {
    const [categoryData, setCategoryData] = useState<Partial<Category>>(existingCategory || { name: '', limitMonthly: 0 });
    const { showToast } = useToast();

    useEffect(() => {
        if (existingCategory) setCategoryData(existingCategory);
        else setCategoryData({ name: '', limitMonthly: 0 });
    }, [existingCategory, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryData.name) {
            showToast('El nombre es requerido.', 'error');
            return;
        }
        if (existingCategory) {
            await appData.updateCategory(existingCategory.id, categoryData);
        } else {
            await appData.addCategory(categoryData as any);
        }
        onClose();
    };

    if (!isOpen) return null;
    
    return (
        <Modal title={existingCategory ? 'Editar Categoría' : 'Nueva Categoría'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 gap-4">
                     <div>
                        <label className="text-sm text-muted">Nombre</label>
                        <input type="text" value={categoryData.name || ''} onChange={e => setCategoryData({...categoryData, name: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm text-muted">Límite Mensual (0 = sin límite)</label>
                        <input type="number" step="1" value={categoryData.limitMonthly || 0} onChange={e => setCategoryData({...categoryData, limitMonthly: parseInt(e.target.value)})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
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

export const Categories: React.FC<{ appData: AppDataHook }> = ({ appData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const openModal = (category: Category | null = null) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        appData.requestConfirmation(
            'Eliminar Categoría',
            () => appData.deleteCategory(id)
        );
    };

    return (
        <div className="space-y-4">
            <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} appData={appData} existingCategory={editingCategory} />
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-2xl font-extrabold text-primary">Categorías</h1>
                    <p className="text-muted">Organiza y controla tus flujos de dinero.</p>
                </div>
                <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-2 text-white font-bold text-sm shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-shadow">
                    <PlusIcon /> Nueva
                </button>
            </div>

            <div className="glass-card rounded-xl p-4 shadow-lg">
                <div className="space-y-2">
                    {appData.data.categories.map(cat => (
                        <div key={cat.id} className="glass-card p-3 rounded-lg flex justify-between items-center transition-all hover:bg-glass">
                            <div>
                                <p className="font-bold">{cat.name}</p>
                                <p className="text-sm text-muted">{cat.limitMonthly > 0 ? `Límite: ${fmtMoney(cat.limitMonthly)}` : 'Sin límite mensual'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => openModal(cat)} className="text-muted hover:text-accent-2"><EditIcon /></button>
                                <button onClick={() => handleDelete(cat.id)} className="text-muted hover:text-danger"><DeleteIcon /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};