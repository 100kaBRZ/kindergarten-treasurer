import { supabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching:', error);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { data: activated } = await supabase
      .from('promo_codes')
      .select('limit_value')
      .eq('is_used', true)
      .limit(1)
      .single();

    let currentLimit = 50;
    
    if (activated) {
      currentLimit = activated.limit_value;
    }

    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    const currentCount = count || 0;

    if (currentCount >= currentLimit) {
      return NextResponse.json(
        { 
          error: 'LIMIT_REACHED', 
          currentLimit,
          currentCount 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        type: body.type,
        amount: parseFloat(body.amount),
        description: body.description,
        child_name: body.child_name || null
      }])
      .select()
      .single();
    
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}