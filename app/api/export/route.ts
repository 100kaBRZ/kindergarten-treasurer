import { supabase } from '@/lib/db';

export async function GET() {
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });
  
  const BOM = '\xEF\xBB\xBF';
  const headers = 'ID,Дата,Тип,Сумма,Описание,Ребенок';
  const rows = (data || []).map(t => 
    `${t.id},${new Date(t.created_at).toLocaleDateString('ru-RU')},${t.type === 'income' ? 'Доход' : 'Расход'},${t.amount},"${t.description.replace(/"/g, '""')}","${t.child_name || '-'}"`
  );
  
  const csv = [headers, ...rows].join('\n');
  
  return new Response(BOM + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="otchet.csv"'
    }
  });
}