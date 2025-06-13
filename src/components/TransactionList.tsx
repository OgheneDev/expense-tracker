import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import { Transaction, FilterType, DateRangeType } from '@/types/types';
import { TransactionFilters } from './TransactionFilters';
import { TransactionItem } from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: number) => void;
  onShowToast: (message: string) => void;
}

export const TransactionList = ({ transactions, onDeleteTransaction, onShowToast }: TransactionListProps) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [dateRange, setDateRange] = useState<DateRangeType>('all');

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
    onShowToast('CSV exported successfully!');
  };

  const exportPDF = () => {
    const income = transactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
    const balance = income + expenses;
    const formatter = new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
              <div><strong>Total Balance:</strong> ₦${formatter.format(balance)}</div>
              <div><strong>Total Income:</strong> <span class="income">₦${formatter.format(income)}</span></div>
              <div><strong>Total Expenses:</strong> <span class="expense">₦${formatter.format(Math.abs(expenses))}</span></div>
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
                    <td class="${t.amount > 0 ? 'income' : 'expense'}">₦${formatter.format(Math.abs(t.amount))}</td>
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
      onShowToast('PDF export initiated!');
    }
  };

  return (
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

      <TransactionFilters
        filter={filter}
        setFilter={setFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="space-y-2 max-h-80 overflow-y-auto">
        <AnimatePresence>
          {filteredTransactions.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No transactions found. Add your first transaction above!
            </div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                index={index}
                onDelete={onDeleteTransaction}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};