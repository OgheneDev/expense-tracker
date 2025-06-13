import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Transaction } from '@/types/types';

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
  onDelete: (id: number) => void;
}

export const TransactionItem = ({ transaction, index, onDelete }: TransactionItemProps) => {
  const formatter = new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
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
          {transaction.amount >= 0 ? '+' : '-'}₦{formatter.format(Math.abs(transaction.amount))}
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(transaction.id)}
          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};