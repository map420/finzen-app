import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, TrendingUp, Target, Lightbulb } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        <div className="text-center lg:text-left space-y-6 order-2 lg:order-1">
          <div className="inline-block">
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg">
              <Wallet className="w-8 h-8 text-emerald-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                FinZen
              </span>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Toma control de tus finanzas de manera simple
          </h1>

          <p className="text-lg text-gray-600">
            Diseñada para jóvenes que comienzan su viaje financiero. Registra gastos, crea metas de ahorro y mejora tu relación con el dinero.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="flex flex-col items-center lg:items-start gap-2">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Seguimiento visual</p>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-2">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-teal-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Metas de ahorro</p>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-2">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Tips financieros</p>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    required={isSignUp}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Cargando...' : isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition"
              >
                {isSignUp
                  ? '¿Ya tienes cuenta? Inicia sesión'
                  : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
