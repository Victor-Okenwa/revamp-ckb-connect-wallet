import { useEffect, useState } from "react";
import { ComponentsPage } from "./components-page";
import { DemoPage } from "./demo-page";
import { HeaderWallet, HomePage } from "./home";

const NPM_URL = "https://www.npmjs.com/package/ckb-connect-wallet-kit";
const REPO_URL = "https://github.com/Victor-Okenwa/revamp-ckb-connect-wallet";

type Route = "home" | "components" | "demo";

function readRoute(): Route {
  if (window.location.hash === "#/components") return "components";
  if (window.location.hash === "#/demo") return "demo";
  return "home";
}

function App() {
  const [route, setRoute] = useState<Route>(readRoute);

  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-[var(--background)]/90 backdrop-blur dark:border-white/10">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-5 py-4 sm:grid-cols-[auto_1fr_auto]">
          <a href="#/" className="flex items-center gap-3">
            <img src="/images/ccc-logo.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight">ckb-connect-wallet-kit</span>
          </a>
          <nav className="col-span-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:col-span-1 sm:col-start-2 sm:justify-self-center">
            <a href="#/" className={route === "home" ? "underline" : "hover:underline"}>Home</a>
            <a href="#/components" className={route === "components" ? "underline" : "hover:underline"}>Components</a>
            <a href="#/demo" className={route === "demo" ? "underline" : "hover:underline"}>Demo</a>
            <a href={NPM_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">npm</a>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
          </nav>
          <div className="col-start-2 row-start-1 sm:col-start-3">
            <HeaderWallet />
          </div>
        </div>
      </header>

      <main>
        {route === "home" && <HomePage />}
        {route === "components" && <ComponentsPage />}
        {route === "demo" && <DemoPage />}
      </main>

      <footer className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-8 text-sm">
          <a className="inline-flex items-center gap-2 hover:underline" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <img src="/images/github.svg" alt="" width={16} height={16} />
            Repository
          </a>
          <a className="hover:underline" href={NPM_URL} target="_blank" rel="noopener noreferrer">npm</a>
          <a className="inline-flex items-center gap-2 hover:underline" href="https://github.com/ckb-devrel/ccc" target="_blank" rel="noopener noreferrer">
            CCC
          </a>
          <a className="inline-flex items-center gap-2 hover:underline" href="https://app.ckbccc.com" target="_blank" rel="noopener noreferrer">
            <img src="/images/window.svg" alt="" width={16} height={16} />
            Examples
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
