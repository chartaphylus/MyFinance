import { useState, useEffect } from 'react';
import { supabase, Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, DollarSign, Filter, Calendar, X } from 'lucide-react';

export default function Transactions() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterMonth, setFilterMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
  };

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { if (user) loadTransactions(); }, [user]);

  async function loadTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
    } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const transactionData = {
      user_id: user!.id,
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description || null,
      date: formData.date,
    };

    try {
      if (editingTransaction) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id);
        if (error) throw error;
        showToast('Transaction updated successfully', 'success');
      } else {
        const { error } = await supabase.from('transactions').insert([transactionData]);
        if (error) throw error;
        showToast('Transaction created successfully', 'success');
      }
      closeModal();
      loadTransactions();
    } catch (error: any) {
      console.error(error);
      showToast('Error saving transaction', 'error');
    }
  }

  async function deleteTransaction(id: string) {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      showToast('Transaction deleted successfully', 'success');
      loadTransactions();
    } catch (error) {
      console.error(error);
      showToast('Error deleting transaction', 'error');
    }
  }

  function openModal(transaction?: Transaction) {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({ ...transaction, amount: transaction.amount.toString(), description: transaction.description || '' });
    } else {
      setEditingTransaction(null);
      setFormData({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] });
    }
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditingTransaction(null); }

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterMonth && !t.date.startsWith(filterMonth)) return false;
    return true;
  });

  // Current balance including previous months
  const previousTransactions = filterMonth ? transactions.filter(t => t.date < filterMonth + '-01') : [];
  const previousBalance = previousTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

  const currentMonthTransactions = filterMonth ? transactions.filter(t => t.date.startsWith(filterMonth)) : transactions;
  const totalIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const currentMonthBalance = totalIncome - totalExpense;
  const balance = previousBalance + currentMonthBalance;

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Transactions</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition shadow-lg">
          <Plus className="w-5 h-5" /> Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-slate-600 dark:text-slate-400">Balance</span>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <p className={`text-2xl sm:text-3xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatRupiah(balance)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-green-500/30 shadow-sm">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-slate-600 dark:text-slate-400">Income</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-500">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-red-500/30 shadow-sm">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-slate-600 dark:text-slate-400">Expense</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-red-500">{formatRupiah(totalExpense)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100" />
          {filterMonth && <button onClick={() => setFilterMonth('')} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>}
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-2 text-sm text-slate-900 dark:text-slate-100">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${t.type === 'income'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        }`}>{t.category}</span>
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">{t.description || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-sm flex gap-2 justify-end">
                      <button onClick={() => openModal(t)} className="text-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteTransaction(t.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                    className="w-full px-3 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    required
                  >
                    <option value="">Select</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Optional note"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25"
                >
                  {editingTransaction ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
