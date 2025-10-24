import { useState } from 'react';
import { Transaction } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { Clock, TrendingUp, TrendingDown, Trash2, Filter } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onUpdate: () => void;
}

export default function TransactionHistory({ transactions, onUpdate }: TransactionHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

    if (dateFilter !== 'all') {
      const transactionDate = new Date(t.date);
      const now = new Date();

      if (dateFilter === 'today') {
        return transactionDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= weekAgo;
      } else if (dateFilter === 'month') {
        return (
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      }
    }

    return true;
  });

  const allCategories = Array.from(new Set(transactions.map(t => t.category)));

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta transacción?')) return;

    try {
      await supabase.from('transactions').delete().eq('id', id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">Historial</h2>
        </div>
        <span className="text-sm text-gray-500">
          {filteredTransactions.length} transacciones
        </span>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'income'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ingresos
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'expense'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Gastos
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent capitalize"
          >
            <option value="all">Todas las categorías</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat} className="capitalize">
                {cat}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">Todo el tiempo</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay transacciones</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all'
              ? 'Intenta cambiar los filtros'
              : 'Comienza registrando tu primera transacción'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredTransactions.map(transaction => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    transaction.type === 'income'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}
                >
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded capitalize">
                      {transaction.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {transaction.description || 'Sin descripción'}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-lg font-bold ${
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}$
                    {Number(transaction.amount).toLocaleString('es-MX', {
                      minimumFractionDigits: 2
                    })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(transaction.id)}
                className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
