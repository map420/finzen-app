import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, Target, DollarSign, Calendar, Wallet } from 'lucide-react';

interface SavingsGoalFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const GOAL_ICONS = [
  { value: 'target', label: 'General' },
  { value: 'home', label: 'Casa' },
  { value: 'car', label: 'Auto' },
  { value: 'plane', label: 'Viaje' },
  { value: 'graduation-cap', label: 'Educación' },
  { value: 'heart', label: 'Salud' },
  { value: 'gift', label: 'Regalo' },
  { value: 'smartphone', label: 'Tecnología' }
];

export default function SavingsGoalForm({ onClose, onSuccess }: SavingsGoalFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('target');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.from('savings_goals').insert({
        user_id: user.id,
        title,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount),
        deadline: deadline || null,
        icon
      });

      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear la meta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Nueva meta de ahorro</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Nombre de la meta
              </div>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="Ej: Viaje a la playa"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Monto objetivo
              </div>
            </label>
            <input
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Monto inicial
              </div>
            </label>
            <input
              type="number"
              step="0.01"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              ¿Ya tienes algo ahorrado para esta meta?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha límite (opcional)
              </div>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ícono
            </label>
            <div className="grid grid-cols-4 gap-3">
              {GOAL_ICONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setIcon(value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${
                    icon === value
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xs text-gray-600 mt-1">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
