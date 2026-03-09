const API_BASE_URL = 'https://me-conectei-svc-temp-4f6577936f24.herokuapp.com';
//const API_BASE_URL = 'http://localhost:8080';

interface GeocodeResult {
  success: boolean;
  data?: {
    results: Array<{
      place_id: string;
      name: string;
      formatted_address: string;
      geometry: {
        location: {
          lat: number;
          lng: number;
        };
      };
    }>;
  };
  errorMessage?: string;
}

interface PlansResult {
  success: boolean;
  error: number;
  errorMessage: string;
  data?: Array<{
    idPlan: number;
    planName: string;
    velocity: number;
    technology: string;
    wifi: number;
    camera: number;
    phone: number;
    priceInstallation: number;
    price: number;
    companyName: string;
    imageUrl: string;
    idCompany: number;
    impulsed: string | null;
  }>;
}

interface ImpulseResult {
  success: boolean;
  error: number;
  errorMessage: string;
  data: boolean;
}

export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  time: number;
}

export interface GoogleAvaliacaoData {
  placeId: string | null;
  placeName: string | null;
  formattedAddress: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
  status: string;
  lastFetchedAt: string | null;
  reviews: GoogleReview[];
}

export interface GoogleAvaliacaoResult {
  success: boolean;
  error: number;
  errorMessage: string;
  data: GoogleAvaliacaoData | null;
}

export class ApiService {
  private static async fetchFromApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    return response.json();
  }

  static async searchAddresses(query: string): Promise<GeocodeResult> {
    try {
      const data = await this.fetchFromApi<GeocodeResult>(
        `/company/proxy?query=${encodeURIComponent(query)}`
      );
      return data;
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      throw error;
    }
  }

  static async geocodeAddress(address: string): Promise<GeocodeResult> {
    try {
      const data = await this.fetchFromApi<GeocodeResult>(
        `/company/proxy?query=${encodeURIComponent(address)}`
      );
      return data;
    } catch (error) {
      console.error('Erro ao geocodificar endereço:', error);
      throw error;
    }
  }

  static async searchPlans(latitude: number, longitude: number): Promise<PlansResult> {
    try {
      const data = await this.fetchFromApi<PlansResult>(
        `/client/search?lat=${latitude}&lng=${longitude}`
      );
      return data;
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      throw error;
    }
  }

  static extractLocationFromGeocode(geocodeData: GeocodeResult): { lat: number; lng: number } | null {
    if (
      geocodeData.success &&
      geocodeData.data?.results &&
      geocodeData.data.results.length > 0
    ) {
      const location = geocodeData.data.results[0].geometry.location;
      if (location?.lat && location?.lng) {
        return {
          lat: location.lat,
          lng: location.lng,
        };
      }
    }
    return null;
  }

  static async checkPlanImpulse(idPlan: number): Promise<ImpulseResult> {
    try {
      const data = await this.fetchFromApi<ImpulseResult>(
        `/client/plan/impulse/${idPlan}`
      );
      return data;
    } catch (error) {
      console.error('Erro ao verificar plano impulsionado:', error);
      return {
        success: false,
        error: 1,
        errorMessage: 'Erro ao verificar plano impulsionado',
        data: false
      };
    }
  }

  static async getGoogleAvaliacao(idCompany: number): Promise<GoogleAvaliacaoResult> {
    try {
      const data = await this.fetchFromApi<GoogleAvaliacaoResult>(
        `/client/company/${idCompany}/google-avaliacao`
      );
      return data;
    } catch (error) {
      console.error('Erro ao buscar avaliação Google:', error);
      return {
        success: false,
        error: 1,
        errorMessage: 'Erro ao buscar avaliação Google',
        data: null
      };
    }
  }

  static async postSolicitacaoNovoServico(payload: {
    nome: string;
    telefone: string;
    servico: 'CAMERAS' | 'NOVO PONTO DE WIFI';
    quantidade_cameras?: number;
    camera_interna?: boolean;
    camera_externa?: boolean;
    tempo_gravacao_dias?: number;
    provedor_internet?: string;
  }): Promise<{
    success: boolean;
    error?: number;
    errorMessage?: string;
    id?: number;
    uid?: string;
    camps?: Record<string, string>;
  }> {
    try {
      const body: Record<string, unknown> = {
        nome: payload.nome.trim().slice(0, 256),
        telefone: payload.telefone.trim().replace(/\D/g, '').slice(0, 45),
        servico: payload.servico,
      };
      if (payload.servico === 'CAMERAS') {
        if (payload.quantidade_cameras != null) body.quantidade_cameras = payload.quantidade_cameras;
        if (payload.camera_interna != null) body.camera_interna = payload.camera_interna;
        if (payload.camera_externa != null) body.camera_externa = payload.camera_externa;
        if (payload.tempo_gravacao_dias != null) body.tempo_gravacao_dias = payload.tempo_gravacao_dias;
      }
      if (payload.provedor_internet?.trim())
        body.provedor_internet = payload.provedor_internet.trim().slice(0, 256);

      const response = await fetch(`${API_BASE_URL}/client/solicitacoes-novo-servico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error,
          errorMessage: data.errorMessage || 'Erro ao enviar solicitação',
          camps: data.camps,
        };
      }

      return {
        success: true,
        id: data.id,
        uid: data.uid,
      };
    } catch (error) {
      console.error('Erro ao criar solicitação de serviço:', error);
      return {
        success: false,
        error: 1,
        errorMessage: 'Erro ao enviar solicitação. Tente novamente.',
      };
    }
  }

  static async postPessoasInteressadas(payload: {
    idPlan: number;
    nome?: string;
    email?: string;
    phone: string;
  }): Promise<{ success: boolean; error?: number; errorMessage?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/client/pessoas-interessadas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idPlan: payload.idPlan,
          ...(payload.nome && { nome: payload.nome }),
          ...(payload.email && { email: payload.email }),
          phone: payload.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error,
          errorMessage: data.errorMessage || 'Erro ao enviar solicitação',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar pessoa interessada:', error);
      return {
        success: false,
        error: 1,
        errorMessage: 'Erro ao enviar solicitação. Tente novamente.',
      };
    }
  }
}
