import axios from "axios";
import { useState } from "react";
import { FaInfo } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useStorageUpload } from "@thirdweb-dev/react";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";

import { Form, Row, Col, Input, Button, Select, message, Tooltip, Avatar, Image, Spin } from "antd";
import { aptos, moduleAddress } from "../../utils/aptos";

const { Option } = Select;

const DoctorRegister = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  // const { connection } = useConnection();
  // const wallet = useAnchorWallet() as Wallet;
  const { mutateAsync: upload } = useStorageUpload();
  const { account, signAndSubmitTransaction } = useWallet();
  const [messageApi, contextHolder] = message.useMessage();

  const [file, setFile] = useState<File | undefined>();
  const [fileUrl, setFileUrl] = useState<string | undefined>();
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
    // Combine the title and full name
    const { fullName, ...rest } = values;
    const combinedFullName = `${fullName.title} ${fullName.name}`;
    // Update the values with the combined full name
    const formattedValues = {
      ...rest,
      fullName: combinedFullName,
    };
    setTransactionInProgress(true);

    // Upload Image to IPFS
    try {
      messageApi.open({
        type: "loading",
        content: "Uploading image file(s) to IPFS..",
        duration: 0,
      });
      if (file) {
        const cid = await uploadToIpfs(file);
        formattedValues.image = cid; // Replace image with CID
      }
      messageApi.destroy();
    } catch (error) {
      console.error("Error uploading file(s) to IPFS:", error);
    }

    // Auth list - aptos
    if (import.meta.env.VITE_APP_BlockChain === "Aptos") {
      const transaction: InputTransactionData = {
        data: {
          function: `${moduleAddress}::remed::creating_auth_list`,
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

    // Add Info to DB
    try {
      messageApi.open({
        type: "loading",
        content: "Adding information to database in progress..",
        duration: 0,
      });

      let response = await axios.post("http://localhost:4000/users", {
        userInfo: JSON.stringify(formattedValues),
        address: account?.address,
        maschainAddress: "",
        role: "doctor",
      });

      messageApi.destroy();

      console.log(response);

      if (response.statusText === "OK") {
        messageApi.open({
          type: "success",
          content: "User profile created successfully",
        });
        setTransactionInProgress(false);
        setTimeout(() => {
          navigate("/doctor/authorization");
        }, 500);
      } else {
        messageApi.open({
          type: "error",
          content: "Error creating user profile",
        });
      }
    } catch (error) {
      setTransactionInProgress(false);
      console.error("Error adding information to database:", error);
    }
  };

  return (
    <Form form={form} className="mt-4" layout="vertical" onFinish={onFinish}>
      {contextHolder}
      <Row gutter={16} className="rounded-md border">
        {/* Left Section */}
        <Col span={12} className=" !pl-4">
          <Form.Item>
            <div className="text-lg italic font-semibold">Doctor Profile</div>
          </Form.Item>
          <Form.Item
            name={["fullName"]}
            label="Full Name"
            required
            rules={[
              {
                required: true,
                message: "Please input the doctor's full name!",
              },
            ]}
          >
            <Input.Group compact>
              <Form.Item name={["fullName", "title"]} noStyle initialValue="Dr.">
                <Select style={{ width: "25%" }} defaultValue="Dr.">
                  <Option value="Dr.">Dr.</Option>
                  <Option value="MD">MD</Option>
                  <Option value="DO">DO</Option>
                  <Option value="Prof.">Prof.</Option>
                  <Option value="Consultant">Consultant</Option>
                  <Option value="Specialist">Specialist</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name={["fullName", "name"]}
                noStyle
                rules={[
                  {
                    required: true,
                    message: "Please input the doctor's full name!",
                  },
                ]}
              >
                <Input placeholder="Rayon Robert" style={{ width: "70%" }} />
              </Form.Item>
            </Input.Group>
          </Form.Item>
          <Form.Item
            name={["specialization"]}
            label="Specialization"
            required
            rules={[
              {
                required: true,
                message: "Please select the doctor's specialization!",
              },
            ]}
          >
            <Select placeholder="Select Specialization" style={{ width: "95%" }}>
              <Select.Option value="Radiologist">Radiologist</Select.Option>
              <Select.Option value="Oncologist">Oncologist</Select.Option>
              <Select.Option value="Neurologist">Neurologist</Select.Option>
              <Select.Option value="Pharmacist">Pharmacist</Select.Option>
              <Select.Option value="Pediatrician">Pediatrician</Select.Option>
              <Select.Option value="Cardiologist">Cardiologist</Select.Option>
              <Select.Option value="Gynecologist">Gynecologist</Select.Option>
              <Select.Option value="Ophthalmologist">Ophthalmologist</Select.Option>
              <Select.Option value="General Practitioner">General Practitioner</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name={["medicalLicenseNumber"]}
            label="Medical License Number"
            required
            rules={[
              {
                required: true,
                message: "Please input the doctor's medical license number!",
              },
            ]}
          >
            <Input placeholder="123456789" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["affiliations"]}
            label="Affiliations"
            required
            rules={[
              {
                required: true,
                message: "Please input the doctor's affiliations!",
              },
            ]}
          >
            <Input placeholder="Hospital ABC, Clinic XYZ" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["workHours"]}
            label="Work Hours"
            required
            rules={[
              {
                required: true,
                message: "Please input the doctor's work hours!",
              },
            ]}
          >
            <Input placeholder="Mon-Fri 9:00 AM - 5:00 PM" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["image"]}
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
                      setFile(e.target.files[0]);
                      setFileUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </Col>
              <Col span={6} className="pl-2">
                {fileUrl && <Avatar size={48} icon={<Image src={fileUrl} alt="img" />} />}
              </Col>
            </Row>
          </Form.Item>
        </Col>

        {/* Right Section */}
        <Col span={12} className="!pl-4">
          <Form.Item></Form.Item>
          <Form.Item
            name={["education"]}
            label="Education"
            required
            rules={[
              {
                required: true,
                message: "Please input the doctor's education!",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Medical School, Degrees, Certifications"
              style={{ width: "95%", height: "100px" }}
            />
          </Form.Item>
          <Form.Item
            name={["experience"]}
            label="Experience"
            required
            rules={[
              {
                required: true,
                message: "Please input the doctor's experience!",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Years of practice, previous positions"
              style={{ width: "95%", height: "100px" }}
            />
          </Form.Item>
          <Form.Item
            name={["languagesSpoken"]}
            label="Languages Spoken"
            required
            rules={[
              {
                required: true,
                message: "Please select or input the languages the doctor can speak!",
              },
            ]}
          >
            <Select
              mode="tags"
              style={{ width: "95%" }}
              placeholder="Type or select languages spoken"
              options={[
                { value: "English", label: "English" },
                { value: "Spanish", label: "Spanish" },
                { value: "French", label: "French" },
                { value: "German", label: "German" },
                { value: "Chinese", label: "Chinese" },
                { value: "Japanese", label: "Japanese" },
                { value: "Korean", label: "Korean" },
                { value: "Arabic", label: "Arabic" },
                { value: "Russian", label: "Russian" },
                { value: "Italian", label: "Italian" },
                { value: "Portuguese", label: "Portuguese" },
                { value: "Hindi", label: "Hindi" },
                { value: "Bengali", label: "Bengali" },
                { value: "Punjabi", label: "Punjabi" },
                { value: "Telugu", label: "Telugu" },
                { value: "Marathi", label: "Marathi" },
                { value: "Tamil", label: "Tamil" },
                { value: "Urdu", label: "Urdu" },
                { value: "Gujarati", label: "Gujarati" },
                { value: "Kannada", label: "Kannada" },
                { value: "Odia", label: "Odia" },
                { value: "Malay", label: "Malay" },
                { value: "Sindhi", label: "Sindhi" },
                { value: "Assamese", label: "Assamese" },
                { value: "Maithili", label: "Maithili" },
                { value: "Santali", label: "Santali" },
                { value: "Kashmiri", label: "Kashmiri" },
                { value: "Nepali", label: "Nepali" },
                { value: "Sanskrit", label: "Sanskrit" },
                { value: "Konkani", label: "Konkani" },
                { value: "Dogri", label: "Dogri" },
                { value: "Bodo", label: "Bodo" },
                { value: "Manipuri", label: "Manipuri" },
                { value: "Khasi", label: "Khasi" },
                { value: "Mizo", label: "Mizo" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name={["contactInformation"]}
            label="Contact Information"
            required
            rules={[
              {
                required: true,
                message: "Please input the doctor's contact information!",
              },
            ]}
          >
            <Input placeholder="Phone number" style={{ width: "95%" }} />
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

export default DoctorRegister;
