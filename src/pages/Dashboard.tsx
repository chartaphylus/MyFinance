import { useState, useEffect } from 'react';
import { supabase, Transaction } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import LineChart from '../components/LineChart';
import DonutChart from '../components/DonutChart';

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    if (user) loadTransactions();
  }, [user]);

  async function loadTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatRupiah = (value: number | string) => {
    const number = Number(value) || 0;
    return number.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });
  };

  // Split transactions
  const previousTransactions = transactions.filter((t) => t.date < filterMonth + '-01');
  const currentTransactions = transactions.filter((t) => t.date.startsWith(filterMonth));

  // Previous balance
  const previousBalance =
    previousTransactions.reduce((sum, t) => t.type === 'income'
      ? sum + parseFloat(t.amount.toString())
      : sum - parseFloat(t.amount.toString()), 0);

  // Current month totals
  const totalIncome = currentTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const totalExpense = currentTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const currentMonthBalance = totalIncome - totalExpense;
  const currentBalance = previousBalance + currentMonthBalance;

  // By category
  const expenseByCategory = currentTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount.toString());
      return acc;
    }, {} as Record<string, number>);

  const incomeByCategory = currentTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount.toString());
      return acc;
    }, {} as Record<string, number>);

  // Monthly data for line chart (all months)
  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.date.substring(0, 7);
    if (!acc[month]) acc[month] = { income: 0, expense: 0, balance: 0 };
    const amount = parseFloat(t.amount.toString());
    t.type === 'income' ? acc[month].income += amount : acc[month].expense += amount;
    return acc;
  }, {} as Record<string, { income: number; expense: number; balance: number }>);

  let runningBalance = 0;
  Object.keys(monthlyData).sort().forEach((month) => {
    runningBalance += monthlyData[month].income - monthlyData[month].expense;
    monthlyData[month].balance = runningBalance;
  });

  const recentTransactions = [...currentTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
          <Activity className="w-5 h-5" />
          <span className="text-sm">Financial Overview</span>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <span className="text-sm text-slate-600 dark:text-slate-400">Month:</span>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-1 border rounded-lg text-slate-900 dark:text-slate-100 
                     bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 
                     focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Current Balance */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Current Balance</span>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <p className={`text-2xl sm:text-3xl font-bold ${currentBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatRupiah(currentBalance)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {currentBalance >= 0 ? 'Positive balance' : 'Negative balance'}
          </p>
        </div>

        {/* Total Income */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 sm:p-6 border border-green-200 dark:border-green-800 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-green-700 dark:text-green-400 text-sm font-medium">Total Income</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-500">{formatRupiah(totalIncome)}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">This month</p>
        </div>

        {/* Total Expense */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-4 sm:p-6 border border-red-200 dark:border-red-800 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-red-700 dark:text-red-400 text-sm font-medium">Total Expense</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-500">{formatRupiah(totalExpense)}</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">This month</p>
        </div>
      </div>

      {/* Charts & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Financial Trend</h2>
          <LineChart data={monthlyData} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No transactions yet</p>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.category}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-semibold mt-2 sm:mt-0 ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                  </span> 
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Expense by Category</h2>
          <DonutChart data={expenseByCategory} type="expense" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Income by Category</h2>
          <DonutChart data={incomeByCategory} type="income" />
        </div>
      </div>
    </div>
  );
}
