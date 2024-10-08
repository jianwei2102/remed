import axios from "axios";
import dayjs from "dayjs";
import { useState } from "react";
import { format } from "date-fns";
import { FaInfo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useStorageUpload } from "@thirdweb-dev/react";
import { Button, Form, Input, Select, DatePicker, Row, Col, message, Image, Avatar, Tooltip, Spin } from "antd";
import { creatMaschainWallet } from "@/lib/maschain";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptos, moduleAddress } from "@/utils/aptos";

const PatientRegister = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { account, signAndSubmitTransaction } = useWallet();
  const { mutateAsync: upload } = useStorageUpload();
  const [messageApi, contextHolder] = message.useMessage();

  const [nokFile, setNokFile] = useState<File | undefined>();
  const [nokFileUrl, setNokFileUrl] = useState<string | undefined>();
  const [patientFile, setPatientFile] = useState<File | undefined>();
  const [patientFileUrl, setPatientFileUrl] = useState<string | undefined>();
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);

  const uploadToIpfs = async (file: File) => {
    try {
      const uploadUrl = await upload({
        data: [file],
        options: {
          uploadWithoutDirectory: true,
          uploadWithGatewayUrl: true,
        },
      });

      const cid = uploadUrl[0].split("/ipfs/")[1].split("/")[0];
      console.log("IPFS CID:", cid);
      return cid;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const onFinish = async (values: any) => {
    const formattedValues = {
      ...values,
      patient: {
        ...values.patient,
        dateOfBirth: format(new Date(values.patient.dateOfBirth), "dd-MM-yyyy"),
      },
      nextOfKin: {
        ...values.nextOfKin,
        dateOfBirth: format(new Date(values.nextOfKin.dateOfBirth), "dd-MM-yyyy"),
      },
    };
    setTransactionInProgress(true);

    const maschainWalletData = {
      name: formattedValues.patient.name,
      email: formattedValues.patient.email,
      ic: formattedValues.patient.ic,
      phone: formattedValues.patient.phoneNo,
    };

    try {
      messageApi.open({
        type: "loading",
        content: "Uploading image file(s) to IPFS..",
        duration: 0,
      });
      if (patientFile) {
        const patientCid = await uploadToIpfs(patientFile);
        formattedValues.patient.image = patientCid; // Replace image with CID
      }
      if (nokFile) {
        const nokCid = await uploadToIpfs(nokFile);
        formattedValues.nextOfKin.image = nokCid; // Replace image with CID
      }
      messageApi.destroy();
      console.log("Received values of form: ", formattedValues);
    } catch (error) {
      console.error("Error uploading file(s) to IPFS:", error);
    }

    // Remed Contract - Aptos
    if (import.meta.env.VITE_APP_BlockChain === "Aptos") {
      const transaction: InputTransactionData = {
        data: {
          function: `${moduleAddress}::remed::patient_initialize`,
          functionArguments: [],
        },
      };
      try {
        // sign and submit transaction to chain
        const response = await signAndSubmitTransaction(transaction);
        // wait for transaction
        await aptos.waitForTransaction({ transactionHash: response.hash });
        // setAccountHasList(true);
      } catch (error) {
        // setAccountHasList(false);
        console.log("error", error);
      }
    }

    // Maschain Wallet Creation
    try {
      messageApi.open({
        type: "loading",
        content: "Creating Maschain Wallet..",
        duration: 0,
      });
      const response = await creatMaschainWallet(maschainWalletData);
      formattedValues.patient.maschainAddress = response.result.wallet.wallet_address;
      messageApi.destroy();
    } catch (error) {
      console.error("Error creating Maschain Wallet:", error);
    }

    // Add to DB
    try {
      messageApi.open({
        type: "loading",
        content: "Adding information to database in progress..",
        duration: 0,
      });

      let response = await axios.post("http://localhost:4000/users", {
        userInfo: JSON.stringify(formattedValues),
        address: account?.address,
        maschainAddress: formattedValues.patient.maschainAddress,
        role: "patient",
      });

      messageApi.destroy();

      if (response.statusText === "OK") {
        messageApi.open({
          type: "success",
          content: "User profile created successfully",
        });
        setTimeout(() => {
          navigate("/authorization");
        }, 500);
      } else {
        messageApi.open({
          type: "error",
          content: "Error creating user profile",
        });
      }
    } catch (error) {
      console.error("Error adding information to database:", error);
    }
  };

  return (
    <Form form={form} className="mt-4" layout="vertical" onFinish={onFinish}>
      {contextHolder}
      <Row gutter={16} className="rounded-md border">
        {/* User (Patient) Information */}
        <Col span={12} className="border-r !pl-4">
          <Form.Item>
            <div className="text-lg italic font-semibold">User Information</div>
          </Form.Item>
          <Form.Item
            name={["patient", "name"]} // Nested field for patient name
            label="Full Name"
            required
            rules={[{ required: true, message: "Please input the user's full name!" }]}
          >
            <Input placeholder="Samuel Robinson" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["patient", "ic"]} // Nested field for patient name
            label="IC"
            required
            rules={[{ required: true, message: "Please input the user's IC!" }]}
          >
            <Input placeholder="010304-10-2912" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["patient", "email"]} // Nested field for patient name
            label="Email"
            required
            rules={[{ required: true, message: "Please input the user's email!" }]}
          >
            <Input placeholder="test@mail.com" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["patient", "gender"]} // Nested field for patient gender
            label="Gender"
            required
            rules={[{ required: true, message: "Please select the user's gender!" }]}
          >
            <Select placeholder="Select Gender" style={{ width: "95%" }}>
              <Select.Option value="Male">Male</Select.Option>
              <Select.Option value="Female">Female</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name={["patient", "bloodGroup"]} // Nested field for patient blood group
            label="Blood Group"
            required
            rules={[
              {
                required: true,
                message: "Please select the user's blood group!",
              },
            ]}
          >
            <Select placeholder="Select Blood Group" style={{ width: "95%" }}>
              <Select.Option value="A+">A+</Select.Option>
              <Select.Option value="A-">A-</Select.Option>
              <Select.Option value="B+">B+</Select.Option>
              <Select.Option value="B-">B-</Select.Option>
              <Select.Option value="O+">O+</Select.Option>
              <Select.Option value="O-">O-</Select.Option>
              <Select.Option value="AB+">AB+</Select.Option>
              <Select.Option value="AB-">AB-</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name={["patient", "dateOfBirth"]} // Nested field for patient date of birth
            label="Date of Birth"
            required
            rules={[
              {
                required: true,
                message: "Please select the user's date of birth!",
              },
            ]}
          >
            <DatePicker style={{ width: "95%" }} maxDate={dayjs()} />
          </Form.Item>
          <Form.Item
            name={["patient", "phoneNo"]} // Nested field for patient phone number
            label="Phone No."
            required
            rules={[
              {
                required: true,
                message: "Please input the user's phone number!",
              },
            ]}
          >
            <Input placeholder="0121234123" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["patient", "address"]} // Nested field for patient address
            label="Address"
            required
            rules={[{ required: true, message: "Please input the user's address!" }]}
          >
            <Input placeholder="No 1, Jalan Utama, Selangor" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["patient", "image"]} // Nested field for patient image
            label={
              <span className="flex justify-center items-center">
                Profile Image
                <Tooltip title="Image will be uploaded to IPFS">
                  <Avatar size={20} className="bg-blue-300 ml-1" icon={<FaInfo />} />
                </Tooltip>
              </span>
            }
          >
            <Row className="flex justify-center items-center">
              <Col span={18}>
                <Input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) {
                      setPatientFile(e.target.files[0]);
                      setPatientFileUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </Col>
              <Col span={6} className="pl-2">
                {patientFileUrl && <Avatar size={48} icon={<Image src={patientFileUrl} alt="img" />} />}
              </Col>
            </Row>
          </Form.Item>
        </Col>

        {/* Next of Kin Information */}
        <Col span={12} className="!pl-4">
          <Form.Item>
            <div className="text-lg italic font-semibold">Next of Kin Information</div>
          </Form.Item>
          <Form.Item
            name={["nextOfKin", "name"]} // Nested field for next of kin name
            label="Full Name"
            required
            rules={[
              {
                required: true,
                message: "Please input the next of kin's full name!",
              },
            ]}
          >
            <Input placeholder="Fave Robinson" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["nextOfKin", "ic"]} // Nested field for next of kin name
            label="IC"
            required
            rules={[
              {
                required: true,
                message: "Please input the next of kin's IC!",
              },
            ]}
          >
            <Input placeholder="010304-10-2912" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["nextOfKin", "email"]} // Nested field for patient name
            label="Email"
            required
            rules={[{ required: true, message: "Please input the next of kin's email!" }]}
          >
            <Input placeholder="test@mail.com" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["nextOfKin", "gender"]} // Nested field for next of kin gender
            label="Gender"
            required
            rules={[
              {
                required: true,
                message: "Please select the next of kin's gender!",
              },
            ]}
          >
            <Select placeholder="Select Gender" style={{ width: "95%" }}>
              <Select.Option value="Male">Male</Select.Option>
              <Select.Option value="Female">Female</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name={["nextOfKin", "relationship"]} // Nested field for next of kin relationship
            label="Relationship"
            required
            rules={[{ required: true, message: "Please select the relationship!" }]}
          >
            <Select placeholder="Select Relationship" style={{ width: "95%" }}>
              <Select.Option value="Spouse">Spouse</Select.Option>
              <Select.Option value="Parent">Parent</Select.Option>
              <Select.Option value="Sibling">Sibling</Select.Option>
              <Select.Option value="Child">Child</Select.Option>
              <Select.Option value="Friend">Friend</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name={["nextOfKin", "dateOfBirth"]} // Nested field for next of kin date of birth
            label="Date of Birth"
            required
            rules={[
              {
                required: true,
                message: "Please select the next of kin's date of birth!",
              },
            ]}
          >
            <DatePicker style={{ width: "95%" }} maxDate={dayjs()} />
          </Form.Item>
          <Form.Item
            name={["nextOfKin", "phoneNo"]} // Nested field for next of kin phone number
            label="Phone No."
            required
            rules={[
              {
                required: true,
                message: "Please input the next of kin's phone number!",
              },
            ]}
          >
            <Input placeholder="0131234123" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["nextOfKin", "address"]} // Nested field for next of kin address
            label="Address"
            required
            rules={[
              {
                required: true,
                message: "Please input the next of kin's address!",
              },
            ]}
          >
            <Input placeholder="No 1, Jalan Utama, Selangor" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["nextOfKin", "image"]} // Nested field for next of kin image
            label={
              <span className="flex justify-center items-center">
                Profile Image
                <Tooltip title="Image will be uploaded to IPFS">
                  <Avatar size={20} className="bg-blue-300 ml-1" icon={<FaInfo />} />
                </Tooltip>
              </span>
            }
          >
            <Row className="flex justify-center items-center">
              <Col span={18}>
                <Input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) {
                      setNokFile(e.target.files[0]);
                      setNokFileUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </Col>
              <Col span={6} className="pl-2">
                {nokFileUrl && <Avatar size={48} icon={<Image src={nokFileUrl} alt="img" />} />}
              </Col>
            </Row>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Spin spinning={transactionInProgress}>
          <Button type="primary" htmlType="submit" className="px-8 py-4 mt-4 text-lg">
            Create Profile
          </Button>
        </Spin>
      </Form.Item>
    </Form>
  );
};

export default PatientRegister;
