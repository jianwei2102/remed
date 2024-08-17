import { ConnectWallet } from "@thirdweb-dev/react";
// import { WalletSelector } from "./WalletSelector";

export function Header() {
  return (
    <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
      <h1 className="display">Boilerplate Template</h1>

      <div className="flex gap-2 items-center flex-wrap">
        {/* Solana wallet */}
        {/* <WalletSelector /> */}

        {/* Sepolia and Scroll Wallet */}
        <ConnectWallet />
      </div>
    </div>
  );
}
