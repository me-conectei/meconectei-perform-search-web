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
    const geocodeData = await ApiService.geocodeAddress(address);
    const location = ApiService.extractLocationFromGeocode(geocodeData);

    if (location) {
      const plansUrl = new URL('/plans', request.nextUrl.origin);
      plansUrl.searchParams.set('lat', location.lat.toString());
      plansUrl.searchParams.set('lng', location.lng.toString());
      plansUrl.searchParams.set('address', address);

      return NextResponse.json({
        success: true,
        redirectUrl: plansUrl.toString()
      });
    }

    return NextResponse.json(
      { 
        success: false, 
        errorMessage: geocodeData.errorMessage || 'Não foi possível obter a localização do endereço'
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao buscar localização:', error);
    return NextResponse.json(
      { 
        success: false, 
        errorMessage: 'Erro ao buscar localização. Tente novamente.'
      },
      { status: 500 }
    );
  }
}
