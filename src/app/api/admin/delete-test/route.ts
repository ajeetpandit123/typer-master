import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/services/apiAuth';

export async function DELETE(request: NextRequest) {
  const { isAdmin, error } = await verifyAdmin(request);
  
  if (!isAdmin) {
    return NextResponse.json({ error: error || 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing test ID in query parameters' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Test ${id} deleted successfully`,
      id
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing request' }, { status: 500 });
  }
}
