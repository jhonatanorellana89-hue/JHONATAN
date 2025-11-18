import React, { useState, useMemo } from 'react';
import { AppDataHook } from '../types';
import { Modal } from './ui/Modal';
import { fmtMoney, dateToDDMMYYYY } from '../utils/helpers';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PlusIcon } from './ui/Icons';

interface Scenario {
  passiveIncome: number;
  recurringExpense: number;
}

export const Projections: React.FC<{ isOpen: boolean; onClose: () => void; appData: AppDataHook; }> = ({ isOpen, onClose, appData }) => {
  const [scenario, setScenario] = useState<Scenario>({ passiveIncome: 0, recurringExpense: 0 });

  const { baseline, projectedData } = useMemo(() => {
    const baseline = {
      passiveIncome: appData.data.assets.reduce((sum, a) => sum + a.passiveIncome, 0),
      activeIncome: appData.data.transactions.filter(t => t.incomeType === 'Activo' && new Date(t.createdAt).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0),
      recurringExpense: appData.data.recurringExpenses.reduce((sum, r) => sum + r.amount, 0),
    };

    const projectedData = Array.from({ length: 12 }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const name = date.toLocaleString('es-ES', { month: 'short', year: '2-digit' });

      const totalPassiveIncome = baseline.passiveIncome + scenario.passiveIncome;
      const totalRecurringExpense = baseline.recurringExpense + scenario.recurringExpense;
      const cashFlow = (baseline.activeIncome + totalPassiveIncome) - totalRecurringExpense;

      return {
        name,
        'Flujo de Caja': cashFlow,
        'Ingresos Pasivos': totalPassiveIncome,
        'Gastos Recurrentes': totalRecurringExpense,
      };
    });

    return { baseline, projectedData };
  }, [appData.data, scenario]);

  if (!isOpen) return null;

  return (
    <Modal title="Simulador de Proyecciones de Flujo de Caja" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-primary mb-2">Simulación a 12 Meses</h3>
          <p className="text-sm text-muted">Ajusta los valores para ver el impacto futuro en tu flujo de caja mensual.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border p-3 rounded-lg">
                <label className="text-sm text-muted">Añadir Ingreso Pasivo</label>
                <input 
                    type="number" 
                    value={scenario.passiveIncome} 
                    onChange={e => setScenario(s => ({...s, passiveIncome: parseFloat(e.target.value) || 0}))} 
                    className="w-full mt-1 p-2 bg-panel border border-border rounded-md font-mono"
                />
            </div>
             <div className="bg-card border border-border p-3 rounded-lg">
                <label className="text-sm text-muted">Añadir/Reducir Gasto</label>
                <input 
                    type="number" 
                    value={scenario.recurringExpense} 
                    onChange={e => setScenario(s => ({...s, recurringExpense: parseFloat(e.target.value) || 0}))} 
                    className="w-full mt-1 p-2 bg-panel border border-border rounded-md font-mono"
                />
            </div>
        </div>

        <div className="h-64 mt-4">
           <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectedData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#21262D', border: '1px solid #30363D', borderRadius: '0.5rem' }} labelStyle={{ color: '#F0F2F5' }} itemStyle={{ fontWeight: 'bold' }} formatter={(value: number) => fmtMoney(value)} />
              <Line type="monotone" dataKey="Flujo de Caja" stroke="#388BFD" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center pt-2">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-card font-semibold">Cerrar</button>
        </div>
      </div>
    </Modal>
  );
};
