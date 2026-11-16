import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';
import statementService from '../services/statement.service';
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Download,
  ShieldCheck,
  Tag,
  ArrowRight,
  Info,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Utilities',
  'Education',
  'Health',
  'Entertainment',
  'Savings/Investment',
  'Transfer',
  'Other',
];

export default function StatementUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [batchId, setBatchId] = useState(null);
  const [rows, setRows] = useState([]);
  const [unusual, setUnusual] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [learningMsg, setLearningMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setErrorMsg('');
    try {
      const res = await statementService.uploadStatement(file);
      if (res.data) {
        setBatchId(res.data.batchId);
        setRows(res.data.rows || []);
        setUnusual(res.data.unusual || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not parse the CSV file.');
    } finally {
      setUploading(false);
    }
  };

  const handleCategoryChange = (idx, newCat) => {
    const updated = [...rows];
    updated[idx].category = newCat;
    setRows(updated);
  };

  const handleTeachFin = async (idx) => {
    const row = rows[idx];
    const desc = row.description;
    // Extract first 2 words as keyword
    const kw = desc.split(/[\s/@-]+/)[0].toLowerCase();
    if (!kw) return;
    try {
      await statementService.correctCategory(kw, row.category);
      setLearningMsg(`Fin learned: "${kw}" will always be "${row.category}" for you!`);
      setTimeout(() => setLearningMsg(''), 4000);
    } catch (_) {}
  };

  const handleConfirm = async () => {
    if (!batchId || !rows.length) return;
    try {
      await statementService.confirmUpload(batchId, rows);
      setSavedSuccess(true);
    } catch (err) {
      setErrorMsg('Failed to save transactions. Please try again.');
    }
  };

  const downloadSampleCsv = () => {
    const sample =
      'Date,Description,Amount,Type\n' +
      '2026-11-01,UPI/swiggy@okhdfcbank/Order9982,340.00,Debit\n' +
      '2026-11-02,UBER INDIA BANGALORE RIDE,185.00,Debit\n' +
      '2026-11-03,COLLEGE SEMESTER FEE ONLINE,32000.00,Debit\n' +
      '2026-11-05,AMAZON PAY RETAIL MUMBAI,1240.00,Debit\n' +
      '2026-11-06,CAMPUS BOOK STORE TEXTBOOKS,850.00,Debit\n' +
      '2026-11-08,JIO PREPAID 3 MONTHS RECHARGE,749.00,Debit\n' +
      '2026-11-10,APOLLO PHARMACY VITAMINS,420.00,Debit\n' +
      '2026-11-13,GROWW INVEST MUTUAL FUND SIP,1500.00,Debit\n' +
      '2026-11-15,NETFLIX SUBSCRIPTION,199.00,Debit\n' +
      '2026-11-16,MONTHLY INTERNSHIP STIPEND,15000.00,Credit\n';

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_bank_statement.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageWrapper>
      <div className="relative max-w-5xl mx-auto space-y-8">
        <CornerDecor variant="dots" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <Tag size={15} />
              <span>Smart Import</span>
            </div>
            <h1 className="text-3xl font-bold text-ink">Upload Bank Statement</h1>
            <p className="text-sm text-muted mt-1">
              Upload your bank statement CSV. Fin will automatically label each purchase using ML.
            </p>
          </div>
          <button
            onClick={downloadSampleCsv}
            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-all flex items-center gap-2 border border-blue-200 self-start md:self-auto"
          >
            <Download size={15} />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {/* Learning alert banner */}
        {learningMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} />
            <span>{learningMsg}</span>
          </div>
        )}

        {/* Privacy Promise Banner */}
        <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-xs flex items-start gap-3">
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600 mt-0.5">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-0.5">
              Privacy Promise
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              We process your statement in temporary memory only. We never save raw bank statement files, account numbers, or bank passwords to any database.
            </p>
          </div>
        </div>

        {!rows.length && !savedSuccess ? (
          /* Upload Dropzone */
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="p-12 rounded-3xl border-2 border-dashed border-blue-200 bg-white text-center hover:border-blue-400 transition-all flex flex-col items-center justify-center space-y-4 shadow-xs"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UploadCloud size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">
                {file ? file.name : 'Drag and drop your bank CSV file here'}
              </h3>
              <p className="text-xs text-muted mt-1">
                Supports Indian banks (HDFC, SBI, ICICI, Axis, Kotak, Paytm Payments Bank)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-all">
                Choose CSV File
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-ink text-white text-xs font-semibold hover:bg-ink/90 transition-all disabled:opacity-50"
                >
                  {uploading ? 'Reading & Categorizing...' : 'Upload & Review'}
                </button>
              )}
            </div>
            {errorMsg && <p className="text-xs text-rose-500 font-semibold">{errorMsg}</p>}
          </div>
        ) : savedSuccess ? (
          /* Success Screen */
          <div className="card-soft p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-bold text-ink">Transactions Added!</h3>
            <p className="text-sm text-muted max-w-md mx-auto">
              Your expenses have been recorded and your Health Score is updated.
            </p>
            <button
              onClick={() => {
                setRows([]);
                setFile(null);
                setSavedSuccess(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-all"
            >
              Upload Another Statement
            </button>
          </div>
        ) : (
          /* Statement Review Table */
          <div className="card-soft p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-ink">Review & Confirm ({rows.length} rows)</h2>
                <p className="text-xs text-muted">
                  Fin labeled these automatically. Change any dropdown if needed — click "Teach Fin" to remember your choice.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRows([])}
                  className="px-3.5 py-2 rounded-xl border border-blue-100 text-xs font-semibold text-muted hover:text-ink hover:bg-blue-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Confirm & Save All</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Unusual alerts */}
            {unusual.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle size={15} />
                  <span>Unusual spending noticed:</span>
                </div>
                {unusual.slice(0, 3).map((u, i) => (
                  <p key={i} className="pl-5 text-amber-800">
                    • ₹{u.amount.toLocaleString('en-IN')} in {u.category} — {u.reason}
                  </p>
                ))}
              </div>
            )}

            {/* Rows list */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-blue-300 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs text-muted shrink-0 w-20">
                      {row.dateStr?.slice(0, 10)}
                    </span>
                    <span className="text-sm font-semibold text-ink truncate" title={row.description}>
                      {row.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                    <span className="text-sm font-bold text-ink">
                      ₹{row.amount?.toLocaleString('en-IN')}
                    </span>

                    <select
                      value={row.category}
                      onChange={(e) => handleCategoryChange(idx, e.target.value)}
                      className="text-xs font-medium bg-blue-50/50 border border-blue-100 rounded-lg px-2.5 py-1.5 text-ink focus:outline-none focus:border-blue-400"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleTeachFin(idx)}
                      title="Remember this rule for future uploads"
                      className="text-2xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shrink-0"
                    >
                      Teach Fin
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
