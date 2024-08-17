import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useContract, useContractWrite, useAddress, ThirdwebSDK } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";

export interface Authorization {
  address: string;
  date: Date;
}

export interface EMR {
  recordHash: string;
  recordDetails: string;
  recordType: string;
  addedBy: string;
}

interface EthContractContextProps {
  connectedAddress: string | undefined;
  authorizeDoctor: (doctorAddress: string) => Promise<void>;
  revokeDoctor: (doctorAddress: string) => Promise<void>;
  revokePatient: (patientAddress: string) => Promise<void>;
  appendRecord: (
    patientAddress: string,
    recordHash: string,
    recordDetails: string,
    recordType: string,
  ) => Promise<void>;
  modifyRecord: (
    patientAddress: string,
    currentRecordHash: string,
    newRecordHash: string,
    recordDetails: string,
  ) => Promise<void>;
  closePatientAuthList: () => Promise<void>;
  closeEMRList: () => Promise<void>;
  getPatientAuthList: (patientAddress: string) => Promise<Authorization[] | undefined>;
  getDoctorAuthList: (patientAddress: string) => Promise<Authorization[] | undefined>;
  getEmrList: (patientAddress: string) => Promise<EMR[] | undefined>;
}

export const EthContractContext = createContext<EthContractContextProps | undefined>(undefined);

interface EthContractContextProviderProps {
  children: ReactNode;
}

export const EthContractContextProvider: React.FC<EthContractContextProviderProps> = ({ children }) => {
  // Sepolia Contract
  const { contract } = useContract("0x5c184dAF813ec32b77F393065802fd146bfBb121");

  const { mutateAsync: authorizeDoctorAsync } = useContractWrite(contract, "authorizeDoctor");
  const { mutateAsync: revokeDoctorAsync } = useContractWrite(contract, "revokeDoctor");
  const { mutateAsync: revokePatientAsync } = useContractWrite(contract, "revokePatient");
  const { mutateAsync: appendRecordAsync } = useContractWrite(contract, "appendRecord");
  const { mutateAsync: modifyRecordAsync } = useContractWrite(contract, "modifyRecord");
  const { mutateAsync: closePatientAuthListAsync } = useContractWrite(contract, "closePatientAuthList");
  const { mutateAsync: closeEMRListAsync } = useContractWrite(contract, "closeEMRList");

  const connectedAddress = useAddress();

  const authorizeDoctor = async (doctorAddress: string): Promise<void> => {
    try {
      const data = await authorizeDoctorAsync({ args: [doctorAddress] });
      console.log("Contract call success: ", data);
    } catch (error) {
      console.error("Contract call failure: ", error);
    }
  };

  const revokeDoctor = async (doctorAddress: string): Promise<void> => {
    try {
      const data = await revokeDoctorAsync({ args: [doctorAddress] });
      console.log("Contract call success: ", data);
    } catch (error) {
      console.error("Contract call failure: ", error);
    }
  };

  const revokePatient = async (patientAddress: string): Promise<void> => {
    try {
      const data = await revokePatientAsync({ args: [patientAddress] });
      console.log("Contract call success: ", data);
    } catch (error) {
      console.error("Contract call failure: ", error);
    }
  };

  const appendRecord = async (
    patientAddress: string,
    recordHash: string,
    recordDetails: string,
    recordType: string,
  ): Promise<void> => {
    try {
      const data = await appendRecordAsync({ args: [patientAddress, recordHash, recordDetails, recordType] });
      console.log("Contract call success: ", data);
    } catch (error) {
      console.error("Contract call failure: ", error);
    }
  };

  const modifyRecord = async (
    patientAddress: string,
    currentRecordHash: string,
    newRecordHash: string,
    recordDetails: string,
  ): Promise<void> => {
    try {
      const data = await modifyRecordAsync({ args: [patientAddress, currentRecordHash, newRecordHash, recordDetails] });
      console.log("Contract call success: ", data);
    } catch (error) {
      console.error("Contract call failure: ", error);
    }
  };

  const closePatientAuthList = async (): Promise<void> => {
    try {
      const data = await closePatientAuthListAsync({ args: [] });
      console.log("Contract call success: ", data);
    } catch (error) {
      console.error("Contract call failure: ", error);
    }
  };

  const closeEMRList = async (): Promise<void> => {
    try {
      const data = await closeEMRListAsync({ args: [] });
      console.log("Contract call success: ", data);
    } catch (error) {
      console.error("Contract call failure: ", error);
    }
  };

  const getPatientAuthList = async (patientAddress: string): Promise<Authorization[] | undefined> => {
    try {
      if (contract) {
        const data = await contract.call("getPatientAuthList", [patientAddress]);
        console.log("Contract call success: ", data);

        if (Array.isArray(data)) {
          const authList: Authorization[] = data.map((item: [string, BigNumber]) => {
            const address = item[0];
            const dateBigNumber = item[1];

            // Convert BigNumber to number and then to Date
            const date = new Date(dateBigNumber.toNumber() * 1000); // Convert seconds to milliseconds

            return {
              address,
              date,
            };
          });

          return authList;
        } else {
          console.error("Unexpected data format: ", data);
          return [];
        }
      }
    } catch (error) {
      console.error("Contract call failure: ", error);
      return [];
    }
  };

  const getDoctorAuthList = async (patientAddress: string): Promise<Authorization[] | undefined> => {
    try {
      if (contract) {
        const data = await contract.call("getDoctorAuthList", [patientAddress]);
        console.log("Contract call success: ", data);

        if (Array.isArray(data)) {
          const authList: Authorization[] = data.map((item: [string, BigNumber]) => {
            const address = item[0];
            const dateBigNumber = item[1];

            // Convert BigNumber to number and then to Date
            const date = new Date(dateBigNumber.toNumber() * 1000); // Convert seconds to milliseconds

            return {
              address,
              date,
            };
          });

          return authList;
        } else {
          console.error("Unexpected data format: ", data);
          return [];
        }
      }
    } catch (error) {
      console.error("Contract call failure: ", error);
      return [];
    }
  };

  const getEmrList = async (patientAddress: string): Promise<EMR[] | undefined> => {
    try {
      if (contract) {
        const data = await contract.call("getEmrList", [patientAddress]);
        console.log("Contract call success: ", data);

        if (Array.isArray(data)) {
          const emrList: EMR[] = data.map((item: [string, string, string, string]) => {
            const recordHash = item[0];
            const recordDetails = item[1];
            const recordType = item[2];
            const addedBy = item[3];

            return {
              recordHash,
              recordDetails,
              recordType,
              addedBy,
            };
          });
          return emrList;
        } else {
          console.error("Unexpected data format: ", data);
          return [];
        }
      }
    } catch (error) {
      console.error("Contract call failure: ", error);
      return [];
    }
  };

  return (
    <EthContractContext.Provider
      value={{
        connectedAddress,
        authorizeDoctor,
        revokeDoctor,
        revokePatient,
        appendRecord,
        modifyRecord,
        closePatientAuthList,
        closeEMRList,
        getPatientAuthList,
        getDoctorAuthList,
        getEmrList,
      }}
    >
      {children}
    </EthContractContext.Provider>
  );
};

export const useEthContractContext = (): EthContractContextProps => {
  const context = useContext(EthContractContext);
  if (context === undefined) {
    throw new Error("useEthContractContext must be used within an EthContractContextProvider");
  }
  return context;
};
