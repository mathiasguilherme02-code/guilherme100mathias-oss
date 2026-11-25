import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App.tsx';
import './index.css';

// Proactively check for Service Worker updates on boot so users don't see stale cached UI
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      registrations.forEach((registration) => {
        registration.update().catch(() => {});
      });
    })
    .catch(() => {});
}

// Handle Vite chunk preload errors (e.g. after app update with stale cached HTML on mobile)
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  try {
    const key = 'gm_preload_reload_ts';
    const last = Number(sessionStorage.getItem(key) || '0');
    if (Date.now() - last > 10000) {
      sessionStorage.setItem(key, String(Date.now()));
      if (typeof (window as any).__gmHardReload === 'function') {
        (window as any).__gmHardReload();
        return;
      }
      window.location.reload();
    }
  } catch {
    window.location.reload();
  }
});

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: '' };
  declare props: Readonly<{ children: React.ReactNode }>;

  constructor(props: { children: React.ReactNode }) {
    super(props);
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error || ''),
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('Erro ao renderizar aplicação:', error, info);
  }

  handleReload = () => {
    if (typeof (window as any).__gmHardReload === 'function') {
      (window as any).__gmHardReload();
      return;
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center font-black text-xl">
              GM
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Não foi possível abrir a página
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ocorreu uma falha momentânea ao carregar os dados no seu navegador. Toque no botão abaixo para atualizar e tentar novamente.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 px-5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold text-sm shadow-md transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <Toaster position="top-right" richColors />
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
