import { NextRequest, NextResponse } from 'next/server';
import { ApiService } from '../../../../services/api.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ idCompany: string }> }
) {
  const { idCompany } = await params;

  if (!idCompany) {
    return NextResponse.json(
      { success: false, error: -1, errorMessage: 'idCompany inválido', data: null },
      { status: 400 }
    );
  }

  const companyId = parseInt(idCompany, 10);
  if (isNaN(companyId) || companyId <= 0) {
    return NextResponse.json(
      { success: false, error: -1, errorMessage: 'idCompany inválido', data: null },
      { status: 400 }
    );
  }

  try {
    const result = await ApiService.getGoogleAvaliacao(companyId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar avaliação Google:', error);
    return NextResponse.json(
      {
        success: false,
        error: 1,
        errorMessage: 'Erro ao buscar avaliação.',
        data: null
      },
      { status: 500 }
    );
  }
}
