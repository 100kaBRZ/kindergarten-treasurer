import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { plan } = await request.json();

    const limits = {
      '200': 200,
      '500': 500,
      'unlimited': 999999
    };

    const prices = {
      '200': 750,
      '500': 1490,
      'unlimited': 2190
    };

    if (!limits[plan as keyof typeof limits]) {
      return NextResponse.json({ error: 'Неверный тариф' }, { status: 400 });
    }

    // Генерируем случайный промокод
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `KAZNA-${plan === 'unlimited' ? 'UNLIM' : plan}-${randomStr}`;

    const { data, error } = await supabase
      .from('promo_codes')
      .insert([{
        code,
        limit_type: plan,
        limit_value: limits[plan as keyof typeof limits],
        price: prices[plan as keyof typeof prices],
        is_used: false
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, code: data.code });
  } catch (error) {
    console.error('Generate promo error:', error);
    return NextResponse.json({ error: 'Ошибка генерации' }, { status: 500 });
  }
}