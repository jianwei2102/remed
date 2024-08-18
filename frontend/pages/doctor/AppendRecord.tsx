import { Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { LabResultForm, MedicalRecordForm, MedicationForm } from "../../components";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { fetchProfile } from "../../utils/util.ts";

const AppendRecord = () => {
  const navigate = useNavigate();
  const { account, connected } = useWallet();

  const checkAuthority = useCallback(async () => {
    // if (!connection || !wallet) {
    //   navigate("/");
    //   return;
    // }
    // let response = await fetchProfile(connection, wallet);
    // if (response.status === "success") {
    //   const role = (response.data as { role: string }).role;
    //   if (role === "patient") {
    //     navigate("/");
    //   }
    // } else {
    //   navigate("/");
    // }
  }, [navigate]);

  useEffect(() => {
    checkAuthority();
  }, [checkAuthority]);

  useEffect(() => {
    const getProfile = async () => {
      if (!connected || !account) {
        console.log("Connection or wallet not found!");
        navigate("/");
        return;
      }
      let response = await fetchProfile(account.address);
      if (response.status === "success") {
        if (response.data.role !== "doctor") {
          navigate("/");
        }
      } else {
        navigate("/");
      }
    };
    getProfile();
  }, [account]);

  const tabItems = [
    {
      label: "Medical Records",
      key: "1",
      children: <MedicalRecordForm />,
    },
    {
      label: "Medications",
      key: "2",
      children: <MedicationForm />,
    },
    {
      label: "Lab Results",
      key: "3",
      children: <LabResultForm />,
    },
  ];

  return (
    <>
      <Tabs type="card" items={tabItems} />
    </>
  );
};

export default AppendRecord;
