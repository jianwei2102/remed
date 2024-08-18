import { useNavigate } from "react-router-dom";
import { MedicationItem } from "../../components";
import { useCallback, useEffect, useState } from "react";

import { decryptData, fetchProfile, fetchRecord, processRecords } from "../../utils/util.ts";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEthContractContext } from "@/context/sepoliaContract.tsx";
import { aptos, moduleAddress } from "@/utils/aptos.ts";

const Medications = () => {
  const navigate = useNavigate();
  const { account, connected } = useWallet();

  const [medications, setMedications] = useState<any[]>([]);
  const [medicationHash, setMedicationHash] = useState<string[]>([]);

  const { connectedAddress } = useEthContractContext();
  let blockchain = import.meta.env.VITE_APP_BlockChain;
  const [wallet, setWallet] = useState("");

  const getMedication = useCallback(async () => {
    // let response: { status: string; data: any } = await fetchRecord(connection, wallet);
    // if (response.status === "success") {
    //   let accountData = (
    //     response.data as {
    //       records: {
    //         recordHash: string;
    //         recordType: string;
    //         recordDetails: string;
    //         addedBy: string;
    //       }[];
    //     }
    //   ).records;
    //   // Filter records where recordType is "medication"
    //   let filteredRecords = accountData.filter((record) => record.recordType === "medication").reverse();
    //   // Decrypt recordDetails
    //   let decryptedRecords = filteredRecords.map((record) => {
    //     return decryptData(record.recordDetails, "record");
    //   });
    //   // Process records
    //   const processedRecords = processRecords(decryptedRecords).map((processedRecord: any) => ({
    //     ...processedRecord,
    //     addedBy: response.data.addedBy,
    //   }));
    //   setMedications(processedRecords);
    //   setMedicationHash(filteredRecords.map((record) => record.recordHash));
    // }
    if (blockchain === "Aptos") {
      const emrListResource = await aptos.getAccountResource({
        accountAddress: wallet,
        resourceType: `${moduleAddress}::remed::EMRList`,
      });
      const accountData = (
        emrListResource as {
          records: {
            recordHash: string;
            recordType: string;
            recordDetails: string;
            addedBy: string;
          }[];
        }
      ).records;
      console.log("accountData", accountData);
      // Filter records where recordType is "medicalRecord"
      let filteredRecords = accountData.filter((record) => record.recordType === "medication").reverse();
      // console.log("filteredRecords", filteredRecords);
      // Decrypt and map recordDetails
      let decryptedRecords = filteredRecords.map((record) => {
        return decryptData(record.recordDetails);
      });
      const processedRecords = processRecords(decryptedRecords).map((processedRecord: any) => ({
        ...processedRecord,
        addedBy: accountData.addedBy,
      }));
      setMedications(processedRecords);
      setMedicationHash(filteredRecords.map((record) => record.recordHash));
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
        getMedication();
      } else if (response.data.role === "doctor") {
        navigate("/");
      } else if (response.data.role === "researcher") {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate, getMedication]);

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
    <div className="overflow-y-auto h-full">
      <div className="font-semibold text-xl mb-4">Medication</div>
      <div className="font-semibold text-lg mb-4">Current Medications</div>
      {medications
        .filter((medication) => medication.current)
        .map((medication, index) => (
          <MedicationItem
            key={index}
            medication={medication}
            recordHash={medicationHash[index]}
            sameDoctor={medication.addedBy === wallet} //
          />
        ))}
      {medications.filter((medication) => medication.current)?.length === 0 && (
        <div className="text-center py-4 text-lg text-gray-500 border rounded-xl">No current medical record found!</div>
      )}

      <div className="font-semibold text-lg mb-4">Past Medication</div>
      {medications
        .filter((medication) => !medication.current)
        .map((medication, index) => (
          <MedicationItem key={index} medication={medication} recordHash={medicationHash[index]} sameDoctor={false} />
        ))}

      {medications.filter((medication) => !medication.current)?.length === 0 && (
        <div className="text-center py-4 text-lg text-gray-500 border rounded-xl">No past medical record found!</div>
      )}
    </div>
  );
};

export default Medications;
