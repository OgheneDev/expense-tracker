import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface BalanceOverviewProps {
  balance: number;
  income: number;
  expenses: number;
}

export const BalanceOverview = ({ balance, income, expenses }: BalanceOverviewProps) => {
  const formatter = new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
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
              ₦{formatter.format(balance)} 
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-blue-400" />
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Income</p>
            <p className="text-2xl font-bold text-green-400">₦{formatter.format(income)}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-400" />
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Expenses</p>
            <p className="text-2xl font-bold text-red-400">₦{formatter.format(Math.abs(expenses))}</p>
          </div>
          <TrendingDown className="w-8 h-8 text-red-400" />
        </div>
      </div>
    </motion.div>
  );
};