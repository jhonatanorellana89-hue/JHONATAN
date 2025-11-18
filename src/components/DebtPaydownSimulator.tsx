import React, { useState, useMemo } from 'react';
import { Debt } from '../types';
import { Modal } from './ui/Modal';
import { fmtMoney } from '../utils/helpers';
import { ZapIcon, CheckCircleIcon } from './ui/Icons';

interface DebtPaydownSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt;
}

const calculatePaydown = (principal: number, monthlyPayment: number, interestRate: number, extraPayment: number) => {
    if (monthlyPayment + extraPayment <= 0) {
        return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity };
    }
    const monthlyInterestRate = (interestRate / 100) / 12;
    let balance = principal;
    let months = 0;
    let totalInterest = 0;
    const totalMonthlyPayment = monthlyPayment + extraPayment;

    while (balance > 0) {
        const interest = balance * monthlyInterestRate;
        totalInterest += interest;
        const principalPaid = totalMonthlyPayment - interest;
        balance -= principalPaid;
        months++;
        if (months > 1200) return { months: Infinity, totalInterest: Infinity, totalPaid: principal + totalInterest }; // Safety break for 100 years
    }

    return { months, totalInterest, totalPaid: principal + totalInterest };
};


export const DebtPaydownSimulator: React.FC<DebtPaydownSimulatorProps> = ({ isOpen, onClose, debt }) => {
    const [extraPayment, setExtraPayment] = useState(0);
    
    const originalPaydown = useMemo(() => {
        return calculatePaydown(debt.outstanding, debt.monthlyPayment, debt.interest, 0);
    }, [debt]);

    const acceleratedPaydown = useMemo(() => {
        return calculatePaydown(debt.outstanding, debt.monthlyPayment, debt.interest, extraPayment);
    }, [debt, extraPayment]);
    
    const monthsSaved = originalPaydown.months - acceleratedPaydown.months;
    const interestSaved = originalPaydown.totalInterest - acceleratedPaydown.totalInterest;

    if (!isOpen) return null;

    return (
        <Modal title="Estrategia de Pago de Deuda" onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-primary">{debt.name}</h3>
                    <p className="text-sm text-muted">Saldo pendiente: {fmtMoney(debt.outstanding)}</p>
                </div>

                <div className="bg-card border border-border p-3 rounded-lg">
                    <label className="text-sm text-muted">Añadir Pago Extra Mensual</label>
                    <input 
                        type="number"
                        value={extraPayment}
                        onChange={e => setExtraPayment(parseFloat(e.target.value) || 0)}
                        className="w-full mt-1 p-2 bg-panel border border-border rounded-md font-mono text-lg"
                    />
                </div>

                <div className="border-t border-border-subtle pt-4">
                    <h4 className="text-base font-bold flex items-center gap-2"><ZapIcon /> Impacto de la Aceleración</h4>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-center">
                        <div className="bg-card p-3 rounded-lg">
                            <p className="text-xs text-muted font-bold">Tiempo Ahorrado</p>
                            <p className={`font-mono text-xl font-bold ${monthsSaved > 0 ? 'text-growth' : 'text-primary'}`}>
                                {isFinite(monthsSaved) ? `${Math.floor(monthsSaved / 12)}a ${monthsSaved % 12}m` : '∞'}
                            </p>
                        </div>
                        <div className="bg-card p-3 rounded-lg">
                            <p className="text-xs text-muted font-bold">Intereses Ahorrados</p>
                             <p className={`font-mono text-xl font-bold ${interestSaved > 0 ? 'text-growth' : 'text-primary'}`}>
                                {isFinite(interestSaved) ? fmtMoney(interestSaved) : '∞'}
                            </p>
                        </div>
                    </div>
                </div>
                
                 <div className="border-t border-border-subtle pt-4">
                    <h4 className="text-base font-bold flex items-center gap-2"><CheckCircleIcon /> Proyección Final</h4>
                    <div className="mt-2 text-sm space-y-1 text-muted">
                       {isFinite(acceleratedPaydown.months) ? (
                            <p>Con un pago extra de <span className="font-bold text-accent">{fmtMoney(extraPayment)}</span>, liquidarás esta deuda en <span className="font-bold text-primary">{Math.floor(acceleratedPaydown.months / 12)} años y {acceleratedPaydown.months % 12} meses</span>.</p>
                       ) : (
                           <p className="text-warning">El pago actual no cubre los intereses. Se necesita un pago mayor para liquidar la deuda.</p>
                       )}
                    </div>
                </div>

                <div className="text-center pt-2">
                    <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-card font-semibold">Cerrar</button>
                </div>
            </div>
        </Modal>
    );
};
