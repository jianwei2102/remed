import { Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { LabResultForm, MedicalRecordForm, MedicationForm } from "../../components";

const AppendRecord = () => {
  const navigate = useNavigate();

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
