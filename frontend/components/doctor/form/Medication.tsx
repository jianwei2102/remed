import dayjs from "dayjs";
import { format } from "date-fns";

import { useLocation } from "react-router-dom";
import { appendRecord, encryptData, generateHash } from "../../../utils/util.ts";

import { Button, Collapse, Form, Input, message, Select, InputNumber } from "antd";
import { aptos, moduleAddress } from "@/utils/aptos.ts";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { useEthContractContext } from "@/context/sepoliaContract.tsx";

const { Panel } = Collapse;

const Medication = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();

  const patientName = location.state?.name;
  const patientAddress = location.state?.address;

  const { account, signAndSubmitTransaction } = useWallet();
  const { connectedAddress } = useEthContractContext();
  let blockchain = import.meta.env.VITE_APP_BlockChain;
  const [wallet, setWallet] = useState("");

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
    messageApi.open({
      type: "error",
      content: "Please fill in all the required fields!",
    });
  };

  const onFinish = async (values: any) => {
    if (!values.medications || values.medications.length === 0) {
      messageApi.open({
        type: "error",
        content: "Please add new medications!",
      });
      return;
    }
    const record = {
      ...values,
      date: format(dayjs().toDate(), "dd-MM-yyyy"),
      time: format(dayjs().toDate(), "hh:mm a"),
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
    //   wallet,
    //   recordHash,
    //   JSON.stringify(record),
    //   patientAddress,
    //   "medication",
    // );

    let encrptedRecord = encryptData(JSON.stringify(record));

    if (blockchain === "Aptos") {
      const transaction: InputTransactionData = {
        data: {
          function: `${moduleAddress}::remed::append_record`,
          functionArguments: [patientAddress, recordHash, encrptedRecord, "medication"],
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
    // Reset the form fields to their initial state
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
  };

  const formItemLayout = { labelCol: { span: 3 }, wrapperCol: { span: 21 } };

  return (
    <div className="px-4">
      {contextHolder}
      <div className="font-semibold underline text-xl text-[#124588] mb-4">
        Create New Medications Record - {patientName}
      </div>
      <div className="font-semibold text-xl mb-4">Medications Details</div>
      <Form
        {...formItemLayout}
        form={form}
        className="mt-4"
        layout="horizontal"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.List name="medications" initialValue={[{}]}>
          {(fields, { add, remove }) => (
            <>
              <Collapse defaultActiveKey={fields.map((field) => field.key.toString())}>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Panel
                    header={`Medication`}
                    key={key.toString()}
                    className="border-2"
                    forceRender
                    extra={
                      <Button type="link" onClick={() => remove(name)} danger>
                        Delete
                      </Button>
                    }
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "indication"]}
                      fieldKey={[fieldKey?.toString() ?? "", "indication"]}
                      label="Indication"
                      rules={[
                        {
                          required: true,
                          message: "Please select the indication!",
                        },
                      ]}
                    >
                      <Select placeholder="Select Indication" style={{ width: "100%" }}>
                        <Select.Option value="Antihypertension">Antihypertension</Select.Option>
                        <Select.Option value="Pain Relief">Pain Relief</Select.Option>
                        <Select.Option value="Antibiotic">Antibiotic</Select.Option>
                        <Select.Option value="Anti-inflammatory">Anti-inflammatory</Select.Option>
                        <Select.Option value="Antidepressant">Antidepressant</Select.Option>
                        <Select.Option value="Antidiabetic">Antidiabetic</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "medication"]}
                      fieldKey={[fieldKey?.toString() ?? "", "medication"]}
                      label="Medication"
                      rules={[
                        {
                          required: true,
                          message: "Please input the medication name!",
                        },
                      ]}
                    >
                      <Input placeholder="e.g. Paracetamol" style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "frequency"]}
                      fieldKey={[fieldKey?.toString() ?? "", "frequency"]}
                      label="Frequency"
                      rules={[
                        {
                          required: true,
                          message: "Please select the frequency!",
                        },
                      ]}
                    >
                      <Select placeholder="Select Frequency" style={{ width: "100%" }}>
                        <Select.Option value="Once a day">Once a day</Select.Option>
                        <Select.Option value="Twice a day">Twice a day</Select.Option>
                        <Select.Option value="Thrice a day">Thrice a day</Select.Option>
                        <Select.Option value="Four times a day">Four times a day</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "administration"]}
                      fieldKey={[fieldKey?.toString() ?? "", "administration"]}
                      label="Administration"
                      rules={[
                        {
                          required: true,
                          message: "Please select the administration time!",
                        },
                      ]}
                    >
                      <Select placeholder="Select Administration Time" style={{ width: "100%" }}>
                        <Select.Option value="Take in the morning">Take in the morning</Select.Option>
                        <Select.Option value="Take before food">Take before food</Select.Option>
                        <Select.Option value="Take after food">Take after food</Select.Option>
                        <Select.Option value="Take before bedtime">Take before bedtime</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "duration"]}
                      fieldKey={[fieldKey?.toString() ?? "", "duration"]}
                      label="Duration (Days)"
                      rules={[
                        {
                          required: true,
                          message: "Please input the duration in days!",
                        },
                      ]}
                    >
                      <InputNumber placeholder="e.g. 7" style={{ width: "100%" }} />
                    </Form.Item>
                  </Panel>
                ))}
              </Collapse>
              <Button className="mt-2" type="dashed" onClick={() => add()} block>
                Add New Medication
              </Button>
            </>
          )}
        </Form.List>
        <Form.Item className="grid justify-items-start">
          <Button type="primary" htmlType="submit" className="w-[240px] px-8 py-4 mt-4 text-lg">
            Submit Record
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Medication;
