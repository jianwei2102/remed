import { format } from "date-fns";

// const CryptoJS = require("crypto-js");

const createProfile = async (role: String, personalDetails: String) => {
  try {
    // Encrypt the message using the AES key
    const encryptedPersonalDetails = encryptData(personalDetails, "profile");
    console.log(encryptedPersonalDetails);

    return { status: "success", data: encryptedPersonalDetails };
  } catch (error) {
    return { status: "error", data: error };
  }
};

const fetchProfile = async () => {
  try {
    return { status: "success", data: "profileData" };
  } catch (error) {
    console.error("Error reading profile:", error);
    return { status: "error", data: error };
  }
};

const encryptData = (data: String, dataType: String) => {
  // Encrypt the message using the key
  // if (dataType === "profile") {
  //   return CryptoJS.AES.encrypt(data, process.env.REACT_APP_ENCRYPTION_KEY).toString();
  // } else if (dataType === "record") {
  //   return CryptoJS.AES.encrypt(data, process.env.REACT_APP_EMR_ENCRYPTION_KEY).toString();
  // }
  return "";
};

const decryptData = (data: String, dataType: String) => {
  // Decrypt the encrypted message using the same key
  // if (dataType === "profile") {
  //   let decrypted = CryptoJS.AES.decrypt(data, process.env.REACT_APP_ENCRYPTION_KEY);
  //   // Convert the decrypted message from a CryptoJS object to a regular string
  //   return decrypted.toString(CryptoJS.enc.Utf8);
  // } else if (dataType === "record") {
  //   let decrypted = CryptoJS.AES.decrypt(data, process.env.REACT_APP_EMR_ENCRYPTION_KEY);
  //   return decrypted.toString(CryptoJS.enc.Utf8);
  // }
  return "";
};

const authorizeDoctor = async (doctorAddress: string) => {
  try {
    const todayDate = format(new Date(), "MMMM d, yyyy");

    console.log(`Added doc ${doctorAddress} to the permission list.`);
    return { status: "success", data: doctorAddress };
  } catch (error) {
    console.error("Error adding doctor:", error);
    return { status: "error", data: error };
  }
};

const revokeDoctor = async (doctorAddress: string) => {
  try {
    console.log(`Revoke doc ${doctorAddress} from the permission list.`);
    return { status: "success", data: doctorAddress };
  } catch (error) {
    console.error("Error revoking doctor:", error);
    return { status: "error", data: error };
  }
};

const revokePatient = async (patientAddress: string) => {
  try {
    console.log(`Revoke patient ${patientAddress} from the permission list.`);
    return { status: "success", data: patientAddress };
  } catch (error) {
    console.error("Error revoking patient:", error);
    return { status: "error", data: error };
  }
};

const fetchAuthDoctor = async () => {
  try {
    return { status: "success", data: "accountData" };
  } catch (error) {
    console.error("Error reading auth doctor:", error);
    return { status: "error", data: error };
  }
};

const fetchAuthPatient = async () => {
  try {
    return { status: "success", data: "accountData" };
  } catch (error) {
    console.error("Error reading auth patient:", error);
    return { status: "error", data: error };
  }
};

const generateHash = (recordData: String, patientPubKey: String, doctorPubKey: String) => {
  const combinedString = `${recordData}-${patientPubKey}-${doctorPubKey}`;
  console.log("Before Hash", combinedString);
  // Create SHA-256 hash
  // const hash = CryptoJS.SHA256(combinedString).toString(CryptoJS.enc.Hex);
  // console.log("After Hash", hash);
  // return hash;
  return "";
};

const appendRecord = async (recordHash: string, record: string, patientAddress: string, recordType: string) => {
  try {
    console.log(record.toString());
    const encryptedRecord = encryptData(record, "record");

    console.log(`Added record ${recordHash} to the patient ${patientAddress}.`);
    return { status: "success", data: recordHash };
  } catch (error) {
    console.error("Error adding record:", error);
    return { status: "error", data: error };
  }
};

const modifyRecord = async (
  currentRecordHash: string,
  newRecordHash: string,
  record: string,
  patientAddress: string,
) => {
  try {
    console.log(record.toString());
    const encryptedRecord = encryptData(record, "record");

    console.log(`Modified new record ${newRecordHash} to the patient ${patientAddress}.`);
    return { status: "success", data: newRecordHash };
  } catch (error) {
    console.error("Error modify record:", error);
    return { status: "error", data: error };
  }
};

const fetchRecord = async () => {
  try {
    return { status: "success", data: "recordData" };
  } catch (error) {
    console.error("Error reading record:", error);
    return { status: "error", data: error };
  }
};

const processRecords = (decryptedRecords: string[]): any[] => {
  const today = new Date();

  // Process records to determine current and past medications
  return decryptedRecords
    .map((medication) => {
      const medicationJSON = JSON.parse(medication);
      const { date, medications, time, location } = medicationJSON;

      // Convert date from "dd-mm-yyyy" to "mm/dd/yyyy"
      const [day, month, year] = date.split("-").map(Number);
      const formattedDate = new Date(year, month - 1, day);

      // Map medications to include current status
      const mappedMedications = medications.map((med: any) => {
        const medicationDate = new Date(formattedDate);
        medicationDate.setDate(medicationDate.getDate() + med.duration);

        return {
          ...med,
          current: today <= medicationDate,
        };
      });

      // Determine if any medication is current
      const isCurrent = mappedMedications.some((med: any) => med.current);

      // Sort medications so that current medications come first
      const sortedMedications = mappedMedications.sort((a: any, b: any) => {
        if (a.current && !b.current) return -1; // a comes first if current
        if (!a.current && b.current) return 1; // b comes first if current
        return 0; // maintain original order for same status
      });

      return {
        date,
        time,
        location,
        medications: sortedMedications,
        current: isCurrent,
      };
    })
    .sort((a: any, b: any) => {
      if (a.current && !b.current) return -1; // a comes first if current
      if (!a.current && b.current) return 1; // b comes first if current
      return 0; // maintain original order for same status
    });
};

export {
  createProfile,
  fetchProfile,
  decryptData,
  authorizeDoctor,
  revokeDoctor,
  fetchAuthDoctor,
  fetchAuthPatient,
  revokePatient,
  generateHash,
  appendRecord,
  modifyRecord,
  fetchRecord,
  processRecords,
};
