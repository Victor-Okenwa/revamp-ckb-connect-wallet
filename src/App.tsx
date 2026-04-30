import { ConnectWallet, ConnectWalletButton, ConnectWalletInfoAddress, ConnectWalletInfoBalance, ConnectWalletInfoContainer, ConnectWalletInfoImage } from './components/connect-wallet-enhanced';
// import ConnectWallet from './components/ConnectWallet';

function App() {

  return (
    <div className="flex flex-col items-center">

      <main className="flex flex-col gap-8 row-start-2 items-center max-w-2xl">
        <hgroup>
          <h1 className='text-xl'>CKB Connect Wallet Component Refactor </h1>
        </hgroup>

        <div className="flex gap-4 items-center justify-center">

          <div>
            <h3>NEW</h3>
            <ConnectWallet>
              <ConnectWalletButton />

              <ConnectWalletInfoContainer className="flex gap-1">

                <ConnectWalletInfoImage />

                <div className="flex flex-col gap-2">
                  <ConnectWalletInfoBalance withCurrency={false} />
                  <ConnectWalletInfoAddress frontChars={5} endChars={12} />
                </div>
              </ConnectWalletInfoContainer>
            </ConnectWallet>

          </div>

          {/* <div>
            <h3>OLD</h3>
            <ConnectWallet />
          </div> */}
        </div>

        <a
          className="rounded-full border border-solid border-black dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
          href="https://docs.ckbccc.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read docs
        </a>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://github.com/ckb-devrel/ccc"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              aria-hidden
              src="/images/github.svg"
              alt="github icon"
              width={16}
              height={16}
            />
            GitHub
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://app.ckbccc.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              aria-hidden
              src="/images/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            Examples
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://x.com/CKBDevrel"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              aria-hidden
              src="/images/x-logo.svg"
              alt="x icon"
              width={16}
              height={16}
            />
            Follow us →
          </a>
        </footer>
      </main>
    </div>
  );
}

export default App;
