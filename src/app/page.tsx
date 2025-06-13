"use client"
import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useToast } from '../hooks/useToast';
import { Header } from '../components/Header';
import { TransactionForm } from '../components/TransactionForm';
import { BalanceOverview } from '../components/BalanceOverview';
import { ExpenseChart } from '../components/ExpenseChart';
import { TransactionList } from '../components/TransactionList';
import { DeleteModal } from '../components/DeleteModal';
import { Toast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Footer } from '@/components/Footer';

export default function ExpenseTracker() {
  const { transactions, loading, addTransaction, deleteTransaction } = useTransactions();
  const { showToast, toastMessage, triggerToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  const handleAddTransaction = (transactionData: any) => {
    addTransaction(transactionData);
  };

  const confirmDelete = (id: number) => {
    setToDeleteId(id);
    setModalOpen(true);
  };

  const handleDeleteTransaction = () => {
    if (toDeleteId !== null) {
      deleteTransaction(toDeleteId);
      triggerToast('Transaction deleted');
    }
    setModalOpen(false);
    setToDeleteId(null);
  };

  // Calculate totals
  const income = transactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
  const balance = income + expenses;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <Header />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <TransactionForm 
              onAddTransaction={handleAddTransaction}
              onShowToast={triggerToast}
            />

            <BalanceOverview 
              balance={balance}
              income={income}
              expenses={expenses}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ExpenseChart transactions={transactions} />
              
              <TransactionList
                transactions={transactions}
                onDeleteTransaction={confirmDelete}
                onShowToast={triggerToast}
              />
            </div>

            <DeleteModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onConfirm={handleDeleteTransaction}
            />

            <Toast show={showToast} message={toastMessage} />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}