import React, { useState } from "react";
import { Download } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-yellow-400 border border-yellow-500/40 shadow-sm hover:bg-slate-800 transition-colors whitespace-nowrap"
        title="Instalar aplicativo no dispositivo"
      >
        <Download size={15} />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          <Download size={15} />
          <span>Instalar no iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Instalar no iPhone / iPad
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                1. Toque no botão <strong>Compartilhar</strong> na barra do Safari.
                <br />
                2. Role para baixo e toque em{" "}
                <strong>Adicionar à Tela de Início</strong> para receber alertas e usar como aplicativo.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
