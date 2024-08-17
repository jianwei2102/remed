import React, { useState } from "react";
import { Divider, Radio, Table, Button } from "antd";
import type { TableColumnsType } from "antd";
import { Flex } from "antd";
import { Parser } from "@json2csv/plainjs";
import { DownloadOutlined } from "@ant-design/icons";

interface DataType {
  key: React.Key;
  name: string;
}

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
  const onDownload = () => {
    try {
      const parser = new Parser();
      const csv = parser.parse(
        JSON.parse(
          `[{"visitType":"Follow-Up Visit","reasonOfVisit":"Patient has symptoms like like cough, sore throat, and fever","diagnosis":"Common Cold","symptoms":["Headache","Shortness of Breath","back pain"],"date":"12-08-2024","time":"12:32 PM","location":"Clinic Rayon","remark":"For more than 2 days"},
          {"visitType":"Follow-Up Visit","reasonOfVisit":"Patient has symptoms like like cough, sore throat, and fever","diagnosis":"Common Cold","symptoms":["Headache","Shortness of Breath","back pain"],"date":"12-08-2024","time":"12:32 PM","location":"Clinic Rayon","remark":"For more than 2 days"},
          {"visitType":"Follow-Up Visit","reasonOfVisit":"Patient has symptoms like like cough, sore throat, and fever","diagnosis":"Common Cold","symptoms":["Headache","Shortness of Breath","back pain"],"date":"12-08-2024","time":"12:32 PM","location":"Clinic Rayon","remark":"For more than 2 days"},
          {"visitType":"Follow-Up Visit","reasonOfVisit":"Patient has symptoms like like cough, sore throat, and fever","diagnosis":"Common Cold","symptoms":["Headache","Shortness of Breath","back pain"],"date":"12-08-2024","time":"12:32 PM","location":"Clinic Rayon","remark":"For more than 2 days"}]`,
        ),
      );
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

  return (
    <>
      {" "}
      <div className="flex content-center items-center mt-4">
        <span className="text-lg">Filter By:</span>
        <Flex className="pl-4" vertical gap="middle">
          <Radio.Group defaultValue="medical-record" size="large">
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
