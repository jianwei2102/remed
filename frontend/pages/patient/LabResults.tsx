import { useNavigate } from "react-router-dom";
import { LabResultItem } from "../../components";
import { useCallback, useEffect, useState } from "react";
import { decryptData, fetchProfile, fetchRecord } from "../../utils/util.ts";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEthContractContext } from "@/context/sepoliaContract.tsx";
import { aptos, moduleAddress } from "@/utils/aptos.ts";

interface Record {
  recordHash: string;
  recordType: string;
  recordDetails: string;
  addedBy: string;
}

interface LabResultItemProps {
  data: string;
  hash: string;
  addedBy: string;
  patientAddress: string;
  patientName: string;
}
const LabResults = () => {
  const navigate = useNavigate();

  const [labResults, setLabResults] = useState<LabResultItemProps[]>([]);

  const { account, signAndSubmitTransaction } = useWallet();
  const { connectedAddress } = useEthContractContext();
  let blockchain = import.meta.env.VITE_APP_BlockChain;
  const [wallet, setWallet] = useState("");

  const getLabResults = useCallback(async () => {
    // let response = await fetchRecord(connection, wallet);
    // if (response.status === "success") {
    //   let accountData = (
    //     response.data as {
    //       records: Record[];
    //     }
    //   ).records;
    //   // Filter records where recordType is "labResults"
    //   let filteredRecords = accountData.filter(
    //     (record) => record.recordType === "labResults"
    //   );
    //   // Decrypt recordDetails
    //   let decryptedRecords = filteredRecords
    //     .map((record) => ({
    //       data: decryptData(record.recordDetails, "record"),
    //       hash: record.recordHash,
    //       addedBy: record.addedBy,
    //       patientAddress: "",
    //       patientName: "",
    //     }))
    //     .reverse();
    //   console.log(decryptedRecords);
    //   setLabResults(decryptedRecords);
    //   // console.log(medicalRecordsHash);
    // }

    if (blockchain === "Aptos") {
      const emrListResource = await aptos.getAccountResource({
        accountAddress: wallet,
        resourceType: `${moduleAddress}::remed::EMRList`,
      });
      const accountData = (emrListResource as { records: Record[] }).records;
      // console.log("accountData", accountData);
      // Filter records where recordType is "medicalRecord"
      let filteredRecords = accountData.filter((record) => record.recordType === "labResults");
      // console.log("filteredRecords", filteredRecords);
      // Decrypt and map recordDetails
      let decryptedRecords = filteredRecords.map((record) => ({
        data: decryptData(record.recordDetails),
        hash: record.recordHash,
        addedBy: record.addedBy,
        patientAddress: "",
        patientName: "",
      }));
      console.log(decryptedRecords);
      setLabResults(decryptedRecords);
    }
  }, [account, wallet]);

  const getProfile = useCallback(async () => {
    if (blockchain === "Ethereum") {
      setWallet(connectedAddress ? connectedAddress : "");
    } else if (blockchain === "Aptos") {
      setWallet(account?.address ? account?.address : "");
    } else {
      navigate("/");
    }

    let response = await fetchProfile(wallet);
    console.log(response);

    if (response.status === "success") {
      if (response.data === null) {
        navigate("/");
      }

      if (response.data.role === "patient") {
        getLabResults();
      } else if (response.data.role === "doctor") {
        navigate("/");
      } else if (response.data.role === "researcher") {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate, getLabResults]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    const getProfile = async () => {
      if (!connected || !account) {
        console.log("Connection or wallet not found!");
        navigate("/");
        return;
      }
      let response = await fetchProfile(account.address);
      if (response.status === "success") {
        
        if (response.data.role !== "patient") {
          navigate("/");
        } 
      } else {
        navigate("/");
      }
    };
    getProfile();
  }, [account]);

  return (
    <div>
      <div className="font-semibold text-xl mb-4">Lab Results</div>
      {labResults.map((record, index) => (
        <LabResultItem key={index} record={record} sameDoctor={false} />
      ))}

      {labResults?.length === 0 && (
        <div className="text-center py-4 text-lg text-gray-500 border rounded-xl">No lab results found!</div>
      )}
    </div>
  );
};

export default LabResults;
