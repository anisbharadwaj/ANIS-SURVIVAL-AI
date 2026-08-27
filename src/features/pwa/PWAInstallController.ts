// Dedicated PWA Installation Controller managing beforeinstallprompt & appinstalled lifecycle
export type InstallState = "unsupported" | "ready" | "installed" | "installing";

class PWAInstallController {
  private deferredPrompt: any = null;
  private listeners: Set<(state: InstallState) => void> = new Set();
  private state: InstallState = "unsupported";

  constructor() {
    if (typeof window !== "undefined") {
      // 1. Initial status checks
      this.checkStandalone();

      // 2. Listen to native browser prompt trigger
      window.addEventListener("beforeinstallprompt", (e: any) => {
        console.log("[PWAInstallController] Native beforeinstallprompt captured.");
        e.preventDefault();
        this.deferredPrompt = e;
        (window as any).deferredInstallPrompt = e;
        this.updateState("ready");
      });

      // 3. Listen to successful installation events to update state instantly
      window.addEventListener("appinstalled", () => {
        console.log("[PWAInstallController] App successfully installed event caught! Cleaning up prompt UI.");
        this.deferredPrompt = null;
        (window as any).deferredInstallPrompt = null;
        this.updateState("installed");
      });

      // 4. Custom notification fallback from early bootstrap
      window.addEventListener("anis-install-prompt-available", () => {
        console.log("[PWAInstallController] Early bootstrap notify received.");
        if ((window as any).deferredInstallPrompt) {
          this.deferredPrompt = (window as any).deferredInstallPrompt;
          this.updateState("ready");
        }
      });
    }
  }

  public checkStandalone() {
    if (typeof window === "undefined") return;

    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (navigator as any).standalone || 
      document.referrer.includes("android-app://");
    
    if (isStandalone) {
      this.state = "installed";
    } else if (this.deferredPrompt || (window as any).deferredInstallPrompt) {
      this.deferredPrompt = this.deferredPrompt || (window as any).deferredInstallPrompt;
      this.state = "ready";
    } else {
      this.state = "unsupported";
    }
  }

  public getState(): InstallState {
    this.checkStandalone();
    return this.state;
  }

  public getPrompt() {
    return this.deferredPrompt || (window as any).deferredInstallPrompt;
  }

  private updateState(newState: InstallState) {
    this.state = newState;
    this.listeners.forEach((listener) => listener(newState));
  }

  public subscribe(listener: (state: InstallState) => void) {
    this.listeners.add(listener);
    // Emit immediate current state upon subscription
    this.checkStandalone();
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async install(speakFeedback?: (text: string) => void): Promise<boolean> {
    const promptEvent = this.getPrompt();
    if (!promptEvent) {
      console.warn("[PWAInstallController] Installation prompt is not available.");
      if (speakFeedback) {
        speakFeedback("Installation prompt not available natively. Use your mobile browser menu settings, select Add to Home Screen, to install.");
      }
      return false;
    }

    try {
      this.updateState("installing");
      promptEvent.prompt();
      
      const choiceResult = await promptEvent.userChoice;
      console.log(`[PWAInstallController] User response to installation: ${choiceResult.outcome}`);
      
      if (choiceResult.outcome === "accepted") {
        this.deferredPrompt = null;
        (window as any).deferredInstallPrompt = null;
        this.updateState("installed");
        if (speakFeedback) {
          speakFeedback("Congratulations! ANIS Survival AI has been installed successfully to your device.");
        }
        return true;
      } else {
        this.updateState("ready");
        if (speakFeedback) {
          speakFeedback("Installation declined by user.");
        }
        return false;
      }
    } catch (err: any) {
      console.error("[PWAInstallController] Error triggering install prompt:", err);
      this.updateState("ready");
      if (speakFeedback) {
        speakFeedback("Tactical error occurred during prompt triggering.");
      }
      return false;
    }
  }
}

export const pwaInstallController = new PWAInstallController();
