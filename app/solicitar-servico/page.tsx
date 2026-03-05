import { Suspense } from "react";
import SolicitarServicoContent from "./SolicitarServicoContent";

export default function SolicitarServicoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#6B46C1] border-t-transparent"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <SolicitarServicoContent />
    </Suspense>
  );
}
