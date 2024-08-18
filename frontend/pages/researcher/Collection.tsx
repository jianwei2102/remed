import React, { useEffect, useState } from "react";
import { Divider, Radio, Table, Button } from "antd";
import type { TableColumnsType } from "antd";
import { Flex } from "antd";
import { Parser } from "@json2csv/plainjs";
import { DownloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { fetchProfile } from "../../utils/util.ts";

interface DataType {
  key: React.Key;
  name: string;
}

const csvData = {
  "medical-record": `[
  {"visitType":"Follow-Up Visit","reasonOfVisit":"Patient has symptoms like like cough, sore throat, and fever","diagnosis":"Common Cold","symptoms":["Headache","Shortness of Breath","back pain"],"date":"12-08-2024","time":"12:32 PM","location":"Clinic Rayon","remark":"For more than 2 days"},
  {"visitType":"Follow-Up Visit","reasonOfVisit":"Patient has symptoms like like cough, sore throat, and fever","diagnosis":"Common Cold","symptoms":["Headache","Shortness of Breath","back pain"],"date":"12-08-2024","time":"12:32 PM","location":"Clinic Rayon","remark":"For more than 2 days"},
  {"visitType":"Follow-Up Visit","reasonOfVisit":"Patient has symptoms like like cough, sore throat, and fever","diagnosis":"Common Cold","symptoms":["Headache","Shortness of Breath","back pain"],"date":"12-08-2024","time":"12:32 PM","location":"Clinic Rayon","remark":"For more than 2 days"},
  {"visitType":"Follow-Up Visit","reasonOfVisit":"Patient has symptoms like like cough, sore throat, and fever","diagnosis":"Common Cold","symptoms":["Headache","Shortness of Breath","back pain"],"date":"12-08-2024","time":"12:32 PM","location":"Clinic Rayon","remark":"For more than 2 days"}]`,
  medication: `[
  {"medications":[{"indication":"Antihypertension","medication":"Paracetamol 500mg","frequency":"Twice a day","administration":"Take before food","duration":3},{"indication":"Pain Relief","medication":"Lisinopril 10mg","frequency":"Twice a day","administration":"Take before bedtime","duration":1}],"date":"12-08-2024","time":"12:33 PM","location":"Clinic Rayon"},
  {"medications":[{"indication":"Antihypertension","medication":"Paracetamol 500mg","frequency":"Twice a day","administration":"Take before food","duration":3},{"indication":"Pain Relief","medication":"Lisinopril 10mg","frequency":"Twice a day","administration":"Take before bedtime","duration":1}],"date":"12-08-2024","time":"12:33 PM","location":"Clinic Rayon"},
  {"medications":[{"indication":"Antihypertension","medication":"Paracetamol 500mg","frequency":"Twice a day","administration":"Take before food","duration":3},{"indication":"Pain Relief","medication":"Lisinopril 10mg","frequency":"Twice a day","administration":"Take before bedtime","duration":1}],"date":"12-08-2024","time":"12:33 PM","location":"Clinic Rayon"}]`,
  "x-ray": `[
  {"xrayResult":"No abnormalities detected","xrayImages":["bafybeia3xk77g7ijrgtyuntipvyznmddo3ekxwmtabdvzqnen2ktskcdai"],"date":"12-08-2024","time":"12:35 PM","type":"X-Ray","location":"Clinic Rayon"},
  {"xrayResult":"No abnormalities detected","xrayImages":["bafybeia3xk77g7ijrgtyuntipvyznmddo3ekxwmtabdvzqnen2ktskcdai"],"date":"12-08-2024","time":"12:35 PM","type":"X-Ray","location":"Clinic Rayon"}]`,
  "blood-count": `[
  {"whiteBloodCells":"7","redBloodCells":"11","hematocrit":"12","hemoglobin":"2","platelets":"132","date":"12-08-2024","time":"12:34 PM","type":"Blood Test","location":"Clinic Rayon"},
  {"whiteBloodCells":"7","redBloodCells":"11","hematocrit":"12","hemoglobin":"2","platelets":"132","date":"12-08-2024","time":"12:34 PM","type":"Blood Test","location":"Clinic Rayon"}]`,
  "vital-sign": `[
  {"systolicBP":120,"diastolicBP":80,"heartRate":120,"bodyTemperature":37,"date":"12-08-2024","time":"12:33 PM","type":"Vital Signs","location":"Clinic Rayon"},
  {"systolicBP":120,"diastolicBP":80,"heartRate":120,"bodyTemperature":37,"date":"12-08-2024","time":"12:33 PM","type":"Vital Signs","location":"Clinic Rayon"},
  {"systolicBP":120,"diastolicBP":80,"heartRate":120,"bodyTemperature":37,"date":"12-08-2024","time":"12:33 PM","type":"Vital Signs","location":"Clinic Rayon"}]`,
};

const columns: TableColumnsType<DataType> = [
  {
    title: "Title",
    dataIndex: "name",
    render: (text: string) => <a>{text}</a>,
  },
];

const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
  },
  {
    key: "2",
    name: "Jim Green",
  },
  {
    key: "3",
    name: "Joe Black",
  },
];

const Collection = () => {
  const navigate = useNavigate();
  const { account, connected } = useWallet();
  const [selection, setSelection] = useState("medical-record");

  const onDownload = () => {
    try {
      const parser = new Parser();
      const csv = parser.parse(JSON.parse(csvData[selection as keyof typeof csvData]));
      console.log(csv);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "data.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
    },
    getCheckboxProps: (record: DataType) => ({
      disabled: record.name === "Disabled User", // Column configuration not to be checked
      name: record.name,
    }),
  };

  useEffect(() => {
    const getProfile = async () => {
      if (!connected || !account) {
        console.log("Connection or wallet not found!");
        navigate("/");
        return;
      }
      let response = await fetchProfile(account.address);
      if (response.status === "success") {
        
        if (response.data.role !== "researcher") {
          navigate("/");
        } 
      } else {
        navigate("/");
      }
    };
    getProfile();
  }, [account]);

  return (
    <>
      {" "}
      <div className="flex content-center items-center mt-4">
        <span className="text-lg">Filter By:</span>
        <Flex className="pl-4" vertical gap="middle">
          <Radio.Group
            defaultValue="medical-record"
            size="large"
            onChange={(e) => {
              setSelection(e.target.value);
              console.log(e.target.value);
            }}
          >
            <Radio.Button value="medical-record">Medical Record</Radio.Button>
            <Radio.Button value="medication">Medication</Radio.Button>
            <Radio.Button value="x-ray">Lab Results - X Ray</Radio.Button>
            <Radio.Button value="blood-count">Lab Results - Blood Count</Radio.Button>
            <Radio.Button value="vital-sign">Lab Results - Vital Sign</Radio.Button>
          </Radio.Group>
        </Flex>
      </div>
      <div className="flex content-end justify-end items-end mt-8">
        <Button type="primary" icon={<DownloadOutlined />} size="large" onClick={onDownload}>
          Download
        </Button>
      </div>
      <div className="mt-5">
        <Table
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
          columns={columns}
          dataSource={data}
        />
      </div>
    </>
  );
};

export default Collection;
