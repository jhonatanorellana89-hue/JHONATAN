export interface Transaction {
  id: string;
  type: 'Ingreso' | 'Egreso' | 'Transferencia';
  incomeType?: 'Activo' | 'Pasivo';
  amount: number;
  description: string;
  dateStr: string; // "dd/mm/yyyy"
  cuentaId: string | null;
  toCuentaId?: string | null; // For transfers
  categoryId: string | null;
  debtId?: string | null;
  ventureId?: string | null;
  isRecurring?: boolean;
  createdAt: string; // ISO string
}

export interface Cuenta {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  balance: number;
  passiveIncome: number;
  currency: string;
  createdAt: string;
}

export interface EquityAsset {
  id: string;
  name: string;
  type: 'Bienes Raíces' | 'Vehículo' | 'Otro';
  value: number;
  createdAt: string;
}

export interface Debt {
  id: string;
  name: string;
  outstanding: number;
  monthlyPayment: number;
  interest: number;
  equityAssetId: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  limitMonthly: number;
  createdAt: string;
}

export interface Venture {
  id: string;
  name: string;
  targetAmount: number; // Cost of the venture
  currentAmount: number; // Capital invested so far
  deadline?: string;
  createdAt: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  categoryId: string | null;
  cuentaId: string | null;
  createdAt: string;
}

export interface AppData {
  transactions: Transaction[];
  cuentas: Cuenta[];
  assets: Asset[];
  equityAssets: EquityAsset[];
  debts: Debt[];
  categories: Category[];
  ventures: Venture[];
  recurringExpenses: RecurringExpense[];
  meta: {
    createdAt: string | null;
    updatedAt: string | null;
  };
}

export type SyncStatus = 'idle' | 'checking' | 'pushing' | 'pulling' | 'error' | 'saving' | 'auto';

export interface DashboardData {
  netWorth: {
    value: number;
    totalAssets: number;
    totalLiabilities: number;
  };
  cashFlow: {
    value: number;
    totalIncome: number;
    totalExpenses: number;
    trend: number;
  };
  freedomRace: {
    percentage: number;
    passiveIncome: number;
    expenses: number;
  };
  monthlyChartData: {
    name: string;
    Ingresos: number;
    Gastos: number;
  }[];
  financialSummaryForAI: {
    passiveIncome: number;
    activeIncome: number;
    totalExpenses: number;
    netWorth: number;
    cashFlow: number;
    freedomPercentage: number;
    venturesCount: number;
  };
  assetComposition: {
      name: string;
      value: number;
  }[];
}


export interface AppDataHook extends AppDataContext {
  isCloudOn: boolean;
  setIsCloudOn: React.Dispatch<React.SetStateAction<boolean>>;
  apiBase: string;
  setApiBase: React.Dispatch<React.SetStateAction<string>>;
  orgId: string;
  setOrgId: React.Dispatch<React.SetStateAction<string>>;
  syncStatus: SyncStatus;
  syncNow: () => Promise<void>;
  importData: (file: File) => Promise<void>;
  exportJson: () => void;
  exportCsv: () => void;
  selectDashboardData: DashboardData;
}

export interface AppDataContext {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addTransfer: (transfer: { amount: number, fromCuentaId: string, toCuentaId: string, dateStr: string, description: string }) => Promise<void>;
  addCuenta: (cuenta: Omit<Cuenta, 'id' | 'createdAt'>) => Promise<void>;
  updateCuenta: (id: string, updates: Partial<Cuenta>) => Promise<void>;
  deleteCuenta: (id: string) => Promise<void>;
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  addEquityAsset: (asset: Omit<EquityAsset, 'id' | 'createdAt'>) => Promise<void>;
  updateEquityAsset: (id: string, updates: Partial<EquityAsset>) => Promise<void>;
  deleteEquityAsset: (id: string) => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => Promise<void>;
  updateDebt: (id: string, updates: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addVenture: (venture: Omit<Venture, 'id' | 'createdAt' | 'currentAmount'>) => Promise<void>;
  updateVenture: (id: string, updates: Partial<Venture>) => Promise<void>;
  deleteVenture: (id: string) => Promise<void>;
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id' | 'createdAt'>) => Promise<void>;
  updateRecurringExpense: (id: string, updates: Partial<RecurringExpense>) => Promise<void>;
  deleteRecurringExpense: (id: string) => Promise<void>;
  generateRecurringTransactions: () => Promise<void>;
  requestConfirmation: (title: string, onConfirm: () => void) => void;
}
