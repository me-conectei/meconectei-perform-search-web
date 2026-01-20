import { Suspense } from "react";
import PlansContent from "./PlansContent";

export default function PlansPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#6B46C1] border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    }>
      <PlansContent />
    </Suspense>
  );
}
