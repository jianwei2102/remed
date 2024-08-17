import axios from "axios";
import { format } from "date-fns/format";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { DoctorAuthorized, QRReader, DoctorRequested } from "../../components";
import { authorizeDoctor, fetchAuthDoctor, fetchProfile } from "../../utils/util.ts";
import { Button, Divider, Flex, Input, Space, Segmented, Modal, message } from "antd";
import { useEthContractContext } from "@/context/sepoliaContract.tsx";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptos, moduleAddress } from "@/utils/aptos.ts";

interface AuthorizedDoctor {
  address: string;
  date: string;
}

interface RequestedDoctor {
  id: string;
  address: string;
  date: string;
}

const Authorization = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [open, setOpen] = useState(false);
  const [doctorAddress, setDoctorAddress] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [requested, setRequested] = useState<RequestedDoctor[]>([]);
  const [authorized, setAuthorized] = useState<AuthorizedDoctor[]>([]);
  const [segmentedValue, setSegmentedValue] = useState<string>("View All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { account, signAndSubmitTransaction } = useWallet();
  const { connectedAddress } = useEthContractContext();
  let blockchain = import.meta.env.VITE_APP_BlockChain;
  const [wallet, setWallet] = useState("");

  const getAuthDoctor = useCallback(async () => {
    // if (connection && wallet) {
    //   let response = await fetchAuthDoctor(connection, wallet);
    //   if (response.status === "success") {
    //     setAuthorized(
    //       (
    //         response.data as { authorized: AuthorizedDoctor[] }
    //       )?.authorized.reverse()
    //     );
    //   }
    // }

    try {
      const response = await axios.get("http://localhost:4000/doctorRequests");
      const requests = response.data
        .filter((request: any) => request.patientAddress === wallet)
        .map((request: any) => ({
          id: request._id,
          address: request.doctorAddress,
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
      setAuthorized((authListResource as { authorized: AuthorizedDoctor[] })?.authorized.reverse());
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
        getAuthDoctor();
      } else if (response.data.role === "doctor") {
        navigate("/");
      } else if (response.data.role === "researcher") {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate, getAuthDoctor]);

  useEffect(() => {
    checkAuthority();
  }, [checkAuthority]);

  const checkDoctorRole = async (doctorAddress: string) => {
    const isAuthorized = authorized.some((doctor) => doctor.address === doctorAddress);
    if (isAuthorized) {
      return false; // Already authorized, so return false
    }

    // Check if the address belongs to a registered healthcare provider
    try {
      let response = await fetchProfile(doctorAddress);
      console.log(response);

      if (response.status === "success") {
        if (response.data === null) {
          return false;
        }

        if (response.data.role === "doctor") {
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
  };

  const authorizeDoc = async (doctorAddress: string) => {
    messageApi.open({
      type: "loading",
      content: "Transaction in progress..",
      duration: 0,
    });

    let validDoctorAddress = await checkDoctorRole(doctorAddress);
    if (!validDoctorAddress) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "Invalid doctor address",
      });
      setConfirmLoading(false);
      return;
    }

    // Remed Contract - Aptos
    if (import.meta.env.VITE_APP_BlockChain === "Aptos") {
      const transaction: InputTransactionData = {
        data: {
          function: `${moduleAddress}::remed::authorize_doctor`,
          functionArguments: [doctorAddress, format(new Date(), "MMMM d, yyyy")],
        },
      };
      try {
        // sign and submit transaction to chain
        const response = await signAndSubmitTransaction(transaction);
        // wait for transaction
        await aptos.waitForTransaction({ transactionHash: response.hash });

        messageApi.destroy();
        // if (response.status === "success") {
        messageApi.open({
          type: "success",
          content: "Doctor authorized successfully",
        });
        const newAuthorized: AuthorizedDoctor = {
          address: doctorAddress,
          date: format(new Date(), "MMMM d, yyyy"),
        };
        setAuthorized((prev) => [...prev, newAuthorized]);
        return true;
        // } else {
        //   messageApi.open({
        //     type: "error",
        //     content: "Error authorizing doctor",
        //   });
        //   return false;
        // }
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const handleScanSuccess = (result: string) => {
    setDoctorAddress(result);
    messageApi.open({
      type: "success",
      content: "QR Code Scanned Successfully",
    });
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    await authorizeDoc(doctorAddress);
    setDoctorAddress("");
    setConfirmLoading(false);
    setOpen(false);
  };

  const revokeDoctorCallback = (doctorAddress: string) => {
    setAuthorized((prev) => prev.filter((item) => item.address !== doctorAddress));
    messageApi.open({
      type: "success",
      content: "Doctor revoked successfully",
    });
  };

  const revokeRequestCallback = async (doctorId: string) => {
    try {
      await axios.delete(`http://localhost:4000/doctorRequests/${doctorId}`);
      setRequested((prev) => prev.filter((item) => item.id !== doctorId));
      messageApi.open({
        type: "success",
        content: "Doctor request revoked successfully",
      });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Error revoking doctor request",
      });
    }
  };

  const authorizeRequestCallback = async (doctorId: string, doctorAddress: string) => {
    try {
      const response = await authorizeDoc(doctorAddress);
      if (response) {
        await revokeRequestCallback(doctorId);
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Error authorize doctor request",
      });
    }
  };

  const filteredAuthorized = authorized.filter((item) =>
    item.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRequested = requested.filter((item) => item.address.toLowerCase().includes(searchQuery.toLowerCase()));

  const displayData = () => {
    if (segmentedValue === "View All") {
      return (
        <>
          {filteredAuthorized.length > 0 && (
            <>
              <div className="text-lg font-semibold">Authorized Doctors</div>
              {filteredAuthorized.map((item, index) => (
                <DoctorAuthorized
                  key={index}
                  doctorDetails={item as unknown as { address: string; date: string }}
                  revokeDoctorCallback={revokeDoctorCallback}
                />
              ))}
            </>
          )}
          {filteredRequested.length > 0 && (
            <>
              <div className="text-lg font-semibold">Pending Requests</div>
              {filteredRequested.map((item) => (
                <DoctorRequested
                  key={item.id}
                  doctorDetails={item}
                  revokeRequestCallback={revokeRequestCallback}
                  authorizeRequestCallback={authorizeRequestCallback}
                />
              ))}
            </>
          )}
          {filteredAuthorized.length === 0 && filteredRequested.length === 0 && (
            <div className="text-center py-4 text-lg text-gray-500">No doctors found</div>
          )}
        </>
      );
    }

    if (segmentedValue === "Authorized") {
      return filteredAuthorized.length > 0 ? (
        filteredAuthorized.map((item, index) => (
          <DoctorAuthorized
            key={index}
            doctorDetails={item as unknown as { address: string; date: string }}
            revokeDoctorCallback={revokeDoctorCallback}
          />
        ))
      ) : (
        <div className="text-center py-4 text-lg text-gray-500">No authorized doctors</div>
      );
    }

    if (segmentedValue === "Pending") {
      return filteredRequested.length > 0 ? (
        filteredRequested.map((item) => (
          <DoctorRequested
            key={item.id}
            doctorDetails={item}
            revokeRequestCallback={revokeRequestCallback}
            authorizeRequestCallback={authorizeRequestCallback}
          />
        ))
      ) : (
        <div className="text-center py-4 text-lg text-gray-500">No pending requests</div>
      );
    }

    return null;
  };

  return (
    <div>
      {contextHolder}
      <Space className="flex justify-between">
        <Flex vertical>
          <span className="font-semibold text-xl">Authorized Doctors</span>
          <span className="text-lg">Ensure your medical records are managed by verified healthcare providers.</span>
        </Flex>

        <Button type="primary" size="large" onClick={() => setOpen(true)}>
          + Add New Doctor
        </Button>

        <Modal
          title="Enter Doctor's Wallet Address"
          open={open}
          onOk={handleOk}
          confirmLoading={confirmLoading}
          onCancel={() => setOpen(false)}
        >
          <Input placeholder="0x...123" value={doctorAddress} onChange={(e) => setDoctorAddress(e.target.value)} />
          <div className="text-sm text-gray-500 pt-2">
            Note: Ensure the address belongs to a registered healthcare provider.
          </div>
          <Divider />
          <QRReader onScanSuccess={handleScanSuccess} /> {/* Pass the callback prop */}
        </Modal>
      </Space>

      <Divider />

      <div className="text-lg font-semibold">
        All Doctors (
        {segmentedValue === "View All"
          ? authorized.length + requested.length
          : segmentedValue === "Authorized"
            ? authorized.length
            : requested.length}
        )
      </div>

      <Space className="flex justify-between items-center mb-4" size="middle">
        <Segmented
          options={["View All", "Authorized", "Pending"]}
          value={segmentedValue}
          onChange={setSegmentedValue}
        />

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
