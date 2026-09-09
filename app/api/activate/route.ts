import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Введите промокод' }, { status: 400 });
    }

    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_used', false)
      .single();

    if (error || !promoCode) {
      return NextResponse.json({ error: 'Промокод не найден или уже использован' }, { status: 404 });
    }

    // Помечаем промокод как использованный
    await supabase
      .from('promo_codes')
      .update({ 
        is_used: true, 
        used_by: 'user',
        activated_at: new Date().toISOString()
      })
      .eq('id', promoCode.id);

    return NextResponse.json({
      success: true,
      message: `Тариф "${promoCode.limit_type}" активирован! Лимит: ${promoCode.limit_value} записей`,
      newLimit: promoCode.limit_value
    });
  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.json({ error: 'Ошибка активации' }, { status: 500 });
  }
}