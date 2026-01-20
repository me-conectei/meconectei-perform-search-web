import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { success: false, errorMessage: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const apiUrl = `https://me-conectei-svc-temp-4f6577936f24.herokuapp.com/company/proxy?query=${encodeURIComponent(query)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data && data.data.results) {
      const predictions = data.data.results.map((result: any) => ({
        description: result.formatted_address || result.name,
        place_id: result.place_id,
        structured_formatting: {
          main_text: result.name,
          secondary_text: result.formatted_address
        }
      }));
      
      return NextResponse.json({
        success: true,
        predictions
      });
    } else {
      return NextResponse.json({
        success: false,
        errorMessage: data.errorMessage || 'No results found',
        predictions: []
      });
    }
  } catch (error) {
    console.error('Erro ao buscar endereços:', error);
    return NextResponse.json(
      { 
        success: false, 
        errorMessage: 'Erro ao buscar endereços. Tente novamente.',
        predictions: []
      },
      { status: 500 }
    );
  }
}
