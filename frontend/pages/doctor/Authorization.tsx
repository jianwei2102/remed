import axios from "axios";
import dayjs from "dayjs";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { PatientAuthorized, QRReader, PatientRequested } from "../../components";
import { Button, Divider, Flex, Input, message, Modal, Segmented, Space } from "antd";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEthContractContext } from "@/context/sepoliaContract";
import { fetchProfile } from "@/utils/util";
import { aptos, moduleAddress } from "@/utils/aptos";

interface AuthorizedPatient {
  address: string;
  date: string;
}

interface RequestedPatient {
  id: string;
  address: string;
  date: string;
}

const Authorization = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [open, setOpen] = useState(false);
  const [patientAddress, setPatientAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [requested, setRequested] = useState<RequestedPatient[]>([]);
  const [authorized, setAuthorized] = useState<AuthorizedPatient[]>([]);
  const [segmentedValue, setSegmentedValue] = useState<string>("View All");

  const { account } = useWallet();
  const { connectedAddress } = useEthContractContext();
  let blockchain = import.meta.env.VITE_APP_BlockChain;
  const [wallet, setWallet] = useState("");

  const getAuthPatient = useCallback(async () => {
    // if (connection && wallet) {
    //   let response = await fetchAuthPatient(connection, wallet);
    //   if (response.status === "success") {
    //     setAuthorized(
    //       (
    //         response.data as { authorized: AuthorizedPatient[] }
    //       )?.authorized.reverse()
    //     );
    //   }
    // }
    try {
      const response = await axios.get("http://localhost:4000/doctorRequests");
      const requests = response.data
        .filter((request: any) => request.doctorAddress === wallet)
        .map((request: any) => ({
          id: request._id,
          address: request.patientAddress,
          date: request.requestDate,
        }));
      setRequested(requests);
      console.log("Request fetched:", response.data);
    } catch (error) {
      console.error("Error fetching request:", error);
    }

    if (blockchain === "Aptos") {
      const authListResource = await aptos.getAccountResource({
        accountAddress: wallet,
        resourceType: `${moduleAddress}::remed::AuthList`,
      });
      console.log("authListResource", authListResource);
      setAuthorized((authListResource as { authorized: AuthorizedPatient[] })?.authorized.reverse());
    }
  }, []);

  const checkAuthority = useCallback(async () => {
    if (blockchain === "Ethereum") {
      setWallet(connectedAddress ? connectedAddress : "");
    } else if (blockchain === "Aptos") {
      setWallet(account?.address ? account?.address : "");
    } else {
      navigate("/");
    }

    let response = await fetchProfile(wallet);
    console.log(response);

    if (response.status === "success") {
      if (response.data === null) {
        navigate("/");
      }

      if (response.data.role === "patient") {
        navigate("/");
      } else if (response.data.role === "doctor") {
        getAuthPatient();
      } else if (response.data.role === "researcher") {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate, getAuthPatient]);

  const checkPatientRole = async (patientAddress: string) => {
    const isAuthorized = authorized.some((patient) => patient.address === patientAddress);
    const isRequested = requested.some((patient) => patient.address === patientAddress);

    if (isAuthorized || isRequested) {
      return false; // Already authorized, so return false
    }

    // Check if the address belongs to a registered patient
    try {
      let response = await fetchProfile(patientAddress);
      console.log(response);

      if (response.status === "success") {
        if (response.data === null) {
          return false;
        }

        if (response.data.role === "patient") {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
    return true;
  };

  const authorizePatient = async (patientAddress: string) => {
    messageApi.open({
      type: "loading",
      content: "Transaction in progress..",
      duration: 0,
    });

    let validPatientAddress = await checkPatientRole(patientAddress);
    if (!validPatientAddress) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "Invalid patient address",
      });
      setConfirmLoading(false);
      return;
    }

    let response = await axios.post("http://localhost:4000/doctorRequests", {
      patientAddress: patientAddress,
      doctorAddress: wallet,
      requestDate: format(dayjs().toDate(), "MMMM d, yyyy"),
    });

    messageApi.destroy();
    if (response.status === 200) {
      const newRequested: RequestedPatient = {
        id: response.data._id, // Assuming _id is returned from the backend
        address: response.data.patientAddress,
        date: response.data.requestDate,
      };

      setRequested((prev) => [...prev, newRequested]);
      messageApi.open({
        type: "success",
        content: "Patient request authorized successfully",
      });
    } else {
      messageApi.open({
        type: "error",
        content: "Error authorizing patient request",
      });
    }
  };

  const handleScanSuccess = (result: string) => {
    setPatientAddress(result);
    messageApi.open({
      type: "success",
      content: "QR Code Scanned Successfully",
    });
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    await authorizePatient(patientAddress);
    setPatientAddress("");
    setConfirmLoading(false);
    setOpen(false);
  };

  const revokePatientCallback = (patientAddress: string) => {
    setAuthorized((prev) => prev.filter((item) => item.address !== patientAddress));
    messageApi.open({
      type: "success",
      content: "Patient revoked successfully",
    });
  };

  const revokeRequestCallback = async (patientId: string) => {
    try {
      await axios.delete(`http://localhost:4000/doctorRequests/${patientId}`);
      setRequested((prev) => prev.filter((item) => item.id !== patientId));
      messageApi.open({
        type: "success",
        content: "Patient request remove successfully",
      });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Error remove patient request",
      });
    }
  };

  useEffect(() => {
    checkAuthority();
  }, [checkAuthority]);

  const displayData = () => {
    if (segmentedValue === "View All") {
      return (
        <>
          {filteredAuthorized.length > 0 && (
            <>
              <div className="text-lg font-semibold">Authorized Patients</div>
              {filteredAuthorized.map((item, index) => (
                <PatientAuthorized
                  key={index}
                  patientDetails={item as unknown as { address: string; date: string }}
                  revokePatientCallback={revokePatientCallback}
                />
              ))}
            </>
          )}
          {filteredRequested.length > 0 && (
            <>
              <div className="text-lg font-semibold">Pending Requests</div>
              {filteredRequested.map((item) => (
                <PatientRequested key={item.id} patientDetails={item} revokePatientCallback={revokeRequestCallback} />
              ))}
            </>
          )}
          {filteredAuthorized.length === 0 && filteredRequested.length === 0 && (
            <div className="text-center py-4 text-lg text-gray-500">No patients</div>
          )}
        </>
      );
    }

    if (segmentedValue === "Authorized") {
      return filteredAuthorized.length > 0 ? (
        filteredAuthorized.map((item, index) => (
          <PatientAuthorized
            key={index}
            patientDetails={item as unknown as { address: string; date: string }}
            revokePatientCallback={revokePatientCallback}
          />
        ))
      ) : (
        <div className="text-center py-4 text-lg text-gray-500">No authorized patients</div>
      );
    }

    if (segmentedValue === "Pending") {
      return filteredRequested.length > 0 ? (
        filteredRequested.map((item) => (
          <PatientRequested key={item.id} patientDetails={item} revokePatientCallback={revokeRequestCallback} />
        ))
      ) : (
        <div className="text-center py-4 text-lg text-gray-500">No pending requests</div>
      );
    }

    return null;
  };

  const filteredAuthorized = authorized.filter((patient) =>
    patient.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRequested = requested.filter((patient) =>
    patient.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      {contextHolder}
      <Space className="flex justify-between">
        <Flex vertical>
          <span className="font-semibold text-xl">Authorized Patients</span>
          <span className="text-lg">Ensure your patients are authorized to access and append their records.</span>
        </Flex>

        <Button type="primary" size="large" onClick={() => setOpen(true)}>
          + Request New Patient
        </Button>

        <Modal
          title="Enter Patient's Wallet Address"
          open={open}
          onOk={handleOk}
          confirmLoading={confirmLoading}
          onCancel={() => setOpen(false)}
        >
          <Input placeholder="0x...123" value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)} />
          <div className="text-sm text-gray-500 pt-2">Note: Ensure the address belongs to a registered patient.</div>
          <Divider />
          <QRReader onScanSuccess={handleScanSuccess} /> {/* Pass the callback prop */}
        </Modal>
      </Space>

      <Divider />

      <div className="text-lg font-semibold">
        All Patients (
        {segmentedValue === "View All"
          ? authorized.length + requested.length
          : segmentedValue === "Authorized"
            ? authorized.length
            : requested.length}
        )
      </div>

      <Space className="flex justify-between items-center mb-4" size="middle">
        <Segmented options={["View All", "Authorized", "Pending"]} onChange={(value) => setSegmentedValue(value)} />
        <Flex gap="small">
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button icon={<FilterOutlined />}>Filter</Button>
        </Flex>
      </Space>

      {displayData()}
    </div>
  );
};

export default Authorization;
