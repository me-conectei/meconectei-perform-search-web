import { NextRequest, NextResponse } from 'next/server';
import { ApiService } from '../../../services/api.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idPlan: string }> }
) {
  const { idPlan } = await params;

  if (!idPlan) {
    return NextResponse.json(
      { success: false, errorMessage: 'ID do plano é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const planId = parseInt(idPlan, 10);

    if (isNaN(planId)) {
      return NextResponse.json(
        { success: false, errorMessage: 'ID do plano inválido' },
        { status: 400 }
      );
    }

    const result = await ApiService.checkPlanImpulse(planId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao verificar plano impulsionado:', error);
    return NextResponse.json(
      {
        success: false,
        error: 1,
        errorMessage: 'Erro ao verificar plano impulsionado',
        data: false
      },
      { status: 500 }
    );
  }
}
