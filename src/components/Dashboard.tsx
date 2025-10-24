import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Transaction, SavingsGoal, FinancialTip } from '../lib/supabase';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  Plus,
  LogOut,
  Calendar,
  DollarSign,
  PieChart
} from 'lucide-react';
import TransactionForm from './TransactionForm';
import SavingsGoalForm from './SavingsGoalForm';
import TransactionHistory from './TransactionHistory';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [tips, setTips] = useState<FinancialTip[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [transactionsRes, goalsRes, tipsRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(100),
        supabase
          .from('savings_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('financial_tips')
          .select('*')
          .limit(5)
      ]);

      if (transactionsRes.data) setTransactions(transactionsRes.data);
      if (goalsRes.data) setSavingsGoals(goalsRes.data);
      if (tipsRes.data) setTips(tipsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBalance = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expenses, balance: income - expenses };
  };

  const getMonthlyData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expenses, balance: income - expenses };
  };

  const getCategoryBreakdown = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryMap: { [key: string]: number } = {};

    expenses.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
    });

    return Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const { balance } = calculateBalance();
  const monthlyData = getMonthlyData();
  const topCategories = getCategoryBreakdown();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                FinZen
              </span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-emerald-100 text-sm font-medium">Balance Total</span>
              </div>
            </div>
            <div className="text-4xl font-bold mb-2">
              ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-emerald-100 text-sm">Todas tus cuentas</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-gray-600 text-sm font-medium">Ingresos del mes</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${monthlyData.income.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-gray-500 text-sm">
              {transactions.filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth()).length} transacciones
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-gray-600 text-sm font-medium">Gastos del mes</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${monthlyData.expenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-gray-500 text-sm">
              {transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth()).length} transacciones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Acciones rápidas</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowTransactionForm(true)}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Nueva transacción
                </button>
                <button
                  onClick={() => setShowGoalForm(true)}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 transition shadow-sm"
                >
                  <Target className="w-5 h-5" />
                  Nueva meta
                </button>
              </div>
            </div>

            {topCategories.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <PieChart className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-gray-900">Top 5 categorías de gasto</h2>
                </div>
                <div className="space-y-4">
                  {topCategories.map(([category, amount], index) => {
                    const percentage = (amount / monthlyData.expenses) * 100;
                    return (
                      <div key={category}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {category}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <TransactionHistory transactions={transactions} onUpdate={loadData} />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-gray-900">Metas de ahorro</h2>
              </div>
              {savingsGoals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tienes metas aún. ¡Crea tu primera meta!</p>
              ) : (
                <div className="space-y-4">
                  {savingsGoals.map(goal => {
                    const progress = (goal.current_amount / goal.target_amount) * 100;
                    return (
                      <div key={goal.id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                            {goal.deadline && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(goal.deadline).toLocaleDateString('es-MX')}
                              </p>
                            )}
                          </div>
                          {goal.completed && (
                            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                              Completado
                            </span>
                          )}
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">
                              ${goal.current_amount.toLocaleString('es-MX')}
                            </span>
                            <span className="text-gray-900 font-semibold">
                              ${goal.target_amount.toLocaleString('es-MX')}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 text-right">
                          {progress.toFixed(0)}% completado
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-bold text-gray-900">Tips financieros</h2>
              </div>
              <div className="space-y-3">
                {tips.slice(0, 3).map(tip => (
                  <div key={tip.id} className="bg-white rounded-xl p-4 border border-amber-100">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">{tip.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{tip.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showTransactionForm && (
        <TransactionForm
          onClose={() => setShowTransactionForm(false)}
          onSuccess={() => {
            loadData();
            setShowTransactionForm(false);
          }}
        />
      )}

      {showGoalForm && (
        <SavingsGoalForm
          onClose={() => setShowGoalForm(false)}
          onSuccess={() => {
            loadData();
            setShowGoalForm(false);
          }}
        />
      )}
    </div>
  );
}
