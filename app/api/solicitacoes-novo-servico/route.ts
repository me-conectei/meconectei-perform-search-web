import { NextRequest, NextResponse } from 'next/server';
import { ApiService } from '../../services/api.service';

const SERVICOS = ['CAMERAS', 'NOVO PONTO DE WIFI'] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nome,
      telefone,
      servico,
      quantidade_cameras,
      camera_interna,
      camera_externa,
      tempo_gravacao_dias,
      provedor_internet,
    } = body;

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return NextResponse.json(
        { success: false, errorMessage: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    if (!telefone || typeof telefone !== 'string' || telefone.trim() === '') {
      return NextResponse.json(
        { success: false, errorMessage: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    const phoneDigits = String(telefone).trim().replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { success: false, errorMessage: 'Informe um telefone válido' },
        { status: 400 }
      );
    }

    if (!servico || !SERVICOS.includes(servico)) {
      return NextResponse.json(
        { success: false, errorMessage: 'Serviço inválido' },
        { status: 400 }
      );
    }

    const payload: Parameters<typeof ApiService.postSolicitacaoNovoServico>[0] = {
      nome: nome.trim(),
      telefone: phoneDigits,
      servico,
    };

    if (servico === 'CAMERAS') {
      if (quantidade_cameras != null) {
        const n = Number(quantidade_cameras);
        if (!Number.isNaN(n) && n >= 0) payload.quantidade_cameras = n;
      }
      if (typeof camera_interna === 'boolean') payload.camera_interna = camera_interna;
      if (typeof camera_externa === 'boolean') payload.camera_externa = camera_externa;
      if (tempo_gravacao_dias != null) {
        const d = Number(tempo_gravacao_dias);
        if (!Number.isNaN(d) && d >= 0) payload.tempo_gravacao_dias = d;
      }
    }

    if (provedor_internet != null && String(provedor_internet).trim() !== '') {
      payload.provedor_internet = String(provedor_internet).trim();
    }

    const result = await ApiService.postSolicitacaoNovoServico(payload);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          errorMessage: result.errorMessage || 'Erro ao enviar solicitação',
          ...(result.camps && { camps: result.camps }),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, id: result.id, uid: result.uid },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar solicitação de novo serviço:', error);
    return NextResponse.json(
      {
        success: false,
        errorMessage: 'Erro ao enviar solicitação. Tente novamente.',
      },
      { status: 500 }
    );
  }
}
