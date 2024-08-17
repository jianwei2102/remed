import axios from "axios";
import { useEffect, useState } from "react";
import { fetchProfile } from "../utils/util.ts";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Welcoming, UserRegister, PatientDashboard, DoctorDashboard, ResearcherDashboard } from ".";
import { Authorization, EMR, useEthContractContext } from "@/context/sepoliaContract";

const HomePage = () => {
  let [page, setPage] = useState("Welcoming");
  const { connectedAddress } = useEthContractContext();
  const { account } = useWallet();

  useEffect(() => {
    const getProfile = async () => {
      let blockchain = import.meta.env.VITE_APP_BlockChain;
      let wallet: any = null;
      console.log(blockchain);
      if (blockchain === "Ethereum") {
        wallet = connectedAddress;
      } else if (blockchain === "Aptos") {
        wallet = account?.address;
      }
      if ((!account && blockchain === "Aptos") || (!connectedAddress && blockchain === "Ethereum")) {
        console.log("Connection or wallet not available");
        setPage("Welcoming");
        return;
      } else {
        try {
          let response = await fetchProfile(wallet);
          console.log(response);

          if (response.status === "success") {
            if (response.data === null) {
              setPage("Register");
              return;
            }

            if (response.data.role === "patient") {
              setPage("Patient");
            } else if (response.data.role === "doctor") {
              setPage("Doctor");
            } else if (response.data.role === "researcher") {
              setPage("Researcher");
            }
          } else {
            // Direct to register if unable to find profile
            setPage("Welcoming");
          }
        } catch (error) {
          setPage("Welcoming");
        }
      }
    };

    getProfile();
  }, [account]);

  return (
    <>
      {page === "Welcoming" && <Welcoming />}
      {page === "Researcher" && <ResearcherDashboard />}
      {page === "Patient" && <PatientDashboard />}
      {page === "Doctor" && <DoctorDashboard />}
      {page === "Register" && <UserRegister />}
    </>
  );
};

export default HomePage;
