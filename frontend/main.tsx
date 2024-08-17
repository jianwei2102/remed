import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App.tsx";
// Internal components
import { Toaster } from "@/components/ui/toaster.tsx";
import { WalletProvider } from "@/components/WalletProvider.tsx";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { EthContractContextProvider } from "./context/sepoliaContract";
import { ScrollContractContextProvider } from "./context/scrollContract";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProvider>
      <ThirdwebProvider activeChain="sepolia" clientId="3f33962239246b3007a4d12abe30b107">
        <EthContractContextProvider>
          <ScrollContractContextProvider>
            <App />
            <Toaster />
          </ScrollContractContextProvider>
        </EthContractContextProvider>
      </ThirdwebProvider>
    </WalletProvider>
  </React.StrictMode>,
);
