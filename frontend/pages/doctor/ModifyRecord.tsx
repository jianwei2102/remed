import { useCallback, useEffect } from "react";
import { fetchProfile } from "../../utils/util.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { LabResultModify, MedicalRecordModify, MedicationModify } from "../../components";

const ModifyRecord = () => {
  const location = useLocation();
  const navigate = useNavigate();

  console.log("Props passed to ModifyRecord:", location.state);

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

  return (
    <>
      {location.state?.type === "medicalRecord" && <MedicalRecordModify />}
      {location.state?.type === "labResult" && <LabResultModify />}
      {location.state?.type === "medication" && <MedicationModify />}
    </>
  );
};

export default ModifyRecord;
