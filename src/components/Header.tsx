import { motion } from 'framer-motion';

export const Header = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h1 className="text-4xl font-bold text-white mb-2">💰 Expense Tracker</h1>
      <p className="text-gray-400">Take control of your finances</p>
    </motion.div>
  );
};