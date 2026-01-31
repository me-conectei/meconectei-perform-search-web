"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Footer from "../components/Footer";

interface Plan {
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
  isImpulsed?: boolean;
}

export default function PlansContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const checkingImpulseRef = useRef<Set<number>>(new Set());
  const isCheckingAllRef = useRef<boolean>(false);
  const currentSearchIdRef = useRef<number>(0);

  useEffect(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const addr = searchParams.get("address");

    if (addr) {
      setAddress(addr);
    }

    if (lat && lng) {
      fetchPlans(lat, lng);
    } else {
      setError("Coordenadas não fornecidas");
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchPlans = async (latitude: string, longitude: string) => {
    setIsLoading(true);
    setError("");
    checkingImpulseRef.current.clear();
    isCheckingAllRef.current = false;
    currentSearchIdRef.current += 1;
    const searchId = currentSearchIdRef.current;

    try {
      console.log("Buscando planos na API com coordenadas:", { latitude, longitude });

      const response = await fetch(`/api/plans?lat=${latitude}&lng=${longitude}`);
      const data = await response.json();

      if (data.success && data.plans && data.plans.length > 0) {
        console.log("Planos encontrados:", data.plans);
        const initialPlans = data.plans.map((plan: Plan) => ({ ...plan, isImpulsed: false }));
        setPlans(initialPlans);
        setIsLoading(false);

        checkPlansImpulseAsync(initialPlans, searchId);
      } else {
        setPlans([]);
        setError(data.errorMessage || "Nenhum plano encontrado para esta região");
        console.log("Nenhum plano encontrado");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Erro ao buscar planos:", err);
      setError("Erro ao buscar planos. Tente novamente.");
      setPlans([]);
      setIsLoading(false);
    }
  };

  const checkPlansImpulseAsync = async (plans: Plan[], searchId: number) => {
    if (isCheckingAllRef.current) {
      return;
    }

    isCheckingAllRef.current = true;

    try {
      const plansWithImpulse = await checkPlansImpulse(plans);
      
      if (currentSearchIdRef.current !== searchId) {
        return;
      }

      const sortedPlans = sortPlansByImpulse(plansWithImpulse);
      setPlans(sortedPlans);
    } catch (err) {
      console.error("Erro ao verificar planos impulsionados:", err);
    } finally {
      if (currentSearchIdRef.current === searchId) {
        isCheckingAllRef.current = false;
        checkingImpulseRef.current.clear();
      }
    }
  };

  const checkPlansImpulse = async (plans: Plan[]): Promise<Plan[]> => {
    const plansWithImpulse = await Promise.all(
      plans.map(async (plan) => {
        if (checkingImpulseRef.current.has(plan.idPlan)) {
          return { ...plan, isImpulsed: plan.isImpulsed ?? false };
        }

        checkingImpulseRef.current.add(plan.idPlan);

        try {
          const response = await fetch(`/api/plan-impulse/${plan.idPlan}`);
          const data = await response.json();
          
          if (data.success && data.data === true) {
            return { ...plan, isImpulsed: true };
          }
          return { ...plan, isImpulsed: false };
        } catch (err) {
          console.error(`Erro ao verificar impulso do plano ${plan.idPlan}:`, err);
          return { ...plan, isImpulsed: false };
        }
      })
    );
    return plansWithImpulse;
  };

  const sortPlansByImpulse = (plans: Plan[]): Plan[] => {
    return [...plans].sort((a, b) => {
      if (a.isImpulsed && !b.isImpulsed) return -1;
      if (!a.isImpulsed && b.isImpulsed) return 1;
      return 0;
    });
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2).replace(".", ",");
  };

  const formatSpeed = (velocity: number) => {
    return `${velocity} Mbps`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="w-full border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-[#6B46C1] transition-colors hover:text-[#553C9A] sm:text-base"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <Image
            src="https://meconectei.com.br/wp-content/uploads/2023/08/logo-1024x232.png"
            alt="meconectei logo"
            width={150}
            height={34}
            className="h-auto w-auto max-w-[120px] sm:max-w-[150px]"
          />
          <div className="w-[60px] sm:w-[80px]"></div>
        </div>
      </header>

      <main className="flex flex-1 flex-col w-full px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-7xl">
          {address && (
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 sm:text-base">
                Planos disponíveis para: <span className="font-semibold text-gray-900">{address}</span>
              </p>
            </div>
          )}

          <h1 className="mb-8 text-center text-3xl font-bold text-[#6B46C1] sm:text-4xl">
            Planos Disponíveis
          </h1>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-md"
                >
                  <div className="mb-4 h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
                  <div className="mb-4 h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
                  <div className="mb-4 h-8 w-1/3 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          ) : error && plans.length === 0 ? (
            <div className="text-center">
              <p className="mb-4 text-lg text-red-600">{error}</p>
            </div>
          ) : null}

          {plans.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.idPlan}
                  className={`rounded-lg border-2 p-6 shadow-md transition-shadow hover:shadow-lg ${
                    plan.isImpulsed
                      ? 'border-[#6B46C1] bg-gradient-to-br from-purple-50 to-white'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {plan.isImpulsed && (
                    <div className="mb-3 flex justify-end">
                      <span className="rounded-full bg-[#6B46C1] px-3 py-1 text-xs font-semibold text-white">
                        Promovido
                      </span>
                    </div>
                  )}
                  {plan.imageUrl && (
                    <div className="mb-4 flex justify-center">
                      <Image
                        src={plan.imageUrl}
                        alt={plan.companyName}
                        width={120}
                        height={60}
                        className="h-auto max-h-16 w-auto object-contain"
                      />
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{plan.planName}</h3>
                    <p className="mt-1 text-sm text-gray-600">{plan.companyName}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-[#6B46C1]">
                      R$ {formatPrice(plan.price)}
                    </p>
                    <p className="text-sm text-gray-600">/mês</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatSpeed(plan.velocity)}
                    </p>
                    <p className="text-sm text-gray-600">{plan.technology}</p>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {plan.wifi === 1 && (
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-[#6B46C1]">
                        WiFi
                      </span>
                    )}
                    {plan.camera === 1 && (
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-[#6B46C1]">
                        Câmera
                      </span>
                    )}
                    {plan.phone === 1 && (
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-[#6B46C1]">
                        Telefone
                      </span>
                    )}
                  </div>
                  {plan.priceInstallation > 0 && (
                    <p className="mb-4 text-sm text-gray-600">
                      Instalação: R$ {formatPrice(plan.priceInstallation)}
                    </p>
                  )}
                  <button
                    onClick={() =>
                      router.push(
                        `/plans/solicitar?idPlan=${plan.idPlan}&planName=${encodeURIComponent(plan.planName)}`
                      )
                    }
                    className="w-full rounded-lg bg-[#6B46C1] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#553C9A]"
                  >
                    Contratar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
