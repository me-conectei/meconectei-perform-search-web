import { NextRequest, NextResponse } from 'next/server';
import { ApiService } from '../../services/api.service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = searchParams.get('lat');
  const longitude = searchParams.get('lng');

  if (!latitude || !longitude) {
    return NextResponse.json(
      { success: false, errorMessage: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  try {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, errorMessage: 'Invalid latitude or longitude' },
        { status: 400 }
      );
    }

    const data = await ApiService.searchPlans(lat, lng);
    
    if (data.success) {
      return NextResponse.json({
        success: true,
        plans: data.data || []
      });
    }
    
    return NextResponse.json({
      success: false,
      errorMessage: data.errorMessage || 'Nenhum plano encontrado',
      plans: []
    });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json(
      { 
        success: false, 
        errorMessage: 'Erro ao buscar planos. Tente novamente.',
        plans: []
      },
      { status: 500 }
    );
  }
}
