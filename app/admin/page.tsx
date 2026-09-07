'use client';

import { useState } from 'react';
import { Copy, Check, Key } from 'lucide-react';

const PLANS = [
  { id: '200', name: '200 записей', price: 750, color: 'blue' },
  { id: '500', name: '500 записей', price: 1490, color: 'purple' },
  { id: 'unlimited', name: 'Безлимит', price: 2190, color: 'gold' }
];

export default function AdminPage() {
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateCode = async (plan: string) => {
    setLoading(plan);
    try {
      const res = await fetch('/api/admin/generate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedCodes([data, ...generatedCodes]);
      } else {
        alert('Ошибка: ' + data.error);
      }
    } catch (error) {
      alert('Ошибка генерации');
    }
    setLoading(null);
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <Key size={32} />
          Генератор промокодов
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => generateCode(plan.id)}
              disabled={loading !== null}
              className={`p-6 rounded-xl border-2 transition font-bold text-white ${
                plan.color === 'blue' ? 'border-blue-500 bg-blue-600 hover:bg-blue-700' :
                plan.color === 'purple' ? 'border-purple-500 bg-purple-600 hover:bg-purple-700' :
                'border-yellow-500 bg-yellow-600 hover:bg-yellow-700'
              } disabled:opacity-50`}
            >
              <p className="text-xl mb-2">{plan.name}</p>
              <p className="text-2xl">{plan.price.toLocaleString()} ₽</p>
              {loading === plan.id && <p className="text-sm mt-2">Генерация...</p>}
            </button>
          ))}
        </div>

        {generatedCodes.length > 0 && (
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Сгенерированные коды</h2>
            <div className="space-y-2">
              {generatedCodes.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{item.code}</p>
                    <p className="text-sm text-gray-600">
                      {item.limit === 999999 ? 'Безлимит' : item.limit + ' записей'} • {item.price} ₽
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.code, idx.toString())}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {copiedId === idx.toString() ? (
                      <>
                        <Check size={16} /> Скопировано
                      </>
                    ) : (
                      <>
                        <Copy size={16} /> Копировать
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}