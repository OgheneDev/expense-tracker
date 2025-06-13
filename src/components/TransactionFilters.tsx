import { motion } from 'framer-motion';
import { FilterType, DateRangeType } from '@/types/types';

interface TransactionFiltersProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  dateRange: DateRangeType;
  setDateRange: (range: DateRangeType) => void;
  sortBy: 'date' | 'amount';
  setSortBy: (sort: 'date' | 'amount') => void;
}

export const TransactionFilters = ({
  filter,
  setFilter,
  dateRange,
  setDateRange,
  sortBy,
  setSortBy,
}: TransactionFiltersProps) => {
  return (
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
  );
};