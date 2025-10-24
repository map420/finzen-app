/*
  # FinZen Database Schema

  ## Overview
  Complete database setup for FinZen personal finance application designed for young users
  starting their financial management journey.

  ## New Tables
  
  ### 1. `users_profile`
  Extended user profile information
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `currency` (text) - Preferred currency (default: 'USD')
  - `monthly_budget` (numeric) - Optional monthly budget limit
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `transactions`
  All financial transactions (income and expenses)
  - `id` (uuid, primary key) - Unique transaction ID
  - `user_id` (uuid) - Reference to auth.users
  - `type` (text) - 'income' or 'expense'
  - `amount` (numeric) - Transaction amount
  - `category` (text) - Transaction category
  - `description` (text) - Transaction description
  - `date` (date) - Transaction date
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `savings_goals`
  User savings goals and targets
  - `id` (uuid, primary key) - Unique goal ID
  - `user_id` (uuid) - Reference to auth.users
  - `title` (text) - Goal name
  - `target_amount` (numeric) - Target amount to save
  - `current_amount` (numeric) - Current saved amount
  - `deadline` (date) - Optional target date
  - `icon` (text) - Icon identifier for visual representation
  - `completed` (boolean) - Completion status
  - `created_at` (timestamptz) - Goal creation timestamp

  ### 4. `financial_tips`
  Curated financial tips and advice
  - `id` (uuid, primary key) - Unique tip ID
  - `title` (text) - Tip title
  - `content` (text) - Tip content
  - `category` (text) - Tip category (saving, budgeting, investing, etc.)
  - `created_at` (timestamptz) - Tip creation timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Financial tips are publicly readable
  
  ### Policies
  - Users can perform all CRUD operations on their own transactions
  - Users can manage their own savings goals
  - Users can read and update their own profile
  - All users can read financial tips
  
  ## Important Notes
  - All monetary amounts use numeric type for precision
  - Timestamps use timestamptz for timezone awareness
  - Foreign keys ensure data integrity
  - Indexes added for performance on frequently queried columns
*/

-- Create users_profile table
CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  currency text DEFAULT 'USD',
  monthly_budget numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric NOT NULL CHECK (amount > 0),
  category text NOT NULL,
  description text DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  target_amount numeric NOT NULL CHECK (target_amount > 0),
  current_amount numeric DEFAULT 0 CHECK (current_amount >= 0),
  deadline date,
  icon text DEFAULT 'target',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create financial_tips table
CREATE TABLE IF NOT EXISTS financial_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);

-- Enable Row Level Security
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_tips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users_profile
CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for savings_goals
CREATE POLICY "Users can view own goals"
  ON savings_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON savings_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON savings_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON savings_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for financial_tips
CREATE POLICY "Anyone can view financial tips"
  ON financial_tips FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample financial tips
INSERT INTO financial_tips (title, content, category) VALUES
  ('Regla 50/30/20', 'Divide tu ingreso: 50% necesidades, 30% gustos, 20% ahorro. Simple y efectivo para empezar.', 'budgeting'),
  ('Ahorra primero', 'Apenas recibas tu sueldo, separa el dinero para ahorro. Lo que no ves, no lo gastas.', 'saving'),
  ('Presupuesto semanal', 'Empieza con presupuestos semanales en lugar de mensuales. Es más fácil de controlar.', 'budgeting'),
  ('Fondo de emergencia', 'Intenta ahorrar al menos 3 meses de gastos básicos. Te dará tranquilidad financiera.', 'saving'),
  ('Compara antes de comprar', 'Espera 24 horas antes de hacer compras grandes. Muchas veces el impulso se pasa.', 'spending'),
  ('Automatiza tu ahorro', 'Configura transferencias automáticas a tu cuenta de ahorro cada mes.', 'saving'),
  ('Revisa tus suscripciones', 'Cancela servicios que no uses. Son pequeños gastos que suman mucho al mes.', 'spending'),
  ('Cocina en casa', 'Comer fuera es caro. Cocinar en casa puede ahorrarte cientos al mes.', 'spending')
ON CONFLICT DO NOTHING;