import { NextRequest, NextResponse } from 'next/server';
import { ApiService } from '../../services/api.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idPlan, email, phone } = body;

    if (idPlan == null || idPlan === '') {
      return NextResponse.json(
        { success: false, errorMessage: 'idPlan é obrigatório' },
        { status: 400 }
      );
    }

    const planId = typeof idPlan === 'number' ? idPlan : parseInt(String(idPlan), 10);
    if (isNaN(planId)) {
      return NextResponse.json(
        { success: false, errorMessage: 'idPlan inválido' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return NextResponse.json(
        { success: false, errorMessage: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    const result = await ApiService.postPessoasInteressadas({
      idPlan: planId,
      ...(email && email.trim() !== '' && { email: email.trim() }),
      phone: phone.trim().replace(/\D/g, ''),
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: result.errorMessage || 'Erro ao enviar solicitação',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar pessoa interessada:', error);
    return NextResponse.json(
      {
        success: false,
        errorMessage: 'Erro ao enviar solicitação. Tente novamente.',
      },
      { status: 500 }
    );
  }
}
