import { NextRequest, NextResponse } from 'next/server';
import { ApiService } from '../../services/api.service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { success: false, errorMessage: 'Address parameter is required' },
      { status: 400 }
    );
  }

  try {
    const data = await ApiService.geocodeAddress(address);
    const location = ApiService.extractLocationFromGeocode(data);
    
    if (location) {
      return NextResponse.json({
        success: true,
        latitude: location.lat,
        longitude: location.lng
      });
    }
    
    return NextResponse.json({
      success: false,
      errorMessage: data.errorMessage || 'Nenhum resultado encontrado',
      latitude: null,
      longitude: null
    });
  } catch (error) {
    console.error('Erro ao obter detalhes do local:', error);
    return NextResponse.json(
      { 
        success: false, 
        errorMessage: 'Erro ao obter localização. Tente novamente.',
        latitude: null,
        longitude: null
      },
      { status: 500 }
    );
  }
}
