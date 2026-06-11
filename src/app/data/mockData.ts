export interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  paymentMethod: string;
  icon: string;
}

export interface Subscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  billingCycle: 'monthly' | 'annual';
  nextBillingDate: string;
  status: 'active' | 'paused';
  color: string;
  icon: string;
}

export interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  icon: string;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon: string;
  color: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'danger' | 'success';
  date: string;
  read: boolean;
}

export const mockTransactions: Transaction[] = [
  { id: '1', description: 'Salario Empresa ABC', category: 'Ingresos', amount: 3800, type: 'income', date: '2024-06-01', paymentMethod: 'Transferencia', icon: '💼' },
  { id: '2', description: 'Freelance diseño web', category: 'Ingresos', amount: 650, type: 'income', date: '2024-06-03', paymentMethod: 'PayPal', icon: '💻' },
  { id: '3', description: 'Supermercado Mercadona', category: 'Alimentación', amount: 127.50, type: 'expense', date: '2024-06-04', paymentMethod: 'Tarjeta débito', icon: '🛒' },
  { id: '4', description: 'Netflix', category: 'Entretenimiento', amount: 17.99, type: 'expense', date: '2024-06-05', paymentMethod: 'Tarjeta crédito', icon: '🎬' },
  { id: '5', description: 'Restaurante La Pepita', category: 'Restaurantes', amount: 43.20, type: 'expense', date: '2024-06-06', paymentMethod: 'Tarjeta crédito', icon: '🍽️' },
  { id: '6', description: 'Gasolina Shell', category: 'Transporte', amount: 65.00, type: 'expense', date: '2024-06-07', paymentMethod: 'Tarjeta débito', icon: '⛽' },
  { id: '7', description: 'Gimnasio FitLife', category: 'Salud', amount: 39.99, type: 'expense', date: '2024-06-08', paymentMethod: 'Domiciliación', icon: '💪' },
  { id: '8', description: 'Farmacia Cruz Verde', category: 'Salud', amount: 28.40, type: 'expense', date: '2024-06-09', paymentMethod: 'Efectivo', icon: '💊' },
  { id: '9', description: 'Amazon Prime', category: 'Entretenimiento', amount: 9.99, type: 'expense', date: '2024-06-10', paymentMethod: 'Tarjeta crédito', icon: '📦' },
  { id: '10', description: 'Alquiler piso', category: 'Vivienda', amount: 850, type: 'expense', date: '2024-06-01', paymentMethod: 'Transferencia', icon: '🏠' },
  { id: '11', description: 'Luz y agua', category: 'Suministros', amount: 94.30, type: 'expense', date: '2024-06-02', paymentMethod: 'Domiciliación', icon: '💡' },
  { id: '12', description: 'Spotify', category: 'Entretenimiento', amount: 10.99, type: 'expense', date: '2024-06-11', paymentMethod: 'Tarjeta crédito', icon: '🎵' },
  { id: '13', description: 'Zara ropa', category: 'Moda', amount: 89.90, type: 'expense', date: '2024-06-12', paymentMethod: 'Tarjeta crédito', icon: '👕' },
  { id: '14', description: 'Dividendos inversiones', category: 'Ingresos', amount: 220, type: 'income', date: '2024-06-13', paymentMethod: 'Transferencia', icon: '📈' },
  { id: '15', description: 'Café y desayunos', category: 'Alimentación', amount: 52.60, type: 'expense', date: '2024-06-14', paymentMethod: 'Efectivo', icon: '☕' },
  { id: '16', description: 'Metro mensual', category: 'Transporte', amount: 54.60, type: 'expense', date: '2024-06-01', paymentMethod: 'Tarjeta transporte', icon: '🚇' },
  { id: '17', description: 'Adobe Creative Cloud', category: 'Software', amount: 59.99, type: 'expense', date: '2024-06-15', paymentMethod: 'Tarjeta crédito', icon: '🎨' },
  { id: '18', description: 'Comida rápida Burger King', category: 'Restaurantes', amount: 18.40, type: 'expense', date: '2024-06-16', paymentMethod: 'Efectivo', icon: '🍔' },
  { id: '19', description: 'Libros Amazon Kindle', category: 'Educación', amount: 34.97, type: 'expense', date: '2024-06-17', paymentMethod: 'Tarjeta crédito', icon: '📚' },
  { id: '20', description: 'Seguro coche', category: 'Seguros', amount: 78.00, type: 'expense', date: '2024-06-01', paymentMethod: 'Domiciliación', icon: '🚗' },
];

export const mockSubscriptions: Subscription[] = [
  { id: '1', name: 'Netflix', category: 'Entretenimiento', amount: 17.99, billingCycle: 'monthly', nextBillingDate: '2024-07-05', status: 'active', color: '#E50914', icon: '🎬' },
  { id: '2', name: 'Spotify Premium', category: 'Música', amount: 10.99, billingCycle: 'monthly', nextBillingDate: '2024-07-11', status: 'active', color: '#1DB954', icon: '🎵' },
  { id: '3', name: 'Adobe Creative Cloud', category: 'Software', amount: 59.99, billingCycle: 'monthly', nextBillingDate: '2024-07-15', status: 'active', color: '#FF0000', icon: '🎨' },
  { id: '4', name: 'Amazon Prime', category: 'Compras', amount: 9.99, billingCycle: 'monthly', nextBillingDate: '2024-07-10', status: 'active', color: '#FF9900', icon: '📦' },
  { id: '5', name: 'Gimnasio FitLife', category: 'Salud', amount: 39.99, billingCycle: 'monthly', nextBillingDate: '2024-07-08', status: 'active', color: '#0066CC', icon: '💪' },
  { id: '6', name: 'iCloud 200GB', category: 'Almacenamiento', amount: 3.99, billingCycle: 'monthly', nextBillingDate: '2024-07-20', status: 'active', color: '#007AFF', icon: '☁️' },
  { id: '7', name: 'YouTube Premium', category: 'Entretenimiento', amount: 13.99, billingCycle: 'monthly', nextBillingDate: '2024-07-22', status: 'paused', color: '#FF0000', icon: '▶️' },
  { id: '8', name: 'LinkedIn Premium', category: 'Profesional', amount: 39.99, billingCycle: 'monthly', nextBillingDate: '2024-07-18', status: 'paused', color: '#0A66C2', icon: '💼' },
  { id: '9', name: 'Notion', category: 'Productividad', amount: 16.00, billingCycle: 'monthly', nextBillingDate: '2024-07-25', status: 'active', color: '#000000', icon: '📝' },
  { id: '10', name: 'Figma Professional', category: 'Diseño', amount: 15.00, billingCycle: 'monthly', nextBillingDate: '2024-07-30', status: 'active', color: '#F24E1E', icon: '✏️' },
];

