"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Footer from "./components/Footer";

interface SearchResult {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function Home() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLocate = async () => {
    if (!navigator.geolocation) {
      setError("Geolocalização não é suportada pelo seu navegador");
      return;
    }

    setIsLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=pt-BR`
          );

          if (!response.ok) {
            throw new Error("Erro ao obter endereço");
          }

          const data = await response.json();
          
          if (data.address) {
            const addressParts = [];
            
            if (data.address.road) addressParts.push(data.address.road);
            if (data.address.house_number) addressParts.push(data.address.house_number);
            if (data.address.neighbourhood || data.address.suburb) {
              addressParts.push(data.address.neighbourhood || data.address.suburb);
            }
            if (data.address.city || data.address.town || data.address.village) {
              addressParts.push(data.address.city || data.address.town || data.address.village);
            }
            if (data.address.state) addressParts.push(data.address.state);
            
            const fullAddress = addressParts.length > 0 
              ? addressParts.join(", ")
              : data.display_name;
            
            setAddress(fullAddress);
          } else {
            setAddress(data.display_name);
          }
        } catch (err) {
          setError("Erro ao obter endereço. Tente novamente.");
          console.error("Erro no geocoding:", err);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setError("Permissão de localização negada. Por favor, permita o acesso à sua localização.");
        } else if (err.code === 2) {
          setError("Localização não disponível. Verifique sua conexão.");
        } else {
          setError("Erro ao obter localização. Tente novamente.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const searchAddresses = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      setError("");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success && data.predictions && data.predictions.length > 0) {
        setResults(data.predictions);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
        if (query.trim().length > 2) {
          setError(data.errorMessage || "Nenhum resultado encontrado");
        }
      }
    } catch (err) {
      console.error("Erro ao buscar endereços:", err);
      setError("Erro ao buscar endereços. Tente novamente.");
      setResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (text: string) => {
    setAddress(text);
    setError("");
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      searchAddresses(text);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      setShowResults(false);
    }
  }, []);

  useEffect(() => {
    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults, handleClickOutside]);

  const handleSelectResult = (result: SearchResult) => {
    setAddress(result.description);
    setShowResults(false);
    setError("");
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleSearch = async () => {
    if (!address.trim()) {
      setError("Por favor, digite um endereço para buscar");
      return;
    }

    setIsLoadingPlans(true);
    setError("");
    setShowResults(false);

    try {
      const response = await fetch(`/api/search-plans?address=${encodeURIComponent(address)}`);
      const data = await response.json();

      if (data.success && data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        setError(data.errorMessage || "Não foi possível obter a localização do endereço");
        setIsLoadingPlans(false);
      }
    } catch (err) {
      console.error('Erro ao buscar planos:', err);
      setError("Erro ao buscar planos. Tente novamente.");
      setIsLoadingPlans(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white">
      <header className="w-full px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <Image
            src="https://meconectei.com.br/wp-content/uploads/2023/08/logo-1024x232.png"
            alt="meconectei logo"
            width={200}
            height={45}
            priority
            className="h-auto w-auto max-w-[180px] sm:max-w-[200px]"
          />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center w-full px-4 py-12 sm:px-6 sm:py-16">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center sm:mb-12">
            <h1 className="mb-4 text-3xl font-bold text-[#6B46C1] sm:text-4xl md:text-5xl">
              Procurando internet?
            </h1>
            <p className="text-lg text-gray-700 sm:text-xl">
              Agora você vai achar.
            </p>
          </div>

          <div className="relative search-container">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => {
                    if (results.length > 0) {
                      setShowResults(true);
                    }
                  }}
                  placeholder="Digite seu endereço completo"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-4 text-base transition-all focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20 sm:py-5 sm:text-lg"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="h-5 w-5 animate-spin text-[#6B46C1] sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                {showResults && results.length > 0 && (
                  <div className="absolute z-10 top-full mt-2 left-0 right-0 max-h-96 overflow-y-auto rounded-lg border-2 border-gray-200 bg-white shadow-lg">
                <ul className="divide-y divide-gray-200">
                  {results.map((result) => (
                    <li key={result.place_id}>
                      <button
                        type="button"
                        onClick={() => handleSelectResult(result)}
                        className="w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      >
                        <div className="font-medium text-gray-900">
                          {result.structured_formatting.main_text}
                        </div>
                        {result.structured_formatting.secondary_text && (
                          <div className="mt-1 text-sm text-gray-500">
                            {result.structured_formatting.secondary_text}
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoadingPlans}
                className="w-full rounded-lg bg-[#6B46C1] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#553C9A] focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto sm:px-12 sm:py-5 sm:text-lg"
              >
                {isLoadingPlans ? "Buscando..." : "Buscar"}
              </button>
            </div>
            
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleLocate}
                disabled={isLocating}
                className="flex items-center gap-2 text-sm text-[#6B46C1] transition-colors hover:text-[#553C9A] disabled:opacity-50 disabled:cursor-not-allowed sm:text-base"
              >
                {isLocating ? (
                  <>
                    <svg className="h-4 w-4 animate-spin sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Localizando...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Me localize</span>
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 sm:text-base">
            Encontre, compare e contrate os melhores planos de internet
          </p>

          <div className="mt-10 sm:mt-14">
            <p className="mb-4 text-center text-base font-semibold text-gray-700 sm:text-lg">
              Ou precisa de outro serviço?
            </p>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <Link
                href="/solicitar-servico?tipo=CAMERAS"
                className="group flex flex-col items-center rounded-xl border-2 border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:border-[#6B46C1] hover:shadow-md focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20 sm:p-8"
              >
                <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-[#6B46C1] transition-colors group-hover:bg-[#6B46C1] group-hover:text-white sm:h-16 sm:w-16">
                  <svg className="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="text-lg font-semibold text-gray-900 sm:text-xl">Procurando Câmera</span>
                <span className="mt-1 text-sm text-gray-500">Câmeras de segurança e gravação</span>
                <span className="mt-3 text-sm font-medium text-[#6B46C1] group-hover:underline">Solicitar →</span>
              </Link>
              <Link
                href="/solicitar-servico?tipo=WIFI"
                className="group flex flex-col items-center rounded-xl border-2 border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:border-[#6B46C1] hover:shadow-md focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20 sm:p-8"
              >
                <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-[#6B46C1] transition-colors group-hover:bg-[#6B46C1] group-hover:text-white sm:h-16 sm:w-16">
                  <svg className="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </span>
                <span className="text-lg font-semibold text-gray-900 sm:text-xl">Mais um ponto de Wi-Fi</span>
                <span className="mt-1 text-sm text-gray-500">Novo ponto de acesso na sua casa</span>
                <span className="mt-3 text-sm font-medium text-[#6B46C1] group-hover:underline">Solicitar →</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
