import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Plus,
  Upload,
  Download,
  Search,
  Trash2,
  Edit2,
  X,
  FileText,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';
import HelpTooltip from '../components/common/HelpTooltip';
import AnimatedNumber from '../components/common/AnimatedNumber';
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
      toast.error('Could not load transactions.');
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
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Removed successfully');
      fetchTransactions();
      fetchSummary();
    } catch (err) {
      toast.error('Could not delete record.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction._id}`, payload);
        toast.success('Updated successfully');
      } else {
        await api.post('/transactions', payload);
        toast.success('Saved successfully');
      }

      setShowAddModal(false);
      fetchTransactions();
      fetchSummary();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not save record.';
      toast.error(msg);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/v1/transactions/export', '_blank');
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please pick a CSV file first');
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
      const msg = err.response?.data?.message || 'Could not import CSV file.';
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <PageWrapper
      title="Transactions & Cash Flow"
      subtitle="See all your money in and out, add new items, or import bank statements."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center px-3.5 py-2 rounded-xl border border-[var(--blue-100)] bg-white text-[var(--ink)] text-xs font-semibold hover:bg-[var(--blue-50)] shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[var(--blue-500)]" /> Export CSV
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl border border-[var(--blue-100)] bg-white text-[var(--ink)] text-xs font-semibold hover:bg-[var(--blue-50)] shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-[var(--blue-500)]" /> Import CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[var(--blue-500)] hover:bg-[var(--blue-700)] text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Transaction
          </button>
        </div>
      }
    >
      {/* Monthly Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-[var(--blue-100)] shadow-xs relative overflow-hidden">
            <CornerDecor variant="dots" position="top-right" size={40} opacity={0.3} />
            <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
              <span>Money In This Month</span>
              <TrendingUp className="w-4 h-4 text-[var(--good)]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[var(--good)]">
              <AnimatedNumber value={summary.totalIncome} prefix="₹" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[var(--blue-100)] shadow-xs relative overflow-hidden">
            <CornerDecor variant="arc" position="top-right" size={40} opacity={0.3} />
            <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
              <span>Money Out This Month</span>
              <TrendingDown className="w-4 h-4 text-[var(--bad)]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[var(--bad)]">
              <AnimatedNumber value={summary.totalExpense} prefix="₹" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[var(--blue-100)] shadow-xs relative overflow-hidden">
            <CornerDecor variant="dots" position="top-right" size={40} opacity={0.3} />
            <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
              <span>Saved This Month</span>
              <PiggyBank className="w-4 h-4 text-[var(--blue-500)]" />
            </div>
            <div className={`text-xl sm:text-2xl font-bold ${summary.netSavings >= 0 ? 'text-[var(--blue-700)]' : 'text-[var(--bad)]'}`}>
              <AnimatedNumber value={summary.netSavings} prefix="₹" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[var(--blue-100)] shadow-xs relative overflow-hidden">
            <CornerDecor variant="arc" position="top-right" size={40} opacity={0.3} />
            <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
              <span className="flex items-center gap-1">
                Savings Rate
                <HelpTooltip term="Savings Rate" text="The portion of your income you managed to save after all expenses." />
              </span>
              <PieChart className="w-4 h-4 text-[var(--warn)]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[var(--ink)]">
              {summary.savingsRate}%
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search notes or descriptions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[var(--blue-500)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] outline-none"
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
            className="px-3 py-2 text-xs rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] outline-none"
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
              className="text-xs text-[var(--bad)] hover:underline px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-[var(--blue-100)] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--ink)]">
            <thead className="bg-[var(--blue-50)] uppercase font-semibold text-[11px] text-[var(--muted)] border-b border-[var(--blue-100)]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Note</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--blue-100)]/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[var(--muted)]">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <FileText className="w-8 h-8 text-[var(--blue-300)] mx-auto mb-2" />
                    <p className="text-[var(--ink)] text-sm font-medium">No transactions found</p>
                    <p className="text-[var(--muted)] text-xs mt-0.5">Try recording an expense or importing a CSV bank statement.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-[var(--blue-50)]/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-[var(--muted)]">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="capitalize font-semibold text-[var(--ink)]">
                        {t.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--muted)] max-w-xs truncate">
                      {t.note || '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap uppercase text-[10px] tracking-wider text-[var(--muted)] font-medium">
                      {t.paymentMethod}
                    </td>
                    <td
                      className={`py-3 px-4 whitespace-nowrap font-bold text-right ${
                        t.type === 'income' ? 'text-[var(--good)]' : 'text-[var(--bad)]'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--blue-700)] hover:bg-[var(--blue-50)] transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--bad)] hover:bg-rose-50 transition-colors"
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
          <div className="px-4 py-3 border-t border-[var(--blue-100)] flex items-center justify-between text-xs text-[var(--muted)]">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
            </span>
            <div className="flex space-x-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 rounded-lg border border-[var(--blue-100)] bg-white text-[var(--ink)] hover:bg-[var(--blue-50)] disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border border-[var(--blue-100)] bg-white text-[var(--ink)] hover:bg-[var(--blue-50)] disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Transaction */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[var(--blue-100)] rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
            <CornerDecor variant="blob" position="top-right" size={70} opacity={0.3} />
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[var(--blue-100)]">
              <h3 className="font-bold text-base text-[var(--ink)]">
                {editingTransaction ? 'Edit Transaction' : 'Add Money In or Out'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[var(--ink)] font-semibold mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      formData.type === 'expense'
                        ? 'border-[var(--bad)] bg-rose-50 text-[var(--bad)]'
                        : 'border-[var(--blue-100)] text-[var(--muted)] hover:bg-[var(--blue-50)]'
                    }`}
                  >
                    Expense (Money Out)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      formData.type === 'income'
                        ? 'border-[var(--good)] bg-emerald-50 text-[var(--good)]'
                        : 'border-[var(--blue-100)] text-[var(--muted)] hover:bg-[var(--blue-50)]'
                    }`}
                  >
                    Income (Money In)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[var(--ink)] font-semibold mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] outline-none"
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
                <label className="block text-[var(--ink)] font-semibold mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  placeholder="e.g. 1500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[var(--blue-500)]"
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-semibold mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[var(--blue-500)]"
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-semibold mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] outline-none"
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
                <label className="block text-[var(--ink)] font-semibold mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy order, groceries, Uber"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[var(--blue-500)]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-[var(--blue-100)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--blue-100)] text-[var(--muted)] hover:bg-[var(--blue-50)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--blue-500)] hover:bg-[var(--blue-700)] text-white font-semibold shadow-xs"
                >
                  {editingTransaction ? 'Save Changes' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: CSV Import */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[var(--blue-100)] rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
            <CornerDecor variant="arc" position="top-right" size={60} opacity={0.3} />
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--blue-100)]">
              <h3 className="font-bold text-base text-[var(--ink)] flex items-center space-x-2">
                <Upload className="w-4 h-4 text-[var(--blue-500)]" />
                <span>Import Statement CSV</span>
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
              <p className="text-[var(--muted)] leading-relaxed">
                Upload your bank statement in CSV format. Columns needed:
                <code className="text-[var(--blue-700)] block mt-1 p-1 bg-[var(--blue-50)] rounded font-mono">
                  Date, Type, Category, Amount, PaymentMethod, Note
                </code>
              </p>

              <div className="border-2 border-dashed border-[var(--blue-100)] rounded-2xl p-6 text-center hover:border-[var(--blue-500)] transition-colors bg-[var(--bg)]">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="block w-full text-xs text-[var(--muted)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--blue-50)] file:text-[var(--blue-700)] cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-[var(--blue-100)]">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--blue-100)] text-[var(--muted)] hover:bg-[var(--blue-50)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing || !csvFile}
                  className="px-5 py-2 rounded-xl bg-[var(--blue-500)] hover:bg-[var(--blue-700)] text-white font-semibold disabled:opacity-50"
                >
                  {importing ? 'Processing...' : 'Upload Statement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
