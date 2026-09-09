import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Нет файла' }, { status: 400 });
    }

    // Проверяем размер (макс 32 МБ для ImgBB)
    if (file.size > 32 * 1024 * 1024) {
      return NextResponse.json({ error: 'Файл слишком большой (макс 32 МБ)' }, { status: 400 });
    }

    // Преобразуем файл в base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Отправляем в ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', base64);
    imgbbFormData.append('key', process.env.IMGBB_API_KEY || '');
    imgbbFormData.append('name', `receipt_${Date.now()}`);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbFormData,
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return NextResponse.json({
      success: true,
      url: data.data.url, // Прямая ссылка на изображение
      thumbUrl: data.data.thumb?.url || data.data.url, // Миниатюра
      fileName: data.data.title || file.name
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 });
  }
}