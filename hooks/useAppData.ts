import { useState, useCallback, useMemo } from 'react';
import { AppData, SyncStatus, AppDataHook, Venture, Asset, Transaction, Debt, Category, RecurringExpense, Cuenta, EquityAsset } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { useToast } from '../components/ui/Toast';
import { dateToDDMMYYYY, parseDateDDMMYYYY } from '../utils/helpers';

const getInitialData = (): AppData => ({
  transactions: [
    { id: 't_1', type: 'Ingreso', incomeType: 'Activo', amount: 5000, description: 'Sueldo - Empresa X', dateStr: '01/07/2024', cuentaId: 'cta_1', categoryId: 'c_1', createdAt: new Date(2024, 6, 1).toISOString() },
    { id: 't_2', type: 'Egreso', amount: 1500, description: 'Alquiler Vivienda', dateStr: '02/07/2024', cuentaId: 'cta_1', categoryId: 'c_2', isRecurring: true, createdAt: new Date(2024, 6, 2).toISOString() },
    { id: 't_3', type: 'Egreso', amount: 800, description: 'Alimentación y Supermercado', dateStr: '05/07/2024', cuentaId: 'cta_1', categoryId: 'c_3', createdAt: new Date(2024, 6, 5).toISOString() },
    { id: 't_4', type: 'Ingreso', incomeType: 'Pasivo', amount: 450, description: 'Dividendos Acciones AAPL', dateStr: '10/07/2024', cuentaId: 'cta_1', categoryId: 'c_4', createdAt: new Date(2024, 6, 10).toISOString() },
    { id: 't_5', type: 'Egreso', amount: 1200, description: 'Pago Préstamo', dateStr: '15/07/2024', cuentaId: 'cta_1', categoryId: 'c_5', debtId: 'd_1', createdAt: new Date(2024, 6, 15).toISOString() },
    { id: 't_6', type: 'Egreso', amount: 500, description: 'Aporte a Venture E-commerce', dateStr: '18/07/2024', cuentaId: 'cta_1', categoryId: 'c_5', ventureId: 'v_1', createdAt: new Date(2024, 6, 18).toISOString() }
  ],
  cuentas: [
      { id: 'cta_1', name: 'Cuenta Principal', type: 'Cuenta Bancaria', balance: 1450, currency: 'PEN', createdAt: new Date().toISOString() },
      { id: 'cta_2', name: 'Efectivo', type: 'Billetera', balance: 200, currency: 'PEN', createdAt: new Date().toISOString() },
  ],
  assets: [
    { id: 'a_2', name: 'Portafolio de Acciones', type: 'Inversiones', balance: 25000, passiveIncome: 450, currency: 'PEN', createdAt: new Date().toISOString() }
  ],
  equityAssets: [
    { id: 'ea_1', name: 'Casa Principal', type: 'Bienes Raíces', value: 250000, createdAt: new Date().toISOString() },
    { id: 'ea_2', name: 'Vehículo Familiar', type: 'Vehículo', value: 30000, createdAt: new Date().toISOString() }
  ],
  debts: [
    { id: 'd_1', name: 'Préstamo Vehicular', outstanding: 15000, monthlyPayment: 1200, interest: 8, equityAssetId: 'ea_2', createdAt: new Date().toISOString() },
    { id: 'd_2', name: 'Hipoteca', outstanding: 180000, monthlyPayment: 2500, interest: 6, equityAssetId: 'ea_1', createdAt: new Date().toISOString() }
  ],
  categories: [
    { id: 'c_1', name: 'Sueldo', limitMonthly: 0, createdAt: new Date().toISOString() },
    { id: 'c_2', name: 'Vivienda', limitMonthly: 1500, createdAt: new Date().toISOString() },
    { id: 'c_3', name: 'Alimentación', limitMonthly: 800, createdAt: new Date().toISOString() },
    { id: 'c_4', name: 'Ingresos Pasivos', limitMonthly: 0, createdAt: new Date().toISOString() },
    { id: 'c_5', name: 'Ahorro/Inversión', limitMonthly: 0, createdAt: new Date().toISOString() }
  ],
  ventures: [
    { id: 'v_1', name: 'Venture: E-commerce de Nicho', targetAmount: 20000, currentAmount: 8500, createdAt: new Date().toISOString() }
  ],
  recurringExpenses: [
    { id: 're_1', name: 'Hipoteca', amount: 2500, categoryId: 'c_2', cuentaId: 'cta_1', createdAt: new Date().toISOString() },
    { id: 're_2', name: 'Suscripción Software', amount: 50, categoryId: 'c_5', cuentaId: 'cta_1', createdAt: new Date().toISOString() }
  ],
  meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
});

