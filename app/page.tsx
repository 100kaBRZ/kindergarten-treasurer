'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Download, PlusCircle, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

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

  const exportToExcel = () => {
    const data = transactions.map(t => ({
      'ID': t.id,
      'Дата': new Date(t.created_at).toLocaleDateString('ru-RU'),
      'Тип': t.type === 'income' ? 'Доход' : 'Расход',
      'Сумма (₽)': t.amount,
      'Описание': t.description,
      'Ребенок': t.child_name || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 5 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 40 },
      { wch: 20 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Отчет');
    XLSX.writeFile(wb, `otchet_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900"> Казначей Детского сада</h1>
            <p className="text-gray-700 font-medium mt-1">Учет взносов и расходов группы</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <PlusCircle size={18} /> 
              {showForm ? 'Закрыть' : 'Добавить'}
            </button>
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              <Download size={18} /> 
              Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200">
            <div className="flex items-center gap-3 text-green-700 mb-2">
              <TrendingUp size={24} />
              <span className="text-base font-bold">Собрано</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalIncome.toLocaleString()} ₽</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200">
            <div className="flex items-center gap-3 text-red-700 mb-2">
              <TrendingDown size={24} />
              <span className="text-base font-bold">Потрачено</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalExpense.toLocaleString()} ₽</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200">
            <div className="flex items-center gap-3 text-blue-700 mb-2">
              <Wallet size={24} />
              <span className="text-base font-bold">Остаток</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{balance.toLocaleString()} ₽</p>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200 mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Новая операция</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})} 
                className="p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900"
              >
                <option value="income">💰 Взнос (Доход)</option>
                <option value="expense">💸 Расход</option>
              </select>
              <input 
                type="number" 
                placeholder="Сумма" 
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})} 
                className="p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 placeholder-gray-500"
                required 
              />
              <input 
                type="text" 
                placeholder="На что / Кто сдал" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 placeholder-gray-500"
                required 
              />
              <input 
                type="text" 
                placeholder="Имя ребенка" 
                value={formData.child_name} 
                onChange={e => setFormData({...formData, child_name: e.target.value})} 
                className="p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 placeholder-gray-500"
              />
              <button 
                type="submit" 
                className="md:col-span-4 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition font-bold"
              >
                Сохранить операцию
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
          <div className="p-4 border-b-2 flex gap-2 bg-gray-50">
            <Search size={18} className="text-gray-600 mt-2" />
            <input 
              placeholder="Поиск по описанию или имени ребенка..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="w-full p-2 outline-none font-medium text-gray-900 placeholder-gray-600"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-900 text-sm">
                <tr>
                  <th className="p-4 font-bold">Дата</th>
                  <th className="p-4 font-bold">Тип</th>
                  <th className="p-4 font-bold">Описание</th>
                  <th className="p-4 font-bold">Ребенок</th>
                  <th className="p-4 text-right font-bold">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-600 font-medium">
                      Нет операций
                    </td>
                  </tr>
                ) : (
                  filtered.map(t => (
                    <tr key={t.id} className="border-t-2 hover:bg-gray-50 transition">
                      <td className="p-4 text-gray-900 font-medium">
                        {new Date(t.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          t.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {t.type === 'income' ? 'Доход' : 'Расход'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900 font-medium">{t.description}</td>
                      <td className="p-4 text-gray-800 font-medium">{t.child_name || '-'}</td>
                      <td className={`p-4 text-right font-bold text-lg ${
                        t.type === 'income' ? 'text-green-700' : 'text-red-700'
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