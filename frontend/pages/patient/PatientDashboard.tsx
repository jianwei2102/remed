import { Button, message } from "antd";
import { LuPill } from "react-icons/lu";
import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { MdOutlinePeopleAlt } from "react-icons/md";
import img from "../../assets/patientDashboard.png";
import { AuthorizationCard, MedicationCard } from "../../components/";

import { decryptData, fetchAuthDoctor, fetchRecord, processRecords } from "../../utils/util.ts";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEthContractContext } from "@/context/sepoliaContract.tsx";
import { aptos, moduleAddress } from "@/utils/aptos.ts";

interface AuthorizedDoctor {
  address: string;
  date: string;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [authorized, setAuthorized] = useState<AuthorizedDoctor[]>([]);
  const [activeMedications, setActiveMedications] = useState<any[]>([]);

  const { account, signAndSubmitTransaction } = useWallet();
  const { connectedAddress } = useEthContractContext();
  let blockchain = import.meta.env.VITE_APP_BlockChain;
  const [wallet, setWallet] = useState("");

  const getAuthDoctor = useCallback(async () => {
    if (blockchain === "Aptos") {
      const authListResource = await aptos.getAccountResource({
        accountAddress: wallet,
        resourceType: `${moduleAddress}::remed::AuthList`,
      });
      console.log("authListResource", authListResource);
      setAuthorized((authListResource as { authorized: AuthorizedDoctor[] })?.authorized.reverse());

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
          }[];
        }
      ).records;
      console.log("accountData", accountData);
      // Filter records where recordType is "medicalRecord"
      let filteredRecords = accountData.filter((record) => record.recordType === "medication");
      // console.log("filteredRecords", filteredRecords);
      // Decrypt and map recordDetails
      let decryptedRecords = filteredRecords
        .map((record) => {
          return decryptData(record.recordDetails);
        })
        .reverse();
      const processedRecords = processRecords(decryptedRecords)
        .flatMap((record) => record.medications)
        .filter((med: any) => med.current) // Filter to get current medications
        .slice(0, 3); // Get the first 3 medications

      setActiveMedications(processedRecords);
    }
  }, [account, wallet]);

  useEffect(() => {
    //       // Filter records where recordType is "medication"
    //       let filteredRecords = accountData.filter((record) => record.recordType === "medication");
    //       // Decrypt recordDetails
    //       let decryptedRecords = filteredRecords
    //         .map((record) => {
    //           return decryptData(record.recordDetails, "record");
    //         })
    //         .reverse();
    //       // Process records to determine current and past medications
    //       const processedRecords = processRecords(decryptedRecords);
    //       // Extract at most 3 active medications
    //       const activeMedications = processedRecords
    //         .flatMap((record) => record.medications)
    //         .filter((med: any) => med.current) // Filter to get current medications
    //         .slice(0, 3); // Get the first 3 medications
    //       setActiveMedications(activeMedications);
    //     }
    //   });
    // }
    if (blockchain === "Ethereum") {
      setWallet(connectedAddress ? connectedAddress : "");
    } else if (blockchain === "Aptos") {
      setWallet(account?.address ? account?.address : "");
    } else {
      navigate("/");
    }

    getAuthDoctor();
  }, [getAuthDoctor]);

  const revokeDoctorCallback = (doctorAddress: string) => {
    setAuthorized((prev) => prev.filter((item) => item.address !== doctorAddress));
    messageApi.open({
      type: "success",
      content: "Doctor revoked successfully",
    });
  };

  return (
    <div>
      {contextHolder}
      <div className="flex flex-row justify-between rounded-3xl text-white text-xl bg-[#37CAEC] mb-8">
        <div className="flex flex-col justify-center items-start pl-10 gap-3">
          <div className="font-semibold">Hello, {sessionStorage.getItem("name")}!! 👋</div>
          <div>
            Welcome to <span className="font-semibold">ReMed</span>, where you have full control over your medical
            records and enjoy personalized healthcare!
          </div>
        </div>
        <img src={img} className="max-h-40" alt="Dashboard" />
      </div>

      <div className="flex flex-row justify-between gap-4">
        <div className="basis-1/2 border rounded-lg p-4 min-h-96">
          <div className="flex flew-col justify-between h-12">
            <div className="flex justify-center items-center">
              <div className="p-2 bg-[#E8EDFF] rounded-full mr-2">
                <LuPill size="20" color="1F51FF" />
              </div>
              <div className="font-semibold text-xl">Current Medications</div>
            </div>
            <div className="flex justify-center items-center">
              <Button type="link" onClick={() => navigate("/medications")}>
                View All
              </Button>
            </div>
          </div>
          <div>
            {activeMedications.length > 0 ? (
              activeMedications.map((medication, index) => <MedicationCard key={index} medication={medication} />)
            ) : (
              <div className="text-center py-4 text-lg text-gray-500">No current medications</div>
            )}
          </div>
        </div>

        <div className="basis-1/2 border rounded-lg p-4 min-h-96">
          <div className="flex flew-col justify-between">
            <div className="flex justify-center items-center h-12">
              <div className="p-2 bg-[#E8EDFF] rounded-full mr-2">
                <MdOutlinePeopleAlt size="20" color="1F51FF" />
              </div>
              <div className="flex flex-col gap-0">
                <span className="font-semibold text-xl">Doctor List</span>
                {/* <span className="text-sm italic">Pending Action</span> */}
              </div>
            </div>
            <div className="flex justify-center items-center">
              <Button type="link" onClick={() => navigate("/authorization")}>
                View All
              </Button>
            </div>
          </div>
          <div>
            {authorized
              ?.slice(0, 3)
              .map((item, index) => (
                <AuthorizationCard
                  key={index}
                  doctorDetails={item as unknown as { address: string; date: string }}
                  revokeDoctorCallback={revokeDoctorCallback}
                />
              ))}

            {authorized?.length === 0 && (
              <div className="text-center py-4 text-lg text-gray-500">No authorized doctors</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
