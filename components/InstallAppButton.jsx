"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  Check,
  Download,
  EllipsisVertical,
  Share,
  SquarePlus,
  X,
} from "lucide-react";

function isIosDevice() {
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent || "";
  const isIosUserAgent = /iPad|iPhone|iPod/.test(userAgent);
  // iPadOS 13+ reports itself as a Mac, so check for touch support too.
  const isIpadOs =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return isIosUserAgent || isIpadOs;
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true
  );
}

function subscribeToDisplayMode(onChange) {
  const mediaQuery = window.matchMedia("(display-mode: standalone)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function subscribeNoop() {
  return () => {};
}

function getStandaloneSnapshot() {
  return isStandaloneMode();
}

function getServerSnapshot() {
  return false;
}

const installSteps = [
  {
    icon: EllipsisVertical,
    text: "Look for the install icon at the right of the address bar, or open the browser menu",
  },
  { icon: SquarePlus, text: "Choose “Install ToolsTrek”" },
  { icon: Check, text: "Confirm, and you are done" },
];

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [hasInstalled, setHasInstalled] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);

  const isStandalone = useSyncExternalStore(
    subscribeToDisplayMode,
    getStandaloneSnapshot,
    getServerSnapshot,
  );
  const isIos = useSyncExternalStore(
    subscribeNoop,
    isIosDevice,
    getServerSnapshot,
  );
  const isInstalled = isStandalone || hasInstalled;
  const canPrompt = Boolean(deferredPrompt) && !isInstalled;

  // Register the service worker once the page has loaded.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registerServiceWorker = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error) => {
          console.error("Service worker registration failed:", error);
        });
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
      return;
    }

    window.addEventListener("load", registerServiceWorker, { once: true });
    return () => window.removeEventListener("load", registerServiceWorker);
  }, []);

  // Capture the browser's native install prompt and installation state.
  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      setHasInstalled(true);
      setDeferredPrompt(null);
      window.__toolstrekInstallPrompt = null;
    };

    const handlePromptReady = () => {
      if (window.__toolstrekInstallPrompt) {
        setDeferredPrompt(window.__toolstrekInstallPrompt);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("toolstrek-install-prompt-ready", handlePromptReady);

    // Catch a prompt captured by the inline script before hydration.
    queueMicrotask(handlePromptReady);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener(
        "toolstrek-install-prompt-ready",
        handlePromptReady,
      );
    };
  }, []);

  // Close the sheet with the Escape key.
  useEffect(() => {
    if (!isSheetOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsSheetOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSheetOpen]);

  const handleNativeInstall = async () => {
    const promptEvent = deferredPrompt;
    if (!promptEvent) return;

    setIsPrompting(true);

    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;

      if (outcome === "accepted") {
        setHasInstalled(true);
      }
    } catch (error) {
      console.error("Install prompt failed:", error);
    } finally {
      // A beforeinstallprompt event can only be used once.
      window.__toolstrekInstallPrompt = null;
      setDeferredPrompt(null);
      setIsPrompting(false);
      setIsSheetOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsSheetOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isSheetOpen}
        className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-brandColor px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brandColorHover hover:shadow-xl focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 focus-visible:outline-none"
      >
        <Download className="size-4" aria-hidden="true" />
        Install App
      </button>

      {isSheetOpen && (
        <aside
          role="dialog"
          aria-modal="false"
          aria-labelledby="install-heading"
          className="animate-fadeIn fixed inset-x-3 bottom-20 z-50 mx-auto w-auto max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-[0_28px_70px_-20px_rgba(10,40,25,0.45)] print:hidden sm:inset-x-auto sm:right-5 sm:bottom-24 sm:mx-0 sm:w-96 dark:border-white/10 dark:bg-gray-900 dark:text-white"
        >
          <div
            aria-hidden="true"
            className="h-1.5 bg-[linear-gradient(90deg,#a855f7,#7c00fe_55%,#5b00bd)]"
          />

          <button
            type="button"
            onClick={() => setIsSheetOpen(false)}
            aria-label="Close install instructions"
            className="absolute top-3.5 right-2 grid size-10 place-items-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-brandColor focus-visible:outline-none dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          <div className="p-5 pt-4">
            <div className="flex items-center gap-4 pr-10">
              <Image
                src="/icons/icon-192x192.png"
                alt=""
                width={64}
                height={64}
                className="size-16 shrink-0 rounded-2xl shadow-md ring-1 ring-gray-200 dark:ring-white/10"
              />
              <div className="min-w-0">
                <p
                  id="install-heading"
                  className="text-lg leading-tight font-extrabold tracking-tight"
                >
                  {isInstalled ? "ToolsTrek is installed" : "Install ToolsTrek"}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Free · works like a real app
                </p>
              </div>
            </div>

            {isInstalled ? (
              <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Open it from your home screen or app list to use it in
                standalone mode.
              </p>
            ) : isIos ? (
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-white/5">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-brandColor/10 text-brandColor dark:bg-brandColor/20 dark:text-purple-300">
                  <Share className="size-4" aria-hidden="true" />
                </span>
                <p className="min-w-0 text-sm leading-5 font-medium">
                  Tap Share, then Add to Home Screen
                </p>
              </div>
            ) : canPrompt ? (
              <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Add ToolsTrek to your device — it opens in its own window, just
                like a real app.
              </p>
            ) : (
              <ol className="mt-4 space-y-2.5">
                {installSteps.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brandColor/10 text-brandColor dark:bg-brandColor/20 dark:text-purple-300">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 text-sm leading-5 font-medium">
                      {text}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-5 space-y-2">
              {canPrompt && (
                <button
                  type="button"
                  onClick={handleNativeInstall}
                  disabled={isPrompting}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brandColor px-5 text-base font-bold text-white transition hover:bg-brandColorHover focus-visible:ring-2 focus-visible:ring-brandColor focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-70"
                >
                  {isPrompting ? "Opening install…" : "Install now"}
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className={
                  canPrompt
                    ? "inline-flex min-h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-brandColor focus-visible:outline-none dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                    : "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brandColor px-5 text-base font-bold text-white transition hover:bg-brandColorHover focus-visible:ring-2 focus-visible:ring-brandColor focus-visible:ring-offset-2 focus-visible:outline-none"
                }
              >
                {canPrompt ? "Not now" : "Got it"}
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
