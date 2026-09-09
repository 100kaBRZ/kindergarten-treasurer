import { supabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Нет файла' }, { status: 400 });
    }

    // Проверяем тип файла (только изображения)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Только изображения' }, { status: 400 });
    }

    // Генерируем уникальное имя файла
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Загружаем в Supabase Storage
    const { data, error: uploadError } = await supabase
      .storage
      .from('receipts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Получаем публичную ссылку
    const { data: { publicUrl } } = supabase
      .storage
      .from('receipts')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName: fileName
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 });
  }
}