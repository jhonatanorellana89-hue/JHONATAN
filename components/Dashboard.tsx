import React, { useState } from 'react';
import { AppDataHook } from '../types';
import { View } from '../App';
import { fmtMoney } from '../utils/helpers';
import { BrainCircuitIcon, ZapIcon, AlertTriangleIcon, TargetIcon, CheckCircleIcon, TrendingUpIcon, TrendingDownIcon, WalletIcon, ChartBarIcon } from './ui/Icons';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, TooltipProps, PieChart, Pie, Cell, Legend } from 'recharts';
import { getFinancialInsight } from '../services/geminiService';
import { Projections } from './Projections';
import { AccionesRapidas } from './AIQuickEntry';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`glass-card rounded-xl p-4 shadow-lg ${className}`}>
    {children}
  </div>
);

const KPICard: React.FC<{ title: string; value: string; breakdown: string; icon: React.ReactNode; trend?: number; }> = ({ title, value, breakdown, icon, trend }) => (
    <Card>
        <div className="flex justify-between items-start">
            <p className="text-sm text-muted font-semibold">{title}</p>
            <div className="text-muted">{icon}</div>
        </div>
        <div className="mt-2">
            <p className="text-3xl font-extrabold text-primary font-mono">{value}</p>
            <div className="flex items-center gap-2">
                <p className="text-xs text-muted font-mono">{breakdown}</p>
                {typeof trend !== 'undefined' && (
                     <span className={`flex items-center text-xs font-bold ${trend >= 0 ? 'text-growth' : 'text-danger'}`}>
                        {trend >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        {trend.toFixed(1)}%
                    </span>
                )}
            </div>
        </div>
    </Card>
);

const FreedomCard: React.FC<{ data: AppDataHook['selectDashboardData']['freedomRace'] }> = ({ data }) => {
    const { percentage, passiveIncome, expenses } = data;
    return (
        <Card className="flex flex-col justify-between col-span-1 lg:col-span-1">
            <div>
                <p className="text-sm text-muted font-semibold">Carrera Hacia la Libertad</p>
                <p className="text-5xl font-extrabold text-primary font-mono mt-4">{percentage.toFixed(1)}%</p>
            </div>
            <div>
                <div className="w-full bg-black/20 rounded-full h-3 border border-border-subtle mt-4 mb-2">
                    <div className="bg-gradient-to-r from-accent to-accent-teal h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
                <div className="text-xs text-muted font-mono text-center">
                    <span className="text-growth">{fmtMoney(passiveIncome)}</span> / <span>{fmtMoney(expenses)}</span>
                </div>
            </div>
        </Card>
    );
};

const AIAdvisor: React.FC<{ appData: AppDataHook }> = ({ appData }) => {
    const [briefing, setBriefing] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchInsight = async () => {
            setLoading(true);
            try {
                const resultJson = await getFinancialInsight(appData.selectDashboardData.financialSummaryForAI);
                setBriefing(JSON.parse(resultJson));
            } catch (error) {
                console.error("Failed to parse AI briefing:", error);
                setBriefing({ diagnosis: "Error de Análisis", alert: "La respuesta del Asesor IA no pudo ser procesada.", opportunity: "Esto puede deberse a un problema de formato.", mission: "Inténtalo de nuevo más tarde." });
            }
            setLoading(false);
        };
        fetchInsight();
    }, [appData.selectDashboardData.financialSummaryForAI]);

    if (loading) return <div className="glass-card rounded-xl p-4 space-y-2 animate-pulse"><div className="h-4 bg-slate-700/50 rounded w-1/4"></div><div className="h-16 bg-slate-700/50 rounded w-full"></div></div>;
    if (!briefing) return null;

    const BriefingItem: React.FC<{ icon: React.ReactNode, title: string, content: string }> = ({ icon, title, content }) => (
        <div className="flex gap-3">
            <div className="text-muted mt-1">{icon}</div>
            <div>
                <h4 className="font-bold text-sm text-muted">{title}</h4>
                <p className="text-sm text-primary">{content}</p>
            </div>
        </div>
    );
    
    return (
        <Card>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2"><BrainCircuitIcon /> Briefing Estratégico IA</h3>
            <div className="space-y-3">
                <BriefingItem icon={<ZapIcon />} title="Diagnóstico" content={briefing.diagnosis} />
                <BriefingItem icon={<AlertTriangleIcon />} title="Alerta Crítica" content={briefing.alert} />
                <BriefingItem icon={<TargetIcon />} title="Oportunidad Clave" content={briefing.opportunity} />
                <BriefingItem icon={<CheckCircleIcon />} title="Misión de la Semana" content={briefing.mission} />
            </div>
        </Card>
    );
};

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card rounded-lg p-3 shadow-xl">
                <p className="text-sm font-bold text-primary mb-1">{label}</p>
                {payload.map((pld, i) => (
                    <p key={i} style={{ color: pld.color }} className="text-xs font-semibold font-mono">
                        {`${pld.name}: ${fmtMoney(pld.value)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const AssetCompositionChart: React.FC<{ data: {name: string, value: number}[] }> = ({ data }) => {
    const COLORS = ['#388BFD', '#2DA44E', '#A371F7'];
    return (
        <Card>
            <h2 className="text-base font-bold mb-2">Composición de Activos</h2>
            <div className="h-60">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => fmtMoney(value)} />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

export const Dashboard: React.FC<{ appData: AppDataHook; setView: (view: View) => void; openTransferModal: () => void; }> = ({ appData, setView, openTransferModal }) => {
  const [isProjectionsOpen, setIsProjectionsOpen] = useState(false);
  const dashboardData = appData.selectDashboardData;

  return (
    <div className="space-y-6">
        <Projections isOpen={isProjectionsOpen} onClose={() => setIsProjectionsOpen(false)} appData={appData} />
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-extrabold text-primary">Centro de Comando</h1>
                <p className="text-muted">Tu panel de control de CEO Financiero.</p>
            </div>
             <button onClick={() => setIsProjectionsOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent font-bold text-sm shadow-md self-start md:self-center hover:bg-accent/20 transition-colors border border-accent/20 hover:border-accent/30">
                <ZapIcon /> Proyecciones
            </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FreedomCard data={dashboardData.freedomRace} />
                    <KPICard 
                        title="Patrimonio Neto" 
                        value={fmtMoney(dashboardData.netWorth.value)} 
                        breakdown={`${fmtMoney(dashboardData.netWorth.totalAssets)} - ${fmtMoney(dashboardData.netWorth.totalLiabilities)}`}
                        icon={<WalletIcon />}
                    />
                    <KPICard 
                        title="Flujo de Caja Mensual" 
                        value={fmtMoney(dashboardData.cashFlow.value)} 
                        breakdown={`${fmtMoney(dashboardData.cashFlow.totalIncome)} - ${fmtMoney(dashboardData.cashFlow.totalExpenses)}`}
                        trend={dashboardData.cashFlow.trend}
                        icon={<ChartBarIcon />}
                    />
                     <AccionesRapidas appData={appData} setView={setView} openTransferModal={openTransferModal} />
                </div>
                <Card>
                    <h2 className="text-base font-bold mb-4">Evolución Flujo de Caja (Últimos 6 meses)</h2>
                    <div className="h-60">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboardData.monthlyChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#7D8590" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#7D8590" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2DA44E" stopOpacity={0.6}/>
                                        <stop offset="95%" stopColor="#2DA44E" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E5534B" stopOpacity={0.6}/>
                                        <stop offset="95%" stopColor="#E5534B" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="Ingresos" stroke="#2DA44E" fill="url(#colorIngresos)" strokeWidth={2} />
                                <Area type="monotone" dataKey="Gastos" stroke="#E5534B" fill="url(#colorGastos)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <AIAdvisor appData={appData} />
                <AssetCompositionChart data={dashboardData.assetComposition} />
            </div>
        </div>
    </div>
  );
};