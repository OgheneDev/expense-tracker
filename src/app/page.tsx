"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Download, FileText, PlusCircle, TrendingUp, TrendingDown, DollarSign, Minus, Plus } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

type FilterType = 'all' | 'income' | 'expenses';
type DateRangeType = 'all' | 'week' | 'month';

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [dateRange, setDateRange] = useState<DateRangeType>('all');

  // Load transactions from localStorage on component mount
  useEffect(() => {
    setLoading(true);
    try {
      const savedTransactions = localStorage.getItem('transactions');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      triggerToast('Error loading transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    const amt = parseFloat(amount);
    if (!description || isNaN(amt) || amt <= 0) {
      triggerToast('Please enter valid description and amount');
      return;
    }
    
    const newTransaction = {
      id: Date.now(),
      description,
      amount: transactionType === 'expense' ? -amt : amt,
      category,
      date: new Date().toISOString(),
      type: transactionType,
    };
    
    setTransactions([newTransaction, ...transactions]);
    setDescription('');
    setAmount('');
    setCategory('General');
    triggerToast(`${transactionType === 'expense' ? 'Expense' : 'Income'} added successfully!`);
  };

  const confirmDelete = (id: number) => {
    setToDeleteId(id);
    setModalOpen(true);
  };

  const deleteTransaction = () => {
    if (toDeleteId !== null) {
      setTransactions(transactions.filter((t) => t.id !== toDeleteId));
      triggerToast('Transaction deleted');
    }
    setModalOpen(false);
    setToDeleteId(null);
  };

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const isWithinDateRange = (date: string) => {
    if (dateRange === 'all') return true;
    const now = new Date();
    const txnDate = new Date(date);
    if (dateRange === 'week') {
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      return txnDate >= lastWeek;
    }
    if (dateRange === 'month') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      return txnDate >= lastMonth;
    }
    return true;
  };

  const filteredTransactions = transactions
    .filter((t) => {
      if (filter === 'income' && t.amount <= 0) return false;
      if (filter === 'expenses' && t.amount >= 0) return false;
      return isWithinDateRange(t.date);
    })
    .sort((a, b) => {
      if (sortBy === 'amount') return Math.abs(b.amount) - Math.abs(a.amount);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const income = transactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
  const balance = income + expenses;

  const expenseByCategory = transactions.reduce<Record<string, number>>((acc, t) => {
    if (t.amount < 0) {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    }
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(expenseByCategory),
    datasets: [
      {
        data: Object.values(expenseByCategory),
        backgroundColor: [
          '#3B82F6',
          '#8B5CF6',
          '#EC4899',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#06B6D4',
          '#84CC16'
        ],
        borderColor: '#374151',
        borderWidth: 2,
      },
    ],
  };

  const exportCSV = () => {
    const csv = [
      ['Description', 'Amount', 'Category', 'Type', 'Date'],
      ...transactions.map((t) => [
        t.description, 
        Math.abs(t.amount), 
        t.category, 
        t.amount > 0 ? 'Income' : 'Expense',
        new Date(t.date).toLocaleDateString()
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('CSV exported successfully!');
  };

  const exportPDF = () => {
    // Create a simple PDF using HTML and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = `
        <html>
          <head>
            <title>Expense Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1f2937; text-align: center; }
              .summary { display: flex; justify-content: space-around; margin: 20px 0; }
              .summary div { text-align: center; padding: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background-color: #f3f4f6; }
              .income { color: #10b981; }
              .expense { color: #ef4444; }
            </style>
          </head>
          <body>
            <h1>Expense Tracker Report</h1>
            <div class="summary">
              <div><strong>Total Balance:</strong> ₦${balance.toFixed(2)}</div>
              <div><strong>Total Income:</strong> <span class="income">₦${income.toFixed(2)}</span></div>
              <div><strong>Total Expenses:</strong> <span class="expense">₦${Math.abs(expenses).toFixed(2)}</span></div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.map(t => `
                  <tr>
                    <td>${new Date(t.date).toLocaleDateString()}</td>
                    <td>${t.description}</td>
                    <td>${t.category}</td>
                    <td>${t.amount > 0 ? 'Income' : 'Expense'}</td>
                    <td class="${t.amount > 0 ? 'income' : 'expense'}">₦${Math.abs(t.amount).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
      triggerToast('PDF export initiated!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-2">💰 Expense Tracker</h1>
          <p className="text-gray-400">Take control of your finances</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Add Transaction Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Add New Transaction
              </h2>
              
              {/* Transaction Type Toggle */}
              <div className="flex gap-2 mb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTransactionType('expense')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    transactionType === 'expense'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  Expense
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTransactionType('income')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    transactionType === 'income'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Income
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="General">General</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addTransaction}
                  className={`px-6 py-3 text-white rounded-lg font-semibold transition-all shadow-lg ${
                    transactionType === 'expense' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Add {transactionType === 'expense' ? 'Expense' : 'Income'}
                </motion.button>
              </div>
            </motion.div>

            {/* Balance Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Balance</p>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₦{balance.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Income</p>
                    <p className="text-2xl font-bold text-green-400">₦{income.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-400">₦{Math.abs(expenses).toFixed(2)}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-400" />
                </div>
              </div>
            </motion.div>

            {/* Chart and Transactions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Expense Chart */}
              {Object.keys(expenseByCategory).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">Expenses by Category</h3>
                  <div className="h-64">
                    <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                  </div>
                </motion.div>
              )}

              {/* Transactions List */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={exportCSV}
                      className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2 text-sm border border-gray-600"
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={exportPDF}
                      className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2 text-sm border border-gray-600"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </motion.button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {['all', 'income', 'expenses'].map((filterType) => (
                    <motion.button
                      key={filterType}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFilter(filterType as FilterType)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filter === filterType
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    </motion.button>
                  ))}
                  
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as DateRangeType)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                  </select>
                </div>

                {/* Transaction List */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  <AnimatePresence>
                    {filteredTransactions.length === 0 ? (
                      <div className="text-gray-400 text-center py-8">
                        No transactions found. Add your first transaction above!
                      </div>
                    ) : (
                      filteredTransactions.map((transaction, index) => (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-650 transition-all"
                        >
                          <div className="flex-1">
                            <p className="text-white font-medium">{transaction.description}</p>
                            <p className="text-gray-400 text-sm">
                              {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-bold ${
                                transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {transaction.amount >= 0 ? '+' : '-'}₦{Math.abs(transaction.amount).toFixed(2)}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => confirmDelete(transaction.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {modalOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                  onClick={() => setModalOpen(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gray-800 rounded-2xl p-6 border border-gray-700 max-w-sm mx-4"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Delete Transaction</h3>
                    <p className="text-gray-300 mb-6">Are you sure you want to delete this transaction? This action cannot be undone.</p>
                    <div className="flex gap-3 justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all border border-gray-600"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={deleteTransaction}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 50, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: 50, x: '-50%' }}
                  className="fixed bottom-4 left-1/2 transform bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
                >
                  {toastMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}