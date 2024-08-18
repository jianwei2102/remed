import XRay from "./XRay";
import dayjs from "dayjs";
import { useState } from "react";
import { format } from "date-fns";
import VitalSign from "./VitalSign";
import BloodCount from "./BloodCount";
import { useLocation } from "react-router-dom";
import { Button, Form, message, Radio } from "antd";
import { UploadFile } from "antd/es/upload/interface";
import { useStorageUpload } from "@thirdweb-dev/react";
import { appendRecord, encryptData, generateHash } from "../../../utils/util.ts";
import { useEthContractContext } from "@/context/sepoliaContract.tsx";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptos, moduleAddress } from "@/utils/aptos.ts";

const LabResult = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const { mutateAsync: upload } = useStorageUpload();
  const [messageApi, contextHolder] = message.useMessage();

  const [labType, setLabType] = useState("Vital Signs");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const patientName = location.state?.name;
  const patientAddress = location.state?.address;

  const { account, signAndSubmitTransaction } = useWallet();
  const { connectedAddress } = useEthContractContext();
  let blockchain = import.meta.env.VITE_APP_BlockChain;
  const [wallet, setWallet] = useState("");

  const uploadToIpfs = async (file: File): Promise<string> => {
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
    try {
      if (labType === "X-Ray") {
        messageApi.open({
          type: "loading",
          content: "Uploading image file(s) to IPFS...",
          duration: 0,
        });
        const cidPromises = fileList.map((file) => uploadToIpfs(file.originFileObj as File));
        const cids = await Promise.all(cidPromises);
        values.xrayImages = cids;
        messageApi.destroy();
      }
      const record = {
        ...values,
        date: format(dayjs().toDate(), "dd-MM-yyyy"),
        time: format(dayjs().toDate(), "hh:mm a"),
        type: labType,
        location: sessionStorage.getItem("affiliations")?.toString(),
      };
      const recordHash = generateHash(JSON.stringify(record), wallet, patientAddress);
      console.log(record, recordHash);
      messageApi.open({
        type: "loading",
        content: "Transaction in progress..",
        duration: 0,
      });
      // let response = await appendRecord(
      //   connection,
      //   wallet as any,
      //   recordHash,
      //   JSON.stringify(record),
      //   patientAddress,
      //   "labResults",
      // );

      let encrptedRecord = encryptData(JSON.stringify(record));

      if (blockchain === "Aptos") {
        const transaction: InputTransactionData = {
          data: {
            function: `${moduleAddress}::remed::append_record`,
            functionArguments: [patientAddress, recordHash, encrptedRecord, "labResults"],
          },
        };
        try {
          // sign and submit transaction to chain
          const response = await signAndSubmitTransaction(transaction);
          // wait for transaction
          await aptos.waitForTransaction({ transactionHash: response.hash });
        } catch (error) {
          console.error(error);
        }
      }
      messageApi.destroy();
      // if (response.status === "success") {
      form.resetFields();
      messageApi.open({
        type: "success",
        content: "Record created successfully!",
      });
      // } else {
      //   messageApi.open({
      //     type: "error",
      //     content: "Error creating record!",
      //   });
      // }
    } catch (error) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "Error uploading file(s) to IPFS",
      });
      console.error("Error uploading file(s) to IPFS:", error);
    }
  };

  const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 20 } };

  return (
    <div className="px-4">
      {contextHolder}
      <div className="font-semibold underline text-xl text-[#124588] mb-4">Create New Lab Result - {patientName}</div>
      <Radio.Group value={labType} onChange={(e) => setLabType(e.target.value)}>
        <Radio.Button value="Vital Signs">Vital Signs</Radio.Button>
        <Radio.Button value="Blood Test">Blood Test</Radio.Button>
        <Radio.Button value="X-Ray">X-Ray</Radio.Button>
      </Radio.Group>
      <Form {...formItemLayout} form={form} className="mt-4" layout="horizontal" onFinish={onFinish}>
        {labType === "Vital Signs" && <VitalSign />}
        {labType === "Blood Test" && <BloodCount />}
        {labType === "X-Ray" && <XRay fileList={fileList} setFileList={setFileList} />}

        <Form.Item className="grid justify-items-end ">
          <Button type="primary" htmlType="submit" className="px-8 py-4 mt-4 text-lg">
            Submit Record
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LabResult;
