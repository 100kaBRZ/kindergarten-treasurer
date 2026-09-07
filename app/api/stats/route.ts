import { supabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    const { data: activated } = await supabase
      .from('promo_codes')
      .select('limit_value, limit_type')
      .eq('is_used', true)
      .limit(1)
      .single();

    const currentLimit = activated?.limit_value || 50;
    const isActivated = !!activated;

    return NextResponse.json({
      count: count || 0,
      limit: currentLimit,
      isActivated,
      limitType: activated?.limit_type || 'free'
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}