'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Download, PlusCircle, Search } from 'lucide-react';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  child_name: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    child_name: ''
  });

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(search.toLowerCase()) || 
    (t.child_name && t.child_name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      const newTransaction = await res.json();
      setTransactions([newTransaction, ...transactions]);
      setShowForm(false);
      setFormData({ type: 'income', amount: '', description: '', child_name: '' });
    } else {
      alert('Ошибка при сохранении');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏫 Казначей Детского сада</h1>
            <p className="text-gray-500 mt-1">Учет взносов и расходов группы</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <PlusCircle size={18} /> 
              {showForm ? 'Закрыть' : 'Добавить'}
            </button>
            <a 
              href="/api/export" 
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <Download size={18} /> 
              Экспорт CSV
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 text-green-600 mb-2">
              <TrendingUp size={20} />
              <span className="text-sm font-medium">Собрано</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalIncome.toLocaleString()} ₽</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <TrendingDown size={20} />
              <span className="text-sm font-medium">Потрачено</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalExpense.toLocaleString()} ₽</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 text-blue-600 mb-2">
              <Wallet size={20} />
              <span className="text-sm font-medium">Остаток</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{balance.toLocaleString()} ₽</p>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold mb-4">Новая операция</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})} 
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="income"> Взнос (Доход)</option>
                <option value="expense">💸 Расход</option>
              </select>
              <input 
                type="number" 
                placeholder="Сумма" 
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})} 
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required 
              />
              <input 
                type="text" 
                placeholder="На что / Кто сдал" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required 
              />
              <input 
                type="text" 
                placeholder="Имя ребенка (необяз.)" 
                value={formData.child_name} 
                onChange={e => setFormData({...formData, child_name: e.target.value})} 
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                type="submit" 
                className="md:col-span-4 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition mt-2"
              >
                Сохранить операцию
              </button>
            </form>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex gap-2">
            <Search size={18} className="text-gray-400 mt-2" />
            <input 
              placeholder="Поиск по описанию или имени ребенка..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="w-full p-2 outline-none"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="p-4">Дата</th>
                  <th className="p-4">Тип</th>
                  <th className="p-4">Описание</th>
                  <th className="p-4">Ребенок</th>
                  <th className="p-4 text-right">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      Нет операций
                    </td>
                  </tr>
                ) : (
                  filtered.map(t => (
                    <tr key={t.id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(t.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          t.type === 'income' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {t.type === 'income' ? 'Доход' : 'Расход'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-800">{t.description}</td>
                      <td className="p-4 text-gray-500">{t.child_name || '-'}</td>
                      <td className={`p-4 text-right font-bold ${
                        t.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} ₽
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}