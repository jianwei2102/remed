import axios from "axios";
import { useEffect, useState } from "react";
import { fetchProfile } from "../utils/util.ts";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Welcoming, UserRegister, PatientDashboard, DoctorDashboard } from ".";

const HomePage = () => {
  let [page, setPage] = useState("Register");
  const { account, connected } = useWallet();

  useEffect(() => {
    // const getProfile = async () => {
    //   if (!connection || !wallet) {
    //     console.log("Connection or wallet not available");
    //     setPage("Welcoming");
    //     return;
    //   }
    //   let response = await fetchProfile(connection, wallet as Wallet);
    //   if (response.status === "success") {
    //     if ((response.data as { role: string }).role === "patient") {
    //       setPage("Patient");
    //     } else if ((response.data as { role: string }).role === "doctor") {
    //       setPage("Doctor");
    //     }
    //   } else {
    //     // Direct to register if unable to find profile
    //     setPage("Register");
    //   }
    // };
    // getProfile();

    const getProfile = async () => {

      if (!account) {
        console.log("Connection or wallet not available");
        setPage("Welcoming");
        return;
      } else {
        let response = await axios.get(`http://localhost:4000/users/${account.address}`);
        
        console.log(response);

        if (response.statusText === "OK") {
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
          setPage("Register");
        }
      }
    }

    getProfile();

  }, [account]);

  return (
    <>
      {page === "Welcoming" && <Welcoming />}
      {page === "Patient" && <PatientDashboard />}
      {page === "Doctor" && <DoctorDashboard />}
      {page === "Register" && <UserRegister />}
    </>
  );
};

export default HomePage;
