import { useScrollContractContext } from "@/context/scrollContract";
import { Authorization, EMR, useEthContractContext } from "@/context/sepoliaContract";
import { useState } from "react";

const Test = () => {
  const { getDoctorAuthList, connectedAddress } = useEthContractContext();
  const { authorizeDoctor, getPatientAuthList, appendRecord, getEmrList, modifyRecord } = useScrollContractContext();

  const [drAddress, setDrAddress] = useState("");
  const [ptAddress, setPtAddress] = useState("");
  const [authlist, setauthlist] = useState<Authorization[] | undefined>([]);
  const [authlist2, setauthlist2] = useState<Authorization[] | undefined>([]);

  const [recordhash, setrecordhash] = useState("");
  const [recorddetails, setrecorddetails] = useState("");
  const [recordtype, setrecordtype] = useState("");
  const [emrlist, setemrlist] = useState<EMR[] | undefined>([]);

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

  const handleShow = async () => {
    try {
      if (connectedAddress) {
        const data = await getPatientAuthList(connectedAddress);
        console.log(data);
        setauthlist(data);
        console.log("Debug success!");
      } else {
        alert("No connected address detected...");
      }
    } catch (error) {
      console.error("Debug failed: ", error);
    }
  };

  const handleShow2 = async () => {
    try {
      if (connectedAddress) {
        const data = await getDoctorAuthList(drAddress);
        console.log(data);
        setauthlist2(data);
        console.log("Debug success!");
      } else {
        alert("No connected address detected...");
      }
    } catch (error) {
      console.error("Debug failed: ", error);
    }
  };

  const handleAppendEMR = async () => {
    try {
      const confirmed = confirm(
        `Modify EMR for  ${ptAddress}, hash: ${recordhash}, details: ${recorddetails}, type: ${recordtype}???`,
      );
      if (!confirmed) {
        return;
      }

      await modifyRecord(ptAddress, recordhash, recorddetails, recordtype);
      console.log("Debug success!");
    } catch (error) {
      console.error("Debug failed: ", error);
    }
  };

  const handleShow3 = async () => {
    try {
      if (connectedAddress) {
        const data = await getEmrList(ptAddress);
        console.log(data);
        setemrlist(data);
        console.log("Debug success!");
      } else {
        alert("No connected address detected...");
      }
    } catch (error) {
      console.error("Debug failed: ", error);
    }
  };

  return (
    <div>
      <h2 className="w-full font-semibold">Demo contract function </h2>
      <h2 className="w-full">Doctor address to authorized:</h2>
      <input
        className="w-full bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
        type="text"
        placeholder="0xdoctor"
        onChange={(e) => {
          setDrAddress(e.target.value);
        }}
        value={drAddress}
      />

      <button
        className="w-full bg-gray-300 shadow-lg rounded py-2 font-semibold mb-4"
        type="button"
        onClick={handleAuthorizeDoctor}
      >
        Authorize Doctor
      </button>

      <h2 className="w-full">View patient authorized list:</h2>
      <button
        className="w-full bg-gray-300 shadow-lg rounded py-2 font-semibold mb-4"
        type="button"
        onClick={handleShow}
      >
        Get data
      </button>

      {authlist ? (
        <div>
          <h2 className="w-full">Authorized list:</h2>
          {authlist.map((dr) => (
            <p key={dr.address} className="font-semibold mb-1">
              {dr.address}
            </p>
          ))}
        </div>
      ) : null}

      <h2 className="w-full">View doctor authorized list:</h2>
      <button
        className="w-full bg-gray-300 shadow-lg rounded py-2 font-semibold mb-4"
        type="button"
        onClick={handleShow2}
      >
        Get data
      </button>

      {authlist2 ? (
        <div>
          <h2 className="w-full">Authorized list:</h2>
          {authlist2.map((pt) => (
            <p key={pt.address} className="font-semibold mb-1">
              {pt.address}
            </p>
          ))}
        </div>
      ) : null}

      <h2 className="w-full">Modify EMR:</h2>
      <input
        className="w-full bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
        type="text"
        placeholder="0xpatient"
        onChange={(e) => {
          setPtAddress(e.target.value);
        }}
        value={ptAddress}
      />

      <input
        className="w-full bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
        type="text"
        placeholder="Record hash"
        onChange={(e) => {
          setrecordhash(e.target.value);
        }}
        value={recordhash}
      />

      <input
        className="w-full bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
        type="text"
        placeholder="Record details"
        onChange={(e) => {
          setrecorddetails(e.target.value);
        }}
        value={recorddetails}
      />

      <input
        className="w-full bg-gray-100 text-black border border-gray-200 rounded py-2 px-4 mb-4"
        type="text"
        placeholder="Record type"
        onChange={(e) => {
          setrecordtype(e.target.value);
        }}
        value={recordtype}
      />

      <button
        className="w-full bg-gray-300 shadow-lg rounded py-2 font-semibold mb-4"
        type="button"
        onClick={handleAppendEMR}
      >
        Append EMR
      </button>

      <h2 className="w-full">View EMR list:</h2>
      <button
        className="w-full bg-gray-300 shadow-lg rounded py-2 font-semibold mb-4"
        type="button"
        onClick={handleShow3}
      >
        Get data
      </button>

      {emrlist ? (
        <div>
          <h2 className="w-full">EMR list:</h2>
          {emrlist.map((emr) => (
            <p key={emr.recordHash} className="font-semibold mb-1">
              {emr.recordHash} added by {emr.addedBy}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Test;
