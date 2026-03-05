"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type Servico = "CAMERAS" | "NOVO PONTO DE WIFI";

export default function SolicitarServicoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"select" | "form">("select");
  const [servico, setServico] = useState<Servico | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [quantidade_cameras, setQuantidadeCameras] = useState<string>("");
  const [camera_interna, setCameraInterna] = useState(false);
  const [camera_externa, setCameraExterna] = useState(false);
  const [tempo_gravacao_dias, setTempoGravacaoDias] = useState<string>("");
  const [provedor_internet, setProvedorInternet] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tipo = searchParams.get("tipo");
    if (tipo === "CAMERAS") {
      setServico("CAMERAS");
      setStep("form");
    } else if (tipo === "WIFI") {
      setServico("NOVO PONTO DE WIFI");
      setStep("form");
    }
  }, [searchParams]);

  const chooseServico = (s: Servico) => {
    setServico(s);
    setError("");
    setStep("form");
  };

  const goBack = () => {
    if (step === "form") {
      setStep("select");
      setServico(null);
      setError("");
    } else {
      router.push("/");
    }
  };

  const buildBody = () => {
    const body: Record<string, unknown> = {
      nome: nome.trim(),
      telefone: telefone.trim().replace(/\D/g, ""),
      servico: servico!,
    };
    if (servico === "CAMERAS") {
      const q = parseInt(quantidade_cameras, 10);
      if (!Number.isNaN(q) && q >= 0) body.quantidade_cameras = q;
      body.camera_interna = camera_interna;
      body.camera_externa = camera_externa;
      const d = parseInt(tempo_gravacao_dias, 10);
      if (!Number.isNaN(d) && d >= 0) body.tempo_gravacao_dias = d;
    }
    if (provedor_internet.trim()) body.provedor_internet = provedor_internet.trim();
    return body;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nomeTrim = nome.trim();
    if (!nomeTrim) {
      setError("Informe seu nome.");
      return;
    }

    const phoneDigits = telefone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("Informe um telefone válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/solicitacoes-novo-servico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody()),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        const msg = data.camps
          ? Object.values(data.camps).join(" ")
          : data.errorMessage || "Erro ao enviar solicitação.";
        setError(msg);
      }
    } catch {
      setError("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20 min-h-[44px] sm:min-h-0";
  const labelClass = "mb-2 block text-sm font-medium text-gray-700";

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <header className="w-full border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex min-h-[44px] min-w-[44px] items-center gap-2 text-sm text-[#6B46C1] transition-colors hover:text-[#553C9A] sm:min-h-0 sm:min-w-0 sm:text-base"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <Image
              src="https://meconectei.com.br/wp-content/uploads/2023/08/logo-1024x232.png"
              alt="meconectei logo"
              width={150}
              height={34}
              className="h-auto w-auto max-w-[120px] sm:max-w-[150px]"
            />
            <div className="w-10 sm:w-20"></div>
          </div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-md rounded-xl border-2 border-[#6B46C1] bg-gradient-to-br from-purple-50 to-white p-6 text-center shadow-lg sm:p-8">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6B46C1] text-white">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-[#6B46C1] sm:text-2xl">Solicitação enviada</h2>
            <p className="mb-6 text-gray-600">
              Em breve entraremos em contato pelo telefone informado.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full rounded-lg bg-[#6B46C1] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#553C9A] min-h-[48px]"
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
            onClick={goBack}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 text-sm text-[#6B46C1] transition-colors hover:text-[#553C9A] sm:min-h-0 sm:min-w-0 sm:justify-start sm:text-base"
          >
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <Image
            src="https://meconectei.com.br/wp-content/uploads/2023/08/logo-1024x232.png"
            alt="meconectei logo"
            width={150}
            height={34}
            className="h-auto w-auto max-w-[120px] sm:max-w-[150px]"
          />
          <div className="w-10 sm:w-20"></div>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-6 sm:py-10">
        <div className="mx-auto w-full max-w-lg">
          {step === "select" && (
            <>
              <h1 className="mb-2 text-center text-2xl font-bold text-[#6B46C1] sm:text-3xl">
                Novo serviço
              </h1>
              <p className="mb-6 sm:mb-8 text-center text-gray-600">
                O que você precisa?
              </p>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <button
                  type="button"
                  onClick={() => chooseServico("CAMERAS")}
                  className="flex flex-col items-center rounded-xl border-2 border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:border-[#6B46C1] hover:shadow-md focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20 min-h-[140px] sm:min-h-[160px]"
                >
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-[#6B46C1] sm:h-14 sm:w-14">
                    <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span className="text-lg font-semibold text-gray-900 sm:text-xl">Procurando Câmera</span>
                  <span className="mt-1 text-sm text-gray-500">Câmeras de segurança e gravação</span>
                </button>
                <button
                  type="button"
                  onClick={() => chooseServico("NOVO PONTO DE WIFI")}
                  className="flex flex-col items-center rounded-xl border-2 border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:border-[#6B46C1] hover:shadow-md focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20 min-h-[140px] sm:min-h-[160px]"
                >
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-[#6B46C1] sm:h-14 sm:w-14">
                    <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </span>
                  <span className="text-lg font-semibold text-gray-900 sm:text-xl">Quer mais um ponto de WIFI</span>
                  <span className="mt-1 text-sm text-gray-500">Novo ponto de acesso Wi-Fi</span>
                </button>
              </div>
            </>
          )}

          {step === "form" && servico && (
            <>
              <button
                type="button"
                onClick={() => setStep("select")}
                className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-[#6B46C1] sm:mb-6"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Trocar tipo de serviço
              </button>
              <h1 className="mb-2 text-center text-2xl font-bold text-[#6B46C1] sm:text-3xl">
                {servico === "CAMERAS" ? "Procurando Câmera" : "Mais um ponto de WIFI"}
              </h1>
              <p className="mb-6 text-center text-gray-600">
                Preencha os dados para entrarmos em contato.
              </p>

              <form
                onSubmit={handleSubmit}
                className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-md sm:p-6"
              >
                <div className="mb-4">
                  <label htmlFor="nome" className={labelClass}>Nome *</label>
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className={inputClass}
                    maxLength={256}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="telefone" className={labelClass}>Telefone *</label>
                  <input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={inputClass}
                    required
                  />
                </div>

                {servico === "CAMERAS" && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="quantidade_cameras" className={labelClass}>
                        Quantidade de câmeras (opcional)
                      </label>
                      <input
                        id="quantidade_cameras"
                        type="number"
                        min={0}
                        value={quantidade_cameras}
                        onChange={(e) => setQuantidadeCameras(e.target.value)}
                        placeholder="Ex: 4"
                        className={inputClass}
                      />
                    </div>
                    <div className="mb-4 flex flex-wrap gap-4">
                      <label className="flex min-h-[44px] cursor-pointer items-center gap-3 sm:min-h-0">
                        <input
                          type="checkbox"
                          checked={camera_interna}
                          onChange={(e) => setCameraInterna(e.target.checked)}
                          className="h-5 w-5 rounded border-gray-300 text-[#6B46C1] focus:ring-[#6B46C1]"
                        />
                        <span className="text-sm font-medium text-gray-700">Câmera interna</span>
                      </label>
                      <label className="flex min-h-[44px] cursor-pointer items-center gap-3 sm:min-h-0">
                        <input
                          type="checkbox"
                          checked={camera_externa}
                          onChange={(e) => setCameraExterna(e.target.checked)}
                          className="h-5 w-5 rounded border-gray-300 text-[#6B46C1] focus:ring-[#6B46C1]"
                        />
                        <span className="text-sm font-medium text-gray-700">Câmera externa</span>
                      </label>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="tempo_gravacao_dias" className={labelClass}>
                        Dias de gravação (opcional)
                      </label>
                      <input
                        id="tempo_gravacao_dias"
                        type="number"
                        min={0}
                        value={tempo_gravacao_dias}
                        onChange={(e) => setTempoGravacaoDias(e.target.value)}
                        placeholder="Ex: 30"
                        className={inputClass}
                      />
                    </div>
                  </>
                )}

                <div className="mb-6">
                  <label htmlFor="provedor_internet" className={labelClass}>
                    Provedor de internet (opcional)
                  </label>
                  <input
                    id="provedor_internet"
                    type="text"
                    value={provedor_internet}
                    onChange={(e) => setProvedorInternet(e.target.value)}
                    placeholder="Nome do provedor"
                    className={inputClass}
                    maxLength={256}
                  />
                </div>

                {error && (
                  <p className="mb-4 text-center text-sm text-red-600">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-[#6B46C1] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#553C9A] disabled:opacity-60 min-h-[48px]"
                >
                  {isSubmitting ? "Enviando..." : "Enviar solicitação"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
