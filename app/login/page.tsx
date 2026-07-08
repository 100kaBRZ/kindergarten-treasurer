import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params?.error;

  async function login(formData: FormData) {
    'use server';
    const password = formData.get('password');
    if (password === process.env.ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set('admin_token', password as string, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 14,
        path: '/'
      });
      redirect('/');
    }
    redirect('/login?error=invalid');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🔐 Казначей</h1>
          <p className="text-gray-500 text-sm mt-1">Детский сад №XX</p>
        </div>
        <form action={login} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center">Неверный пароль</p>}
          <input
            name="password"
            type="password"
            placeholder="Пароль казначея"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Войти
          </button>
        </form>
      </div>
    </main>
  );
}