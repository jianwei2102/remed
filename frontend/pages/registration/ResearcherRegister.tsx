import axios from "axios";
import { useState } from "react";
import { FaInfo } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useStorageUpload } from "@thirdweb-dev/react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import { Form, Row, Col, Input, Button, Select, message, Tooltip, Avatar, Image } from "antd";

const { Option } = Select;

const ResearcherRegister = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  // const { connection } = useConnection();
  // const wallet = useAnchorWallet() as Wallet;
  const { mutateAsync: upload } = useStorageUpload();
  const [messageApi, contextHolder] = message.useMessage();

  const [file, setFile] = useState<File | undefined>();
  const [fileUrl, setFileUrl] = useState<string | undefined>();
  const { account, connected } = useWallet();

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
    };

    // Upload Image
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

    // Add User to Database
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
        role: "researcher",
      });

      messageApi.destroy();
      console.log(response);

      if (response.statusText === "OK") {
        messageApi.open({
          type: "success",
          content: "User profile created successfully",
        });
        setTimeout(() => {
          navigate("/researcher/purchaseRecord");
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

    // messageApi.open({
    //   type: "loading",
    //   content: "Transaction in progress..",
    //   duration: 0,
    // });
    // let response = await createProfile(connection, wallet, "doctor", JSON.stringify(formattedValues));
    // await axios.post("http://localhost:4000/users", {
    //   username: combinedFullName,
    //   address: wallet.publicKey.toBase58(),
    //   role: "doctor",
    // });
    // messageApi.destroy();
    // if (response.status === "success") {
    //   messageApi.open({
    //     type: "success",
    //     content: "User profile created successfully",
    //   });
    //   setTimeout(() => {
    //     navigate("/authorization");
    //   }, 500);
    // } else {
    //   console.log("Error creating user profile:", response);
    //   messageApi.open({
    //     type: "error",
    //     content: "Error creating user profile",
    //   });
    // }
  };

  return (
    <Form form={form} className="mt-4" layout="vertical" onFinish={onFinish}>
      {contextHolder}
      <Row gutter={16} className="rounded-md border">
        {/* Left Section */}
        <Col span={12} className=" !pl-4">
          <Form.Item>
            <div className="text-lg italic font-semibold">Researcher Profile</div>
          </Form.Item>
          {/* <Form.Item
            name={["fullName"]}
            label="Full Name"
            required
            rules={[
              {
                required: true,
                message: "Please input the researcher's full name!",
              },
            ]}
          >
            <Input.Group>
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
          </Form.Item> */}
          {/* <Form.Item
            name={["fullName", "name"]}
            noStyle
            rules={[
              {
                required: true,
                message: "Please input the doctor's full name!",
              },
            ]}
          ></Form.Item> */}
          <Form.Item
            name={["name"]}
            label="Full Name"
            required
            rules={[{ required: true, message: "Please input the user's full name!" }]}
          >
            <Input placeholder="Kyle Robinson" style={{ width: "95%" }} />
          </Form.Item>
          <Form.Item
            name={["ic"]}
            label="IC"
            required
            rules={[{ required: true, message: "Please input the user's IC!" }]}
          >
            <Input placeholder="010304-10-2912" style={{ width: "95%" }} />
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
          {/* <Form.Item
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
          </Form.Item> */}
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
        <Button type="primary" htmlType="submit" className="px-8 py-4 mt-4 text-lg">
          Create Profile
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ResearcherRegister;
