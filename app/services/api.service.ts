const API_BASE_URL = 'https://me-conectei-svc-temp-4f6577936f24.herokuapp.com';

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
}
