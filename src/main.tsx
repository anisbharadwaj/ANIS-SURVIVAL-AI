import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Capture beforeinstallprompt event globally as early as possible to prevent race conditions
if (typeof window !== "undefined") {
  (window as any).deferredInstallPrompt = null;
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    console.log("[PWA Global] beforeinstallprompt event captured early!");
    e.preventDefault();
    (window as any).deferredInstallPrompt = e;
    // Dispatch a custom event to notify any mounted PWA controllers
    window.dispatchEvent(new CustomEvent("anis-install-prompt-available"));
  });
}

// Register Service Worker for PWA Offline functionality with a robust fallback
if ("serviceWorker" in navigator) {
  const registerSW = () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[PWA] Service Worker registered successfully:", registration.scope);
      })
      .catch((error) => {
        console.error("[PWA] Service Worker registration failed:", error);
      });
  };

  if (document.readyState === "complete" || document.readyState === "interactive") {
    registerSW();
  } else {
    window.addEventListener("load", registerSW);
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
