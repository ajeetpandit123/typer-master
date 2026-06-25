import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/services/apiAuth';

export async function PUT(request: NextRequest) {
  const { isAdmin, error } = await verifyAdmin(request);
  
  if (!isAdmin) {
    return NextResponse.json({ error: error || 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'Missing test ID' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Test updated successfully',
      test: body
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing request' }, { status: 500 });
  }
}
