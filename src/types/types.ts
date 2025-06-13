export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

export type FilterType = 'all' | 'income' | 'expenses';
export type DateRangeType = 'all' | 'week' | 'month';

export interface TransactionInput {
  description: string;
  amount: number;
  category: string;
  date: string;
}

