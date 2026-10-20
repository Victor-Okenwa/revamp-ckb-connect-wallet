import { useEffect, useState } from "react";
import { ComponentsPage } from "./components-page";
import { UsagePage } from "./demo-page";
import { HeaderWallet, HomePage } from "./home";

const NPM_URL = "https://www.npmjs.com/package/ckb-connect-wallet-kit";
const REPO_URL = "https://github.com/Victor-Okenwa/revamp-ckb-connect-wallet";
const ISSUES_URL = "https://github.com/Victor-Okenwa/revamp-ckb-connect-wallet/issues";

type Route = "home" | "components" | "usage";

function readRoute(hash = window.location.hash): Route {
  if (hash === "#/usage" || hash === "#/demo") return "usage";
  if (hash === "#/components") return "components";
  return "home";
}

function scrollToHash() {
  const hash = window.location.hash;
  if (hash === "" || hash === "#/" || hash === "#/usage" || hash === "#/components" || hash === "#/demo") {
    window.scrollTo(0, 0);
    return;
  }
  if (hash.startsWith("#/")) return;
  const id = hash.slice(1);
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  });
}

function App() {
  const [route, setRoute] = useState<Route>(readRoute);
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#/demo") {
        window.location.hash = "#/usage";
        return;
      }
      setHash(window.location.hash);
      setRoute(readRoute());
      scrollToHash();
    };
    window.addEventListener("hashchange", onHash);
    if (window.location.hash === "#/demo") {
      window.location.hash = "#/usage";
    } else {
      scrollToHash();
    }
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (route === "home") scrollToHash();
  }, [route]);

  return (
    <div className="min-h-screen">
      <header className={route === "home"
        ? "sticky top-0 z-20 border-b border-white/10 bg-black/70 text-white backdrop-blur"
        : "sticky top-0 z-20 border-b border-black/10 bg-[var(--background)]/90 backdrop-blur dark:border-white/10"
      }>
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-5 py-4 sm:grid-cols-[auto_1fr_auto]">
          <a href="#/" className="text-sm font-semibold tracking-tight">
            <span className="hidden lg:inline">CKB Connect Wallet Kit</span>
            <span className="lg:hidden">CKBWCK</span>
          </a>
          <nav className="col-span-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:col-span-1 sm:col-start-2 sm:justify-self-center">
            <a href="#/" className={route === "home" && hash !== "#install" ? "underline" : "hover:underline"}>Home</a>
            <a href="#/components" className={route === "components" ? "underline" : "hover:underline"}>Components</a>
            <a href="#/usage" className={route === "usage" ? "underline" : "hover:underline"}>Usage</a>
            <a href="#install" className={hash === "#install" ? "underline" : "hover:underline"}>Install</a>
            <a href={NPM_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">npm</a>
          </nav>
          <div className="col-start-2 row-start-1 sm:col-start-3">
            <HeaderWallet />
          </div>
        </div>
      </header>

      <main>
        {route === "home" && <HomePage />}
        {route === "components" && <ComponentsPage />}
        {route === "usage" && <UsagePage />}
      </main>

      <footer className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-8 text-sm">
          <a className="inline-flex items-center gap-2 hover:underline" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <img src="/images/github.svg" alt="" width={16} height={16} />
            Repository
          </a>
          <a className="hover:underline" href={ISSUES_URL} target="_blank" rel="noopener noreferrer">Report a bug</a>
          <a className="hover:underline" href={NPM_URL} target="_blank" rel="noopener noreferrer">npm</a>
          <a className="inline-flex items-center gap-2 hover:underline" href="https://github.com/ckb-devrel/ccc" target="_blank" rel="noopener noreferrer">
            CCC
          </a>
          <a className="inline-flex items-center gap-2 hover:underline" href="https://x.com/CKBDevrel" target="_blank" rel="noopener noreferrer">
            <img src="/images/x-logo.svg" alt="" width={16} height={16} />
            CKB DevRel
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
