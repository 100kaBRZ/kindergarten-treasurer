import { supabase } from '@/lib/db';
import { NextResponse } from 'next/server';

const PLANS = {
  '200': { limit: 200, price: 750 },
  '500': { limit: 500, price: 1490 },
  'unlimited': { limit: 999999, price: 2190 }
};

export async function POST(request: Request) {
  try {
    const { plan } = await request.json();
    
    if (!PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Неверный тариф' }, { status: 400 });
    }

    const planData = PLANS[plan as keyof typeof PLANS];
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `KAZNA-${plan === 'unlimited' ? 'UNLIM' : plan}-${randomStr}`;

    const { data, error } = await supabase
      .from('promo_codes')
      .insert([{
        code,
        limit_type: plan,
        limit_value: planData.limit,
        price: planData.price,
        is_used: false
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      code: data.code,
      limit: planData.limit,
      price: planData.price
    });
  } catch (error) {
    console.error('Generate promo error:', error);
    return NextResponse.json({ error: 'Ошибка генерации' }, { status: 500 });
  }
}