import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Transaction } from '@/types/types';

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface ExpenseChartProps {
  transactions: Transaction[];
}

export const ExpenseChart = ({ transactions }: ExpenseChartProps) => {
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

  if (Object.keys(expenseByCategory).length === 0) {
    return null;
  }

  return (
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
  );
};