type AppDataArrayKeys = {
    [K in keyof AppData]: AppData[K] extends any[] ? K : never;
}[keyof AppData];

export const useAppData = ({ requestConfirmation }: { requestConfirmation: (title: string, onConfirm: () => void) => void }): AppDataHook => {
  const { showToast } = useToast();
  const [data, setData] = useLocalStorage<AppData>('jo_wealth_command_v3', getInitialData());
  const [isCloudOn, setIsCloudOn] = useLocalStorage<boolean>('jo_cloud_mode_wc_v3', false);
  const [apiBase, setApiBase] = useLocalStorage<string>('jo_api_base_wc_v3', '');
  const [orgId, setOrgId] = useLocalStorage<string>('jo_org_id_wc_v3', '');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const checkForAchievements = (newData: AppData, oldData: AppData) => {
    const oldNetWorth = oldData ? (oldData.cuentas.reduce((s,c)=>s+c.balance,0) + oldData.assets.reduce((s,a)=>s+a.balance,0) + (oldData.equityAssets || []).reduce((s,ea)=>s+ea.value,0)) - oldData.debts.reduce((s,d)=>s+d.outstanding,0) : 0;
    const newNetWorth = (newData.cuentas.reduce((s,c)=>s+c.balance,0) + newData.assets.reduce((s,a)=>s+a.balance,0) + (newData.equityAssets || []).reduce((s,ea)=>s+ea.value,0)) - newData.debts.reduce((s,d)=>s+d.outstanding,0);

    if (oldNetWorth <= 0 && newNetWorth > 0) {
      showToast('¡Felicitaciones! Has alcanzado un Patrimonio Neto Positivo.', 'achievement');
    }

    const oldPassiveIncome = oldData ? oldData.assets.reduce((s,a)=>s+a.passiveIncome,0) : 0;
    const newPassiveIncome = newData.assets.reduce((s,a)=>s+a.passiveIncome,0);

    if (oldPassiveIncome < 100 && newPassiveIncome >= 100) {
      showToast('¡Hito Alcanzado! Generas tus primeros S/100 de Ingreso Pasivo.', 'achievement');
    }
    
    if (oldData && oldData.debts.length > newData.debts.length) {
        showToast('¡Excelente! Has eliminado una deuda. ¡Sigue así!', 'achievement');
    }
  };
  
  const wrappedSetData = (updater: React.SetStateAction<AppData>) => {
      setData(currentData => {
          const newData = typeof updater === 'function' ? updater(currentData) : updater;
          checkForAchievements(newData, currentData);
          return newData;
      });
  };

  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx = { ...tx, id: `t_${Date.now()}`, createdAt: new Date().toISOString() };
    
    wrappedSetData(prev => {
        const newData = { ...prev };
        newData.transactions = [newTx, ...newData.transactions];

        if(tx.cuentaId) {
            newData.cuentas = newData.cuentas.map(c => c.id === tx.cuentaId ? { ...c, balance: c.balance + (tx.type === 'Ingreso' ? tx.amount : -tx.amount) } : c);
        }
        if(tx.debtId && tx.type === 'Egreso') {
            newData.debts = newData.debts.map(d => d.id === tx.debtId ? { ...d, outstanding: Math.max(0, d.outstanding - tx.amount)} : d);
        }
        if(tx.ventureId && tx.type === 'Egreso' && (tx.categoryId === 'c_5' || !tx.categoryId)) {
            newData.ventures = newData.ventures.map(v => v.id === tx.ventureId ? { ...v, currentAmount: v.currentAmount + tx.amount } : v);
        }
        newData.meta = { ...newData.meta, updatedAt: new Date().toISOString() };
        return newData;
    });

    showToast('Transacción agregada', 'success');
  }, [wrappedSetData, showToast]);

    const addTransfer = useCallback(async (transfer: { amount: number, fromCuentaId: string, toCuentaId: string, dateStr: string, description: string }) => {
        const newTx: Transaction = {
            id: `t_${Date.now()}`,
            type: 'Transferencia',
            amount: transfer.amount,
            description: transfer.description,
            dateStr: transfer.dateStr,
            cuentaId: transfer.fromCuentaId,
            toCuentaId: transfer.toCuentaId,
            categoryId: null,
            createdAt: new Date().toISOString()
        };

        wrappedSetData(prev => {
            const newCuentas = prev.cuentas.map(c => {
                if (c.id === transfer.fromCuentaId) return { ...c, balance: c.balance - transfer.amount };
                if (c.id === transfer.toCuentaId) return { ...c, balance: c.balance + transfer.amount };
                return c;
            });

            return {
                ...prev,
                transactions: [newTx, ...prev.transactions],
                cuentas: newCuentas,
                meta: { ...prev.meta, updatedAt: new Date().toISOString() }
            };
        });
        showToast('Transferencia realizada', 'success');
    }, [wrappedSetData, showToast]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    wrappedSetData(prev => {
        const originalTx = prev.transactions.find(t => t.id === id);
        if (!originalTx) return prev;

        const updatedTx = { ...originalTx, ...updates };
        const newData = { ...prev };

        let tempCuentas = [...newData.cuentas];
        if (originalTx.cuentaId) {
            tempCuentas = tempCuentas.map(c => c.id === originalTx.cuentaId ? { ...c, balance: c.balance + (originalTx.type === 'Ingreso' ? -originalTx.amount : originalTx.amount) } : c);
        }
        
        let tempVentures = [...newData.ventures];
        if (originalTx.ventureId && originalTx.type === 'Egreso' && (originalTx.categoryId === 'c_5' || !originalTx.categoryId)) {
            tempVentures = tempVentures.map(v => v.id === originalTx.ventureId ? { ...v, currentAmount: v.currentAmount - originalTx.amount } : v);
        }

        if (updatedTx.cuentaId) {
            tempCuentas = tempCuentas.map(c => c.id === updatedTx.cuentaId ? { ...c, balance: c.balance + (updatedTx.type === 'Ingreso' ? updatedTx.amount : -updatedTx.amount) } : c);
        }

        if (updatedTx.ventureId && updatedTx.type === 'Egreso' && (updatedTx.categoryId === 'c_5' || !updatedTx.categoryId)) {
            tempVentures = tempVentures.map(v => v.id === updatedTx.ventureId ? { ...v, currentAmount: v.currentAmount + updatedTx.amount } : v);
        }

        newData.cuentas = tempCuentas;
        newData.ventures = tempVentures;

        newData.transactions = newData.transactions.map(t => t.id === id ? updatedTx : t);
        
        newData.meta = { ...newData.meta, updatedAt: new Date().toISOString() };
        return newData;
    });
    showToast('Transacción actualizada', 'success');
  }, [wrappedSetData, showToast]);

  const deleteTransaction = useCallback(async (id: string) => {
    wrappedSetData(prev => {
        const txToDelete = prev.transactions.find(t => t.id === id);
        if (!txToDelete) return prev;

        const newData = { ...prev };
        
        newData.transactions = newData.transactions.filter(tx => tx.id !== id);
        
        if (txToDelete.type === 'Transferencia') {
            newData.cuentas = newData.cuentas.map(c => {
                if (c.id === txToDelete.cuentaId) return { ...c, balance: c.balance + txToDelete.amount };
                if (c.id === txToDelete.toCuentaId) return { ...c, balance: c.balance - txToDelete.amount };
                return c;
            });
        } else {
             if(txToDelete.cuentaId) {
                newData.cuentas = newData.cuentas.map(c => c.id === txToDelete.cuentaId ? { ...c, balance: c.balance + (txToDelete.type === 'Ingreso' ? -txToDelete.amount : txToDelete.amount) } : c);
            }
        }

        if(txToDelete.ventureId && txToDelete.type === 'Egreso') {
            newData.ventures = newData.ventures.map(v => v.id === txToDelete.ventureId ? { ...v, currentAmount: Math.max(0, v.currentAmount - txToDelete.amount) } : v);
        }
        if(txToDelete.debtId && txToDelete.type === 'Egreso') {
            newData.debts = newData.debts.map(d => d.id === txToDelete.debtId ? { ...d, outstanding: d.outstanding + txToDelete.amount } : d);
        }

        newData.meta = { ...newData.meta, updatedAt: new Date().toISOString() };
        return newData;
    });
    showToast('Transacción eliminada');
  }, [wrappedSetData, showToast]);
  
  const addOperation = useCallback(async <T extends { id: string; createdAt: string }, K extends AppDataArrayKeys>(
    key: K,
    item: Omit<T, 'id' | 'createdAt'>,
    prefix: string,
    toastMessage: string
  ) => {
    wrappedSetData(prev => {
        const newItem = { ...item, id: `${prefix}_${Date.now()}`, createdAt: new Date().toISOString() } as T;
        const currentItems = prev[key] as unknown as T[];
        return {
            ...prev,
            [key]: [newItem, ...currentItems],
            meta: { ...prev.meta, updatedAt: new Date().toISOString() }
        };
    });
    showToast(toastMessage, 'success');
  }, [wrappedSetData, showToast]);

  const updateOperation = useCallback(async <T extends { id: string }, K extends AppDataArrayKeys>(
      key: K,
      id: string,
      updates: Partial<T>,
      toastMessage: string
  ) => {
      wrappedSetData(prev => {
          const currentItems = prev[key] as unknown as T[];
          return {
              ...prev,
              [key]: currentItems.map(item => item.id === id ? { ...item, ...updates } : item),
              meta: { ...prev.meta, updatedAt: new Date().toISOString() }
          };
      });
      showToast(toastMessage, 'success');
  }, [wrappedSetData, showToast]);

  const deleteOperation = useCallback(async <T extends { id: string }, K extends AppDataArrayKeys>(
      key: K,
      id: string,
      toastMessage: string,
      usageCheck?: (data: AppData, id: string) => string | null
  ) => {
      if (usageCheck) {
          const inUseMessage = usageCheck(data, id);
          if (inUseMessage) {
              showToast(inUseMessage, 'error');
              return;
          }
      }

      wrappedSetData(prev => {
          const currentItems = prev[key] as unknown as T[];
          const itemToDelete = currentItems.find(item => item.id === id);
          if (!itemToDelete) return prev;
          
          const nextState = {
            ...prev,
            [key]: currentItems.filter(item => item.id !== id),
            meta: { ...prev.meta, updatedAt: new Date().toISOString() }
          };

          return nextState;
      });
      showToast(toastMessage);
  }, [data, wrappedSetData, showToast]);

  const addCuenta = (c: Omit<Cuenta, 'id'|'createdAt'>) => addOperation('cuentas', c, 'cta', 'Cuenta agregada');
  const updateCuenta = (id: string, u: Partial<Cuenta>) => updateOperation('cuentas', id, u, 'Cuenta actualizada');
  const deleteCuenta = (id: string) => deleteOperation('cuentas', id, 'Cuenta eliminada', (d, i) => 
      d.transactions.some(t => t.cuentaId === i) || d.recurringExpenses.some(re => re.cuentaId === i)
          ? 'No se puede eliminar, está en uso.'
          : null
  );

  const addAsset = (a: Omit<Asset, 'id'|'createdAt'>) => addOperation('assets', a, 'a', 'Activo agregado');
  const updateAsset = (id: string, u: Partial<Asset>) => updateOperation('assets', id, u, 'Activo actualizado');
  const deleteAsset = (id: string) => deleteOperation('assets', id, 'Activo eliminado');

  const addEquityAsset = (ea: Omit<EquityAsset, 'id'|'createdAt'>) => addOperation('equityAssets', ea, 'ea', 'Activo Patrimonial agregado');
  const updateEquityAsset = (id: string, u: Partial<EquityAsset>) => updateOperation('equityAssets', id, u, 'Activo Patrimonial actualizado');
  const deleteEquityAsset = (id: string) => deleteOperation('equityAssets', id, 'Activo Patrimonial eliminado');

  const addDebt = (d: Omit<Debt, 'id'|'createdAt'>) => addOperation('debts', d, 'd', 'Pasivo agregado');
  const updateDebt = (id: string, u: Partial<Debt>) => updateOperation('debts', id, u, 'Pasivo actualizado');
  const deleteDebt = (id: string) => deleteOperation('debts', id, 'Pasivo eliminado');

  const addCategory = (c: Omit<Category, 'id'|'createdAt'>) => addOperation('categories', c, 'c', 'Categoría agregada');
  const updateCategory = (id: string, u: Partial<Category>) => updateOperation('categories', id, u, 'Categoría actualizada');
  const deleteCategory = (id: string) => deleteOperation('categories', id, 'Categoría eliminada', (d, i) =>
      d.transactions.some(t => t.categoryId === i) || d.recurringExpenses.some(re => re.categoryId === i)
          ? 'No se puede eliminar, está en uso.'
          : null
  );

  const addVenture = (v: Omit<Venture, 'id'|'createdAt'|'currentAmount'>) => addOperation('ventures', { ...v, currentAmount: 0 }, 'v', 'Venture agregado');
  const updateVenture = (id: string, u: Partial<Venture>) => updateOperation('ventures', id, u, 'Venture actualizado');
  const deleteVenture = (id: string) => deleteOperation('ventures', id, 'Venture eliminado', (d, i) =>
      d.transactions.some(t => t.ventureId === i) ? 'No se puede eliminar, tiene transacciones asociadas.' : null
  );

  const addRecurringExpense = (re: Omit<RecurringExpense, 'id'|'createdAt'>) => addOperation('recurringExpenses', re, 're', 'Gasto recurrente agregado');
  const updateRecurringExpense = (id: string, u: Partial<RecurringExpense>) => updateOperation('recurringExpenses', id, u, 'Gasto recurrente actualizado');
  const deleteRecurringExpense = (id: string) => deleteOperation('recurringExpenses', id, 'Gasto recurrente eliminado');


  const generateRecurringTransactions = useCallback(async () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayStr = dateToDDMMYYYY(now);
    
    wrappedSetData(prev => {
        const newTransactions: Transaction[] = [];
        
        prev.recurringExpenses.forEach(re => {
            const hasBeenGenerated = prev.transactions.some(t => {
                const txDate = parseDateDDMMYYYY(t.dateStr);
                return txDate && t.description === re.name && 
                       t.isRecurring && 
                       txDate.getMonth() === currentMonth &&
                       txDate.getFullYear() === currentYear;
            });

            if(!hasBeenGenerated) {
                const newTx: Transaction = {
                    id: `t_${Date.now()}_${Math.random()}`,
                    type: 'Egreso',
                    amount: re.amount,
                    description: re.name,
                    dateStr: todayStr,
                    cuentaId: re.cuentaId,
                    categoryId: re.categoryId,
                    isRecurring: true,
                    createdAt: new Date().toISOString()
                };
                newTransactions.push(newTx);
            }
        });

        if (newTransactions.length > 0) {
            let newCuentas = [...prev.cuentas];
            newTransactions.forEach(tx => {
                if(tx.cuentaId) {
                    newCuentas = newCuentas.map(c => c.id === tx.cuentaId ? { ...c, balance: c.balance - tx.amount } : c);
                }
            });

            showToast(`${newTransactions.length} gasto(s) recurrente(s) generado(s).`, 'success');

            return {
                ...prev,
                transactions: [...newTransactions, ...prev.transactions],
                cuentas: newCuentas,
                meta: { ...prev.meta, updatedAt: new Date().toISOString() }
            };
        } else {
            showToast('No hay gastos recurrentes nuevos para este mes.', 'info');
            return prev;
        }
    });
  }, [wrappedSetData, showToast]);


  const syncNow = async () => {
    if (!isCloudOn || !apiBase || !orgId) {
        showToast("Cloud no configurado.", "error");
        return;
    }
    setSyncStatus('checking');
    try {
        await new Promise(res => setTimeout(res, 1500));
        showToast('Sincronización simulada completada.');
        setSyncStatus('idle');
    } catch (e) {
        console.error("Sync failed:", e);
        setSyncStatus('error');
        showToast("Error de sincronización.", "error");
    }
  };

    const importData = async (file: File) => {
        const text = await file.text();
        try {
            const importedData = JSON.parse(text);
            if (importedData.transactions && importedData.assets && importedData.cuentas) {
                wrappedSetData(importedData);
                showToast("Datos importados correctamente.");
            } else {
                showToast("Archivo JSON inválido.", "error");
            }
        } catch (error) {
            showToast("Error al procesar el archivo JSON.", "error");
        }
    };
    
    const exportJson = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wealth_command_backup.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportCsv = () => {
        const headers = "fecha,cuenta,tipo,tipo_ingreso,categoria,descripcion,monto";
        const rows = data.transactions.map(t => {
            const cuenta = data.cuentas.find(c => c.id === t.cuentaId)?.name || '';
            const category = data.categories.find(c => c.id === t.categoryId)?.name || '';
            const description = `"${t.description.replace(/"/g, '""')}"`;
            return [t.dateStr, cuenta, t.type, t.incomeType || '', category, description, t.amount].join(',');
        });
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transacciones_wealth_command.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

  const selectDashboardData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(currentMonth - 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const currentMonthTxs = data.transactions.filter(t => {
        const d = parseDateDDMMYYYY(t.dateStr);
        return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type !== 'Transferencia';
    });
    
    const lastMonthTxs = data.transactions.filter(t => {
        const d = parseDateDDMMYYYY(t.dateStr);
        return d && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear && t.type !== 'Transferencia';
    });

    const currentIncome = currentMonthTxs.filter(t => t.type === 'Ingreso').reduce((sum, t) => sum + t.amount, 0);
    const currentExpenses = currentMonthTxs.filter(t => t.type === 'Egreso').reduce((sum, t) => sum + t.amount, 0);
    const currentCashFlow = currentIncome - currentExpenses;

    const lastMonthIncome = lastMonthTxs.filter(t => t.type === 'Ingreso').reduce((sum, t) => sum + t.amount, 0);
    const lastMonthExpenses = lastMonthTxs.filter(t => t.type === 'Egreso').reduce((sum, t) => sum + t.amount, 0);
    const lastMonthCashFlow = lastMonthIncome - lastMonthExpenses;
    
    let cashFlowTrend = 0;
    if (lastMonthCashFlow !== 0) {
        cashFlowTrend = ((currentCashFlow - lastMonthCashFlow) / Math.abs(lastMonthCashFlow)) * 100;
    } else if (currentCashFlow > 0) {
        cashFlowTrend = 100;
    }

    const totalCashAssets = data.cuentas.reduce((sum, c) => sum + c.balance, 0);
    const totalInvestmentAssets = data.assets.reduce((sum, a) => sum + a.balance, 0);
    const totalEquityAssets = (data.equityAssets || []).reduce((sum, ea) => sum + ea.value, 0);
    const totalAssets = totalCashAssets + totalInvestmentAssets + totalEquityAssets;
    const totalLiabilities = data.debts.reduce((sum, d) => sum + d.outstanding, 0);
    const netWorth = totalAssets - totalLiabilities;
    
    const totalPassiveIncome = data.assets.reduce((sum, a) => sum + a.passiveIncome, 0);
    const freedomPercentage = currentExpenses > 0 ? Math.min((totalPassiveIncome / currentExpenses) * 100, 100) : (totalPassiveIncome > 0 ? 100 : 0);
    
    const monthlyChartData = Array.from({length: 6}).map((_, i) => {
        const d = new Date();
        d.setMonth(now.getMonth() - 5 + i);
        const monthKey = d.toLocaleString('es-ES', { month: 'short', year: '2-digit' });
        const monthTxs = data.transactions.filter(t => {
            const txDate = parseDateDDMMYYYY(t.dateStr);
            return txDate && txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear() && t.type !== 'Transferencia';
        });
        return {
            name: monthKey,
            Ingresos: monthTxs.filter(t => t.type === 'Ingreso').reduce((s, t) => s + t.amount, 0),
            Gastos: monthTxs.filter(t => t.type === 'Egreso').reduce((s, t) => s + t.amount, 0),
        }
    });

    const assetComposition = [
        { name: 'Efectivo', value: totalCashAssets },
        { name: 'Inversiones', value: totalInvestmentAssets },
        { name: 'Patrimonio', value: totalEquityAssets },
    ].filter(item => item.value > 0);

    return {
        netWorth: {
            value: netWorth,
            totalAssets,
            totalLiabilities
        },
        cashFlow: {
            value: currentCashFlow,
            totalIncome: currentIncome,
            totalExpenses: currentExpenses,
            trend: cashFlowTrend,
        },
        freedomRace: {
            percentage: freedomPercentage,
            passiveIncome: totalPassiveIncome,
            expenses: currentExpenses,
        },
        monthlyChartData,
        assetComposition,
        financialSummaryForAI: {
            passiveIncome: totalPassiveIncome,
            activeIncome: currentIncome - currentMonthTxs.filter(t=>t.incomeType === 'Pasivo').reduce((s,t)=>s+t.amount, 0),
            totalExpenses: currentExpenses,
            netWorth,
            cashFlow: currentCashFlow,
            freedomPercentage,
            venturesCount: data.ventures.length
        }
    };
  }, [data]);

  return {
    data,
    setData: wrappedSetData,
    selectDashboardData,
    isCloudOn,
    setIsCloudOn,
    apiBase,
    setApiBase,
    orgId,
    setOrgId,
    syncStatus,
    syncNow,
    requestConfirmation,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addTransfer,
    addCuenta,
    updateCuenta,
    deleteCuenta,
    addAsset,
    updateAsset,
    deleteAsset,
    addEquityAsset,
    updateEquityAsset,
    deleteEquityAsset,
    addDebt,
    updateDebt,
    deleteDebt,
    addCategory,
    updateCategory,
    deleteCategory,
    addVenture,
    updateVenture,
    deleteVenture,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    generateRecurringTransactions,
    importData,
    exportJson,
    exportCsv
  };
};

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item) as Partial<AppData>;
                const defaultData = getInitialData();
                
                // Defensive merging to ensure all keys that are arrays in defaultData exist in the final state
                if (typeof parsed === 'object' && parsed !== null) {
                    const mergedData: AppData = { ...defaultData, ...parsed };
                    
                    Object.keys(defaultData).forEach(key => {
                      const k = key as keyof AppData;
                      if (Array.isArray(defaultData[k]) && !Array.isArray(mergedData[k])) {
                        mergedData[k] = defaultData[k] as any; // Ensure it's an array
                      }
                    });

                    return mergedData as T;
                }
            }
            const dataToStore = initialValue instanceof Function ? initialValue() : initialValue;
            window.localStorage.setItem(key, JSON.stringify(dataToStore));
            return dataToStore;
        } catch (error) {
            console.error(error);
            return initialValue instanceof Function ? initialValue() : initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
};