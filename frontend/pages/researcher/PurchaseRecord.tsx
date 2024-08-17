import {
  Form,
  Button,
  Modal,
  Input,
  Checkbox,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  Image,
  Avatar,
  Tooltip,
  Card,
} from "antd";
import { useState } from "react";

const plainOptions = [
  "Medical Record",
  "Medication",
  "Lab Result - Vital Sign",
  "Lab Result - X Ray",
  "Lab Result - Blood Count",
];

import type { CheckboxProps } from "antd";

const CheckboxGroup = Checkbox.Group;

const PurchaseRecord = () => {
  const [form] = Form.useForm();

  // const emrSelection = useRef<string>("");
  const [emrSelection, setEmrSelection] = useState<string>("");
  const [price, setPrice] = useState<number>(0);

  const [checkedList, setCheckedList] = useState<string[]>([]);

  const printForm = () => {
    console.log(form.getFieldsValue());
  };

  return (
    <>
      <Row gutter={16} className="rounded-md">
        <Col span={14} className="!pl-4">
          <div className="text-2xl font-bold">Purchase EMR</div>

          <Form form={form} className="mt-4 h-[100%]" layout="vertical">
            <Row gutter={30} className="h-[100%]">
              {plainOptions.map((option) => (
                <Col span={24}>
                  <Form.Item name={option} valuePropName="checked">
                    <Checkbox>{option}</Checkbox>
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
        </Col>

        <Col span={10} className="!pr-4">
          <Card
            title="Cart Summary"
            bordered={false}
            styles={{
              title: {
                fontWeight: "bold",
                fontSize: "30px",
                color: "#fff",
              },
              header: {
                backgroundColor: "#001529",
              },
            }}
            style={{
              width: "100%",
              boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
              fontWeight: "bold",
              color: "#1890ff",
            }}
            className="rounded-md text-[30px]"
          >
            <h1 className="text-center font-bold text-[60px]" style={{ color: "#1890ff" }}>
              {price} ATP
            </h1>
            <div className="flex justify-center items-center">
              <Button className="w-[80%] mt-4" type="primary" size={"large"} onClick={printForm}>
                Checkout
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PurchaseRecord;
