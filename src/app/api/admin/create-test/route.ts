import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/services/apiAuth';

export async function POST(request: NextRequest) {
  const { isAdmin, error } = await verifyAdmin(request);
  
  if (!isAdmin) {
    return NextResponse.json({ error: error || 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    if (!body.text || !body.title) {
      return NextResponse.json({ error: 'Missing title or test text' }, { status: 400 });
    }

    // In a real application, you would write this record to the `tests` Supabase table.
    // For now, we return a successful response verifying the secure request.
    return NextResponse.json({
      success: true,
      message: 'Test created successfully',
      test: {
        id: `test-custom-${Math.random().toString(36).substring(7)}`,
        title: body.title,
        text: body.text,
        targetWpm: body.targetWpm || 40,
        targetAccuracy: body.targetAccuracy || 90,
        timeLimit: body.timeLimit || 60,
        category: body.category || 'Beginner',
        created_at: new Date().toISOString()
      }
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing request' }, { status: 500 });
  }
}
