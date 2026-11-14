import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  X,
  FileText,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { formatCurrency, formatDate } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../config/appConfig';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'food',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    paymentMethod: 'upi',
    isRecurring: false,
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter) params.category = categoryFilter;

      const { data } = await api.get('/transactions', { params });
      setTransactions(data.data || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, typeFilter, categoryFilter]);

  const fetchSummary = async () => {
    try {
      const { data } = await api.get('/transactions/summary');
      if (data.data?.summary) {
        setSummary(data.data.summary);
      }
    } catch (err) {
      console.error('Summary fetch error:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setFormData({
      type: 'expense',
      category: 'food',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      paymentMethod: 'upi',
      isRecurring: false,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTransaction(t);
    setFormData({
      type: t.type,
      category: t.category,
      amount: t.amount,
      date: new Date(t.date).toISOString().split('T')[0],
      note: t.note || '',
      paymentMethod: t.paymentMethod || 'upi',
      isRecurring: t.isRecurring || false,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transaction removed');
      fetchTransactions();
      fetchSummary();
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction._id}`, payload);
        toast.success('Transaction updated');
      } else {
        await api.post('/transactions', payload);
        toast.success('Transaction recorded');
      }

      setShowAddModal(false);
      fetchTransactions();
      fetchSummary();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save transaction';
      toast.error(msg);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/v1/transactions/export', '_blank');
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    const form = new FormData();
    form.append('file', csvFile);

    try {
      setImporting(true);
      const { data } = await api.post('/transactions/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Imported ${data.data?.importedCount || 0} transactions!`);
      setShowImportModal(false);
      setCsvFile(null);
      fetchTransactions();
      fetchSummary();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to import CSV';
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <PageWrapper
      title="Transaction Management"
      subtitle="Track daily expenses, monitor cash flow, and import statement data."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/60 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/60 shadow-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" /> Import CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Transaction
          </button>
        </div>
      }
    >
      {/* Monthly Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Monthly Inflow</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.totalIncome)}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Monthly Outflow</span>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(summary.totalExpense)}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Net Monthly Savings</span>
              <PiggyBank className="w-4 h-4 text-indigo-500" />
            </div>
            <div className={`text-xl sm:text-2xl font-bold ${summary.netSavings >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
              {formatCurrency(summary.netSavings)}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Savings Rate</span>
              <PieChart className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {summary.savingsRate}%
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes or descriptions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
          >
            <option value="">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {(searchTerm || typeFilter || categoryFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('');
                setCategoryFilter('');
                setPage(1);
              }}
              className="text-xs text-rose-500 hover:underline px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-800/60 uppercase font-semibold text-[11px] text-gray-500 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Note</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">No transactions found</p>
                    <p className="text-gray-400 text-xs mt-0.5">Try recording your first expense or importing a CSV statement.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="capitalize font-semibold text-gray-900 dark:text-white">
                        {t.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                      {t.note || '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap uppercase text-[10px] tracking-wider text-gray-400 font-medium">
                      {t.paymentMethod}
                    </td>
                    <td
                      className={`py-3 px-4 whitespace-nowrap font-bold text-right ${
                        t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1 rounded-md text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="p-1 rounded-md text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
            </span>
            <div className="flex space-x-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Transaction */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      formData.type === 'expense'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      formData.type === 'income'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                  <option value="salary">Salary</option>
                  <option value="freelance">Freelance</option>
                  <option value="investments">Investments</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  placeholder="e.g. 1500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="cash">Cash</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="net_banking">Net Banking</option>
                  <option value="wallet">Wallet</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy order, groceries, Uber"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  {editingTransaction ? 'Save Changes' : 'Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: CSV Import */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center space-x-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Import Statement CSV</span>
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
              <p className="text-gray-500">
                Upload your bank or expense tracking CSV statement. The file should include columns for:
                <code className="text-indigo-600 dark:text-indigo-400 block mt-1 p-1 bg-gray-50 dark:bg-gray-800 rounded">
                  Date, Type, Category, Amount, PaymentMethod, Note
                </code>
              </p>

              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-950 dark:file:text-indigo-400 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing || !csvFile}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {importing ? 'Processing...' : 'Upload & Parse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
