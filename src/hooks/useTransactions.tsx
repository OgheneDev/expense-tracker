import { useState, useEffect } from 'react';
import { Transaction } from '@/types/types';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load transactions from localStorage on initial mount
  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
    setLoading(false);
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions, loading]);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...transactionData
    };
    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prevTransactions => 
      prevTransactions.filter(transaction => transaction.id !== id)
    );
  };

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction
  };
};