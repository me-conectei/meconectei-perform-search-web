import Image from "next/image";

const APP_STORE_URL = "https://apps.apple.com/br/app/meconectei-planos-de-internet/id6751843760";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.meconectei.mob";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-8">
          <div className="text-center sm:text-left">
            <p className="mb-4 text-sm font-medium text-gray-700 sm:text-base">
              Baixe nosso aplicativo
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <Image
                  src="https://meconectei.com.br/wp-content/uploads/2023/08/apple.webp"
                  alt="Baixar na App Store"
                  width={150}
                  height={45}
                  className="h-[45px] w-auto"
                />
              </a>
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <Image
                  src="https://meconectei.com.br/wp-content/uploads/2023/08/google.webp"
                  alt="Disponível no Google Play"
                  width={150}
                  height={45}
                  className="h-[45px] w-auto"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
