import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Compass } from "lucide-react";

interface Props {
  children: ReactNode;
  onSwitchToOffline: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("MapErrorBoundary caught an error:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-[#090e17] border border-red-900/50 rounded-xl h-full text-center space-y-4 select-none">
          <div className="w-12 h-12 bg-red-950/40 border border-red-500 rounded-full flex items-center justify-center text-xl text-red-400 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-sm font-display font-black text-red-400 uppercase tracking-widest">
              Google Maps Loading Error
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              The Google Maps component failed to render. This usually happens when the API key is invalid or hasn't been authorized yet (e.g., <code>InvalidKeyMapError</code>).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs pt-2">
            <button
              id="btn_fallback_switch_maplibre"
              onClick={() => {
                this.handleReset();
                this.props.onSwitchToOffline();
              }}
              className="flex-1 py-2 px-3 bg-sky-950/80 hover:bg-sky-900 border border-sky-800 hover:border-sky-700 text-sky-400 hover:text-white rounded-lg font-mono text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              Use MapLibre Map
            </button>
            <button
              id="btn_fallback_retry_google"
              onClick={this.handleReset}
              className="flex-1 py-2 px-3 bg-[#112340] hover:bg-[#18325c] border border-sky-500 hover:border-sky-400 text-sky-300 hover:text-white rounded-lg font-mono text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Live Map
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
