"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SolicitarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idPlan = searchParams.get("idPlan");
  const planName = searchParams.get("planName") ?? "";

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!idPlan) {
      setError("Plano não informado.");
    }
  }, [idPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!idPlan) {
      setError("Plano não informado.");
      return;
    }

    const planId = parseInt(idPlan, 10);
    if (isNaN(planId)) {
      setError("Plano inválido.");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("Informe um telefone válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/pessoas-interessadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idPlan: planId,
          phone: phoneDigits,
          ...(email.trim() && { email: email.trim() }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.errorMessage || "Erro ao enviar solicitação.");
      }
    } catch {
      setError("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
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
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <div className="mx-auto max-w-md rounded-lg border-2 border-[#6B46C1] bg-gradient-to-br from-purple-50 to-white p-8 text-center shadow-md">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6B46C1] text-white">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[#6B46C1]">Solicitação enviada</h2>
            <p className="mb-6 text-gray-600">
              Em breve entraremos em contato pelo telefone informado.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full rounded-lg bg-[#6B46C1] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#553C9A]"
            >
              Voltar ao início
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="w-full border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={() => router.back()}
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

      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-2 text-center text-2xl font-bold text-[#6B46C1] sm:text-3xl">
            Solicitar plano
          </h1>
          {planName && (
            <p className="mb-6 text-center text-gray-600">{planName}</p>
          )}

          {!idPlan ? (
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 text-center text-red-700">
              <p>Plano não informado. Volte e selecione um plano.</p>
              <button
                onClick={() => router.back()}
                className="mt-4 text-[#6B46C1] underline hover:text-[#553C9A]"
              >
                Voltar aos planos
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-md"
            >
              <div className="mb-4">
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                  Telefone *
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="11999999999"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  E-mail (opcional)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="opcional@email.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20"
                />
              </div>
              {error && (
                <p className="mb-4 text-center text-sm text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[#6B46C1] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#553C9A] disabled:opacity-60"
              >
                {isSubmitting ? "Enviando..." : "Enviar solicitação"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
