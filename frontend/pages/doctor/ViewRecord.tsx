import { Tabs } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LabResultView, MedicalRecordView, MedicationView } from "../../components";
import { decryptData, fetchProfile, fetchRecord, processRecords } from "../../utils/util.ts";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEthContractContext } from "@/context/sepoliaContract.tsx";
import { aptos, moduleAddress } from "@/utils/aptos.ts";

interface Record {
  recordHash: string;
  recordType: string;
  recordDetails: string;
  addedBy: string;
}

interface ProcessedRecord {
  date: string;
  time: string;
  location: string;
  medications: any[];
  current: boolean;
  recordHash: string;
  addedBy: string;
  patientName: string;
  patientAddress: string;
}

interface CategorizedRecords {
  labResults: {
    data: string;
    hash: string;
    addedBy: string;
    patientAddress: string;
    patientName: string;
  }[];
  medicalRecords: {
    data: string;
    hash: string;
    addedBy: string;
    patientAddress: string;
    patientName: string;
  }[];
  medications: ProcessedRecord[];
}

const ViewRecord = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [patientAddress, setPatientAddress] = useState<string | undefined>(location.state?.address);
  const [patientName, setPatientName] = useState<string | undefined>(location.state?.name);

  const { account } = useWallet();
  const { connectedAddress } = useEthContractContext();
  let blockchain = import.meta.env.VITE_APP_BlockChain;
  const [wallet, setWallet] = useState("");

  const [records, setRecords] = useState<CategorizedRecords>({
    labResults: [],
    medicalRecords: [],
    medications: [],
  });

  const handleRecords = useCallback(
    (accountData: Record[]) => {
      const categorizedRecords: CategorizedRecords = {
        labResults: [],
        medicalRecords: [],
        medications: [],
      };

      accountData.forEach((record) => {
        const decryptedData = decryptData(record.recordDetails);
        switch (record.recordType) {
          case "labResults":
            categorizedRecords.labResults.push({
              data: decryptedData,
              hash: record.recordHash,
              addedBy: record.addedBy,
              patientAddress: patientAddress ?? "",
              patientName: patientName ?? "",
            });
            break;
          case "medicalRecords":
            categorizedRecords.medicalRecords.push({
              data: decryptedData,
              hash: record.recordHash,
              addedBy: record.addedBy,
              patientAddress: patientAddress ?? "",
              patientName: patientName ?? "",
            });
            break;
          case "medication":
            const processedRecords = processRecords([decryptedData]).map((processedRecord: any) => ({
              ...processedRecord,
              recordHash: record.recordHash,
              addedBy: record.addedBy,
              patientAddress: patientAddress ?? "",
              patientName: patientName ?? "",
            }));
            categorizedRecords.medications.push(...processedRecords);
            break;
          default:
            break;
        }
      });

      setRecords({
        labResults: categorizedRecords.labResults.reverse(),
        medicalRecords: categorizedRecords.medicalRecords.reverse(),
        medications: categorizedRecords.medications.reverse(),
      });
    },
    [patientAddress, patientName],
  );

  const getPatientEMR = useCallback(async () => {
    // try {
    //   if (!patientAddress) {
    //     console.error("Patient address is not defined.");
    //     return;
    //   }
    //   const publicKey = new web3.PublicKey(patientAddress);
    //   const patientWallet = { publicKey } as Wallet;
    //   let response = await fetchRecord(connection, patientWallet);
    //   if (response.status === "success" && response.data) {
    //     const accountData = (response.data as { records: Record[] }).records;
    //     handleRecords(accountData);
    //   }
    // } catch (error) {
    //   console.error("Error creating PublicKey or fetching records:", error);
    // }
    if (blockchain === "Aptos") {
      const emrListResource = await aptos.getAccountResource({
        accountAddress: patientAddress ?? "",
        resourceType: `${moduleAddress}::remed::EMRList`,
      });
      const accountData = (emrListResource as { records: Record[] }).records;
      handleRecords(accountData);
      console.log("emrListResource", emrListResource);
    }
  }, [handleRecords]);

  const checkAuthority = useCallback(async () => {
    const getProfile = async () => {
      if (account) {
        let response = await fetchProfile(account.address);
        if (response.status === "success") {
          if (response.data.role === "patient") {
            navigate("/");
          } else if (response.data.role === "doctor") {
            getPatientEMR();
          } else if (response.data.role === "researcher") {
            navigate("/");
          }
        }
      } else {
        navigate("/");
      }
    };

    getProfile();
  }, [navigate, getPatientEMR]);

  useEffect(() => {
    checkAuthority();
  }, [checkAuthority]);

  useEffect(() => {
    if (location.state?.refresh) {
      if (location.state.address) setPatientAddress(location.state.address);
      if (location.state.name) setPatientName(location.state.name);

      getPatientEMR();
      // Clear the state to prevent continuous re-fetching
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, getPatientEMR, navigate, location.pathname]);

  const tabItems = [
    {
      label: "Medical Records",
      key: "1",
      children: <MedicalRecordView records={records.medicalRecords} userWallet={wallet ?? ""} />,
    },
    {
      label: "Medications",
      key: "2",
      children: <MedicationView records={records.medications} userWallet={wallet ?? ""} />,
    },
    {
      label: "Lab Results",
      key: "3",
      children: <LabResultView records={records.labResults} userWallet={wallet ?? ""} />,
    },
  ];

  return (
    <>
      <div className="font-semibold underline text-xl text-[#124588] mb-4 pl-2">
        View Patient's EMRs - {patientName}
      </div>
      <Tabs type="card" items={tabItems} />
    </>
  );
};

export default ViewRecord;
