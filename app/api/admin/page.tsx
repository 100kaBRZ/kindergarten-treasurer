'use client';
import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('200');
  const [copied, setCopied] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Неверный пароль');
    }
  };

  const generateCode = async () => {
    const res = await fetch('/api/admin/generate-promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: selectedPlan })
    });

    const data = await res.json();
    if (res.ok) {
      setGeneratedCode(data.code);
      setCopied(false);
    } else {
      alert('Ошибка: ' + data.error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">🔐 Админ-панель</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8">🔧 Админ-панель: Генерация промокодов</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Создать новый промокод</h2>
            <div className="flex gap-4 mb-4">
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="flex-1 p-3 border-2 border-gray-300 rounded-lg"
              >
                <option value="200">Расширенный (200 записей) - 750 ₽</option>
                <option value="500">Профессиональный (500 записей) - 1490 ₽</option>
                <option value="unlimited">Безлимит - 2190 ₽</option>
              </select>
              <button
                onClick={generateCode}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
              >
                Сгенерировать
              </button>
            </div>

            {generatedCode && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium mb-1">Промокод создан:</p>
                    <p className="text-2xl font-bold text-green-900">{generatedCode}</p>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Скопировано!' : 'Копировать'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <h3 className="font-bold text-yellow-900 mb-2">📋 Инструкция:</h3>
            <ol className="list-decimal list-inside space-y-1 text-yellow-800">
              <li>Выберите тариф</li>
              <li>Нажмите "Сгенерировать"</li>
              <li>Скопируйте промокод и отправьте клиенту</li>
              <li>Клиент вводит промокод в разделе "Активация промокода"</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}