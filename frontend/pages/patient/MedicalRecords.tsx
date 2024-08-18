import { useNavigate } from "react-router-dom";
import { MedicalRecordItem } from "../../components";
import { useCallback, useEffect, useState } from "react";
import { decryptData, fetchProfile, fetchRecord } from "../../utils/util.ts";
import { useEthContractContext } from "@/context/sepoliaContract.tsx";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptos, moduleAddress } from "@/utils/aptos.ts";

interface Record {
  recordHash: string;
  recordType: string;
  recordDetails: string;
  addedBy: string;
}

interface MedicalRecord {
  data: string;
  hash: string;
  addedBy: string;
  patientAddress: string;
  patientName: string;
}

const MedicalRecords = () => {
  const navigate = useNavigate();

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  const { account } = useWallet();
  const { connectedAddress } = useEthContractContext();
  let blockchain = import.meta.env.VITE_APP_BlockChain;
  const [wallet, setWallet] = useState("");

  const getMedicalRecords = useCallback(async () => {
    // let response = await fetchRecord(connection, wallet as Wallet);
    // if (response.status === "success") {
    //   let accountData = (
    //     response.data as {
    //       records: Record[];
    //     }
    //   ).records;
    //   // Filter records where recordType is "medicalRecord"
    //   let filteredRecords = accountData.filter((record) => record.recordType === "medicalRecords");
    //   // Decrypt and map recordDetails
    //   let decryptedRecords = filteredRecords.map((record) => ({
    //     data: decryptData(record.recordDetails, "record"),
    //     hash: record.recordHash,
    //     addedBy: record.addedBy,
    //     patientAddress: "",
    //     patientName: "",
    //   }));
    //   setMedicalRecords(decryptedRecords.reverse());
    // }
    if (blockchain === "Aptos") {
      const emrListResource = await aptos.getAccountResource({
        accountAddress: wallet,
        resourceType: `${moduleAddress}::remed::EMRList`,
      });
      const accountData = (emrListResource as { records: Record[] }).records;
      // console.log("accountData", accountData);
      // Filter records where recordType is "medicalRecord"
      let filteredRecords = accountData.filter((record) => record.recordType === "medicalRecords");
      // console.log("filteredRecords", filteredRecords);
      // Decrypt and map recordDetails
      let decryptedRecords = filteredRecords.map((record) => ({
        data: decryptData(record.recordDetails),
        hash: record.recordHash,
        addedBy: record.addedBy,
        patientAddress: "",
        patientName: "",
      }));
      setMedicalRecords(decryptedRecords.reverse());
      // console.log("decryptedRecords", decryptedRecords);
    }
  }, []);

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
        getMedicalRecords();
      } else if (response.data.role === "doctor") {
        navigate("/");
      } else if (response.data.role === "researcher") {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate, getMedicalRecords]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    const getProfile = async () => {
      if (!account) {
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
      <div className="font-semibold text-xl mb-4">Medical Record</div>
      {medicalRecords.map((record, index) => (
        <MedicalRecordItem key={index} record={record} sameDoctor={false} />
      ))}

      {medicalRecords.length === 0 && (
        <div className="text-center py-4 text-lg text-gray-500 border rounded-xl">No medical record found!</div>
      )}
    </div>
  );
};

export default MedicalRecords;
