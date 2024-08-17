export const EthContractABI = [
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
