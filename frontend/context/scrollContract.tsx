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

interface ScrollContractContextProps {
  //   connectedAddress: string | undefined;
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

export const ScrollContractContext = createContext<ScrollContractContextProps | undefined>(undefined);

interface ScrollContractContextProviderProps {
  children: ReactNode;
}

const contractABI = [
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "string", name: "message", type: "string" }],
    name: "Debug",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "address", name: "addr", type: "address" }],
    name: "DebugAddress",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "uinteger", type: "uint256" }],
    name: "DebugUint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "enum Remed.ErrorCode", name: "code", type: "uint8" }],
    name: "Error",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "patient", type: "address" },
      { internalType: "string", name: "recordHash", type: "string" },
      { internalType: "string", name: "recordDetails", type: "string" },
      { internalType: "string", name: "recordType", type: "string" },
    ],
    name: "appendRecord",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "doctorAddress", type: "address" }],
    name: "authorizeDoctor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], name: "closeEMRList", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "closePatientAuthList", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [{ internalType: "address", name: "doctor", type: "address" }],
    name: "getDoctorAuthList",
    outputs: [
      {
        components: [
          { internalType: "address", name: "addr", type: "address" },
          { internalType: "uint256", name: "date", type: "uint256" },
        ],
        internalType: "struct Remed.Authorization[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "patient", type: "address" }],
    name: "getEmrList",
    outputs: [
      {
        components: [
          { internalType: "string", name: "recordHash", type: "string" },
          { internalType: "string", name: "recordDetails", type: "string" },
          { internalType: "string", name: "recordType", type: "string" },
          { internalType: "address", name: "addedBy", type: "address" },
        ],
        internalType: "struct Remed.EMR[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "patient", type: "address" }],
    name: "getPatientAuthList",
    outputs: [
      {
        components: [
          { internalType: "address", name: "addr", type: "address" },
          { internalType: "uint256", name: "date", type: "uint256" },
        ],
        internalType: "struct Remed.Authorization[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "patient", type: "address" },
      { internalType: "string", name: "currentRecordHash", type: "string" },
      { internalType: "string", name: "newRecordHash", type: "string" },
      { internalType: "string", name: "recordDetails", type: "string" },
    ],
    name: "modifyRecord",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "doctorAddress", type: "address" }],
    name: "revokeDoctor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "patientAddress", type: "address" }],
    name: "revokePatient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const ScrollContractContextProvider: React.FC<ScrollContractContextProviderProps> = ({ children }) => {
  const authorizeDoctor = async (doctorAddress: string): Promise<void> => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask is not installed");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract("0xFd4a2EAbccD33eD20519162944D988C1202dE089", contractABI, provider);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.authorizeDoctor(doctorAddress);

      console.log("Contract call success: ", tx.hash);
    } catch (error) {
      console.error("Contract call failure: ", error);
    }
  };

  const revokeDoctor = async (doctorAddress: string): Promise<void> => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask is not installed");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract("0xFd4a2EAbccD33eD20519162944D988C1202dE089", contractABI, provider);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = contractWithSigner.revokeDoctor(doctorAddress);
      console.log("Contract call success: ", tx.hash);
    } catch (error) {
      console.error("Contract call failure: ", error);
    }
  };

  const revokePatient = async (patientAddress: string): Promise<void> => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask is not installed");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract("0xFd4a2EAbccD33eD20519162944D988C1202dE089", contractABI, provider);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = contractWithSigner.revokePatient(patientAddress);
      console.log("Contract call success: ", tx.hash);
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
      if (!window.ethereum) {
        console.error("MetaMask is not installed");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract("0xFd4a2EAbccD33eD20519162944D988C1202dE089", contractABI, provider);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = contractWithSigner.appendRecord(patientAddress, recordHash, recordDetails, recordType);
      console.log("Contract call success: ", tx.hash);
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
      if (!window.ethereum) {
        console.error("MetaMask is not installed");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract("0xFd4a2EAbccD33eD20519162944D988C1202dE089", contractABI, provider);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = contractWithSigner.modifyRecord(patientAddress, currentRecordHash, newRecordHash, recordDetails);
      console.log("Contract call success: ", tx.hash);
    } catch (error) {
      console.error("Contract call failure: ", error);
    }
  };

  const closePatientAuthList = async (): Promise<void> => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask is not installed");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract("0xFd4a2EAbccD33eD20519162944D988C1202dE089", contractABI, provider);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = contractWithSigner.closePatientAuthList();
      console.log("Contract call success: ", tx.hash);
    } catch (error) {
      console.error("Contract call failure: ", error);
    }
  };

  const closeEMRList = async (): Promise<void> => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask is not installed");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract("0xFd4a2EAbccD33eD20519162944D988C1202dE089", contractABI, provider);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = contractWithSigner.closeEMRList();
      console.log("Contract call success: ", tx.hash);
    } catch (error) {
      console.error("Contract call failure: ", error);
    }
  };

  const getPatientAuthList = async (patientAddress: string): Promise<Authorization[] | undefined> => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask is not installed");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract("0xFd4a2EAbccD33eD20519162944D988C1202dE089", contractABI, provider);

      const data = await contract.getPatientAuthList(patientAddress);
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
    } catch (error) {
      console.error("Contract call failure: ", error);
      return [];
    }
  };

  const getDoctorAuthList = async (patientAddress: string): Promise<Authorization[] | undefined> => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask is not installed");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract("0xFd4a2EAbccD33eD20519162944D988C1202dE089", contractABI, provider);

      const data = await contract.getDoctorAuthList(patientAddress);
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
    } catch (error) {
      console.error("Contract call failure: ", error);
      return [];
    }
  };

  const getEmrList = async (patientAddress: string): Promise<EMR[] | undefined> => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask is not installed");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract("0xFd4a2EAbccD33eD20519162944D988C1202dE089", contractABI, provider);

      const data = await contract.getEmrList(patientAddress);
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
    } catch (error) {
      console.error("Contract call failure: ", error);
      return [];
    }
  };

  return (
    <ScrollContractContext.Provider
      value={{
        // connectedAddress,
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
    </ScrollContractContext.Provider>
  );
};

export const useScrollContractContext = (): ScrollContractContextProps => {
  const context = useContext(ScrollContractContext);
  if (context === undefined) {
    throw new Error("useScrollContractContext must be used within an ScrollContractContextProvider");
  }
  return context;
};
