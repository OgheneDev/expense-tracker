import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Minus, Plus } from 'lucide-react';

interface TransactionFormProps {
  onAddTransaction: (transaction: {
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
  }) => void;
  onShowToast: (message: string) => void;
}

export const TransactionForm = ({ onAddTransaction, onShowToast }: TransactionFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!description || isNaN(amt) || amt <= 0) {
      onShowToast('Please enter valid description and amount');
      return;
    }
    
    onAddTransaction({
      description,
      amount: transactionType === 'expense' ? -amt : amt,
      category,
      type: transactionType,
    });

    setDescription('');
    setAmount('');
    setCategory('General');
    onShowToast(`${transactionType === 'expense' ? 'Expense' : 'Income'} added successfully!`);
  };

  return (
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
          onClick={handleSubmit}
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
  );
};