export const mockBudgets: Budget[] = [
  { id: '1', category: 'Alimentación', allocated: 400, spent: 180.10, icon: '🛒', color: '#059669' },
  { id: '2', category: 'Restaurantes', allocated: 150, spent: 61.60, icon: '🍽️', color: '#0ea5e9' },
  { id: '3', category: 'Transporte', allocated: 200, spent: 119.60, icon: '🚇', color: '#f59e0b' },
  { id: '4', category: 'Entretenimiento', allocated: 80, spent: 38.97, icon: '🎬', color: '#8b5cf6' },
  { id: '5', category: 'Salud', allocated: 100, spent: 68.39, icon: '💪', color: '#06b6d4' },
  { id: '6', category: 'Moda', allocated: 100, spent: 89.90, icon: '👕', color: '#ec4899' },
  { id: '7', category: 'Vivienda', allocated: 900, spent: 944.30, icon: '🏠', color: '#ef4444' },
  { id: '8', category: 'Software', allocated: 100, spent: 59.99, icon: '💻', color: '#f97316' },
];

export const mockGoals: Goal[] = [
  { id: '1', name: 'Fondo de emergencia', targetAmount: 10000, currentAmount: 6240, targetDate: '2024-12-31', icon: '🛡️', color: '#059669' },
  { id: '2', name: 'Vacaciones Japón', targetAmount: 3500, currentAmount: 1200, targetDate: '2025-03-15', icon: '✈️', color: '#0ea5e9' },
  { id: '3', name: 'MacBook Pro nuevo', targetAmount: 2499, currentAmount: 2100, targetDate: '2024-08-01', icon: '💻', color: '#8b5cf6' },
  { id: '4', name: 'Inversión inicial ETF', targetAmount: 5000, currentAmount: 850, targetDate: '2025-06-30', icon: '📈', color: '#f59e0b' },
];

export const mockAlerts: Alert[] = [
  { id: '1', title: 'Cobro próximo: Adobe Creative Cloud', description: 'Se cobrarán €59.99 en 3 días (15 Jun)', type: 'warning', date: '2024-06-12', read: false },
  { id: '2', title: 'Presupuesto de Vivienda excedido', description: 'Has gastado €44.30 más de tu presupuesto mensual de €900', type: 'danger', date: '2024-06-11', read: false },
  { id: '3', title: 'Presupuesto de Moda al 89%', description: 'Has usado €89.90 de €100 en tu presupuesto de Moda', type: 'warning', date: '2024-06-12', read: false },
  { id: '4', title: 'Cobro próximo: Spotify Premium', description: 'Se cobrarán €10.99 en 11 días (11 Jul)', type: 'info', date: '2024-06-10', read: true },
  { id: '5', title: 'Gasto inusual detectado', description: 'Detectamos un gasto de €89.90 en Moda, superior a tu media mensual', type: 'warning', date: '2024-06-12', read: false },
  { id: '6', title: 'Meta MacBook Pro al 84%', description: '¡Casi lo logras! Solo te faltan €399 para tu meta', type: 'success', date: '2024-06-10', read: true },
  { id: '7', title: 'Ahorro mensual superior al objetivo', description: 'Este mes ahorraste €430 más que tu media de los últimos 3 meses', type: 'success', date: '2024-06-09', read: true },
];

export const monthlyData = [
  { month: 'Ene', ingresos: 4200, gastos: 2900, ahorro: 1300 },
  { month: 'Feb', ingresos: 4200, gastos: 3200, ahorro: 1000 },
  { month: 'Mar', ingresos: 4650, gastos: 2800, ahorro: 1850 },
  { month: 'Abr', ingresos: 4200, gastos: 3100, ahorro: 1100 },
  { month: 'May', ingresos: 5100, gastos: 3400, ahorro: 1700 },
  { month: 'Jun', ingresos: 4670, gastos: 2730, ahorro: 1940 },
];

export const categoryExpenses = [
  { name: 'Vivienda', value: 944, color: '#ef4444' },
  { name: 'Alimentación', value: 360, color: '#059669' },
  { name: 'Transporte', value: 120, color: '#f59e0b' },
  { name: 'Restaurantes', value: 62, color: '#0ea5e9' },
  { name: 'Salud', value: 68, color: '#06b6d4' },
  { name: 'Software', value: 228, color: '#8b5cf6' },
  { name: 'Moda', value: 90, color: '#ec4899' },
  { name: 'Otros', value: 158, color: '#64748b' },
];

export const savingsEvolution = [
  { month: 'Ene', total: 4800 },
  { month: 'Feb', total: 5800 },
  { month: 'Mar', total: 7650 },
  { month: 'Abr', total: 8750 },
  { month: 'May', total: 10450 },
  { month: 'Jun', total: 12390 },
];
