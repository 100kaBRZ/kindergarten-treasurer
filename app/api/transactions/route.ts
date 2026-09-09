import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, amount, description, child_name } = body;

    if (!type || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Проверяем лимит
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    const { data: activated } = await supabase
      .from('promo_codes')
      .select('limit_value')
      .eq('is_used', true)
      .limit(1)
      .single();

    const currentLimit = activated?.limit_value || 3; // По умолчанию 3 для теста

    if (count !== null && count >= currentLimit) {
      return NextResponse.json(
        { error: 'LIMIT_REACHED', message: `Лимит записей (${currentLimit}) достигнут. Активируйте тариф для увеличения лимита.` },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        type,
        amount: parseFloat(amount),
        description,
        child_name: child_name || null
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}