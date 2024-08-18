import { useScrollContractContext } from "@/context/scrollContract";
import { Authorization, EMR, useEthContractContext } from "@/context/sepoliaContract";
import { useState } from "react";

const Test = () => {
  // const {
  //   getDoctorAuthList,
  //   connectedAddress,
  //   getPatientAuthList,
  //   authorizeDoctor,
  //   appendRecord,
  //   getEmrList,
  //   modifyRecord,
  //   revokeDoctor,
  //   revokePatient,
  // } = useEthContractContext();

  const {
    getDoctorAuthList,
    getPatientAuthList,
    authorizeDoctor,
    appendRecord,
    getEmrList,
    modifyRecord,
    revokeDoctor,
    revokePatient,
  } = useScrollContractContext();

  const [drAddress, setDrAddress] = useState("");
  const [ptAddress, setPtAddress] = useState("");
  const [authlist, setauthlist] = useState<Authorization[] | undefined>(undefined);
  const [authlist2, setauthlist2] = useState<Authorization[] | undefined>(undefined);

  const [recordhash, setrecordhash] = useState("");
  const [newrecordhash, setnewrecordhash] = useState("");
  const [recorddetails, setrecorddetails] = useState("");
  const [recordtype, setrecordtype] = useState("");
  const [emrlist, setemrlist] = useState<EMR[] | undefined>(undefined);

  const handleAuthorizeDoctor = async () => {
    try {
      const confirmed = confirm(`Authorize ${drAddress}???`);
      if (!confirmed) {
        return;
      }

      await authorizeDoctor(drAddress);
      console.log("Debug success!");
    } catch (error) {
      console.error("Debug failed: ", error);
    }
  };

  const handleRevokeDoctor = async () => {
    try {
      const confirmed = confirm(`Revoke ${drAddress}???`);
      if (!confirmed) {
        return;
      }

      await revokeDoctor(drAddress);
      console.log("Debug success!");
    } catch (error) {
      console.error("Debug failed: ", error);
    }
  };

  const handleShow = async () => {
    try {
      const data = await getPatientAuthList(ptAddress);
      console.log(data);
      setauthlist(data);
      console.log("Debug success!");
    } catch (error) {
      console.error("Debug failed: ", error);
    }
  };

  const handleShow2 = async () => {
    try {
      const data = await getDoctorAuthList(drAddress);
      console.log(data);
      setauthlist2(data);
      console.log("Debug success!");
    } catch (error) {
      console.error("Debug failed: ", error);
    }
  };

  const handleAppendEMR = async () => {
    try {
      const confirmed = confirm(
        `Append new EMR for  ${ptAddress}, hash: ${recordhash}, details: ${recorddetails}, type: ${recordtype}???`,
      );
      if (!confirmed) {
        return;
      }

      await appendRecord(ptAddress, recordhash, recorddetails, recordtype);
      console.log("Debug success!");
    } catch (error) {
      console.error("Debug failed: ", error);
    }
  };

  const handleModifyEMR = async () => {
    try {
      const confirmed = confirm(
        `Modify EMR for  ${ptAddress}, prev hash: ${recordhash}, next hash: ${newrecordhash}, details: ${recorddetails}???`,
      );
      if (!confirmed) {
        return;
      }

      await modifyRecord(ptAddress, recordhash, newrecordhash, recorddetails);
      console.log("Debug success!");
    } catch (error) {
      console.error("Debug failed: ", error);
    }
  };

  const handleShow3 = async () => {
    try {
      const data = await getEmrList(ptAddress);
      console.log(data);
      setemrlist(data);
      console.log("Debug success!");
    } catch (error) {
      console.error("Debug failed: ", error);
    }
  };

  return (
    <div>
      <h2 className="w-full font-semibold text-2xl">Demo contract function </h2>

      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>

      <h2 className="w-full text-xl mb-2">Doctor address to authorized:</h2>
      <input
        className="w-1/2 bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
        type="text"
        placeholder="0xdoctor"
        onChange={(e) => {
          setDrAddress(e.target.value);
        }}
        value={drAddress}
      />

      <button
        className="bg-gray-300 shadow-lg rounded px-4 py-2 font-semibold ml-4 mb-4 hover:bg-gray-500 hover:text-white"
        type="button"
        onClick={handleAuthorizeDoctor}
      >
        Authorize Doctor
      </button>

      <h2 className="w-full text-xl mb-2">Doctor address to revoked:</h2>
      <input
        className="w-1/2 bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
        type="text"
        placeholder="0xdoctor"
        onChange={(e) => {
          setDrAddress(e.target.value);
        }}
        value={drAddress}
      />

      <button
        className="bg-red-500 text-white shadow-lg rounded px-4 py-2 font-semibold ml-4 mb-4 hover:bg-red-800 hover:text-white"
        type="button"
        onClick={handleRevokeDoctor}
      >
        Revoke Doctor
      </button>

      <h2 className="w-full text-xl mb-2">View patient authorized list:</h2>
      <input
        className="w-1/2 bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
        type="text"
        placeholder="0xpatient"
        onChange={(e) => {
          setPtAddress(e.target.value);
        }}
        value={ptAddress}
      />
      <button
        className="bg-gray-300 shadow-lg rounded px-4 py-2 font-semibold ml-4 mb-4 hover:bg-gray-500 hover:text-white"
        type="button"
        onClick={handleShow}
      >
        Get data
      </button>

      {authlist ? (
        <div className="mb-4">
          <h2 className="w-full text-lg">Authorized list:</h2>
          {authlist.map((dr) => (
            <p key={dr.address} className="font-semibold mb-1">
              {`Dr. ${dr.address}`}
            </p>
          ))}
        </div>
      ) : null}

      <h2 className="w-full text-xl mb-2">View doctor authorized list:</h2>
      <input
        className="w-1/2 bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
        type="text"
        placeholder="0xdoctor"
        onChange={(e) => {
          setDrAddress(e.target.value);
        }}
        value={drAddress}
      />
      <button
        className="bg-gray-300 shadow-lg rounded px-4 py-2 font-semibold ml-4 mb-4 hover:bg-gray-500 hover:text-white"
        type="button"
        onClick={handleShow2}
      >
        Get data
      </button>

      {authlist2 ? (
        <div className="mb-4">
          <h2 className="w-full text-lg">Authorized list:</h2>
          {authlist2.map((pt) => (
            <p key={pt.address} className="font-semibold mb-1">
              {`Patient ${pt.address}`}
            </p>
          ))}
        </div>
      ) : null}

      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>

      <h2 className="w-full text-xl mb-2">Add New EMR:</h2>
      <div className="w-full">
        <input
          className="w-1/2 bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
          type="text"
          placeholder="0xpatient"
          onChange={(e) => {
            setPtAddress(e.target.value);
          }}
          value={ptAddress}
        />
      </div>

      <div className="w-full">
        <input
          className="w-1/2 bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
          type="text"
          placeholder="Record hash"
          onChange={(e) => {
            setrecordhash(e.target.value);
          }}
          value={recordhash}
        />
      </div>

      <div className="w-full">
        <input
          className="w-1/2 bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
          type="text"
          placeholder="Record details"
          onChange={(e) => {
            setrecorddetails(e.target.value);
          }}
          value={recorddetails}
        />
      </div>

      <div className="w-full">
        <input
          className="w-1/2 bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
          type="text"
          placeholder="Record type"
          onChange={(e) => {
            setrecordtype(e.target.value);
          }}
          value={recordtype}
        />
      </div>

      <div className="w-full">
        <button
          className="bg-gray-300 shadow-lg rounded px-4 py-2 font-semibold mb-4 hover:bg-gray-500 hover:text-white"
          type="button"
          onClick={handleAppendEMR}
        >
          Append EMR
        </button>
      </div>

      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>

      <h2 className="w-full text-xl mb-2">Modify EMR:</h2>
      <div className="w-full">
        <input
          className="w-1/2 bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
          type="text"
          placeholder="0xpatient"
          onChange={(e) => {
            setPtAddress(e.target.value);
          }}
          value={ptAddress}
        />
      </div>

      <div className="w-full">
        <input
          className="w-1/2 bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
          type="text"
          placeholder="Current record hash"
          onChange={(e) => {
            setrecordhash(e.target.value);
          }}
          value={recordhash}
        />
      </div>

      <div className="w-full">
        <input
          className="w-1/2 bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
          type="text"
          placeholder="New record hash"
          onChange={(e) => {
            setnewrecordhash(e.target.value);
          }}
          value={newrecordhash}
        />
      </div>

      <div className="w-full">
        <input
          className="w-1/2 bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
          type="text"
          placeholder="Record details"
          onChange={(e) => {
            setrecorddetails(e.target.value);
          }}
          value={recorddetails}
        />
      </div>

      <div className="w-full">
        <button
          className="bg-gray-300 shadow-lg rounded px-4 py-2 font-semibold mb-4 hover:bg-gray-500 hover:text-white"
          type="button"
          onClick={handleModifyEMR}
        >
          Modify EMR
        </button>
      </div>

      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>

      <h2 className="w-full text-xl mb-2">View EMR list:</h2>
      <input
        className="w-1/2 bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
        type="text"
        placeholder="0xpatient"
        onChange={(e) => {
          setPtAddress(e.target.value);
        }}
        value={ptAddress}
      />
      <button
        className="bg-gray-300 shadow-lg rounded px-4 py-2 font-semibold ml-4 mb-4 hover:bg-gray-500 hover:text-white"
        type="button"
        onClick={handleShow3}
      >
        Get data
      </button>

      {emrlist ? (
        <div className="mb-4">
          <h2 className="w-full text-lg">EMR list:</h2>
          {emrlist.map((emr) => (
            <p key={emr.recordHash} className="font-semibold mb-1">
              EMR {emr.recordHash} added by Dr. {emr.addedBy}
            </p>
          ))}
        </div>
      ) : null}

      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
    </div>
  );
};

export default Test;
