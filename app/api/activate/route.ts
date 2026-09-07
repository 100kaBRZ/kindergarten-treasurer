import { supabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Введите код' }, { status: 400 });
    }

    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('is_used', false)
      .single();

    if (error || !promo) {
      return NextResponse.json({ error: 'Недействительный или использованный код' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('promo_codes')
      .update({ 
        is_used: true, 
        activated_at: new Date().toISOString(),
        used_by: 'user'
      })
      .eq('id', promo.id);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      message: `Тариф "${promo.limit_type === 'unlimited' ? 'Безлимит' : promo.limit_value + ' записей'}" активирован!`,
      newLimit: promo.limit_value
    });
  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.json({ error: 'Ошибка активации' }, { status: 500 });
  }
}