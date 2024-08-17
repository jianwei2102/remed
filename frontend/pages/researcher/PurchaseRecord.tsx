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
  Divider,
} from "antd";
import { useEffect, useState } from "react";

const plainOptions = [
  "Medical Record",
  "Medication",
  "Lab Result - Vital Sign",
  "Lab Result - X Ray",
  "Lab Result - Blood Count",
];

const listOptions = [
  {
    Title: "Medical Record",
    Price: 0.001,
  },
  {
    Title: "Medication",
    Price: 0.002,
  },

  {
    Title: "Lab Result - Vital Sign",
    Price: 0.003,
  },
  {
    Title: "Lab Result - X Ray",
    Price: 0.004,
  },
  {
    Title: "Lab Result - Blood Count",
    Price: 0.005,
  },
];

import type { CheckboxProps } from "antd";

const CheckboxGroup = Checkbox.Group;

const PurchaseRecord = () => {
  const [form] = Form.useForm();

  const [price, setPrice] = useState<number>(0);

  const [checkedList, setCheckedList] = useState<string[]>([]);

  const printForm = () => {
    console.log(form.getFieldsValue());
  };

  const onChange = (e: any, index: number) => {
    console.log(e.target.checked);
    // Add to checked list if true, else search n remove from checked list
    if (e.target.checked) {
      setCheckedList((prev) => [...prev, e.target.id]);
      setPrice((prev) => Math.round((prev + listOptions[index].Price) * 1000) / 1000);
    } else {
      setCheckedList((prev) => prev.filter((item) => item !== e.target.id));
      setPrice((prev) => Math.round((prev - listOptions[index].Price) * 1000) / 1000);
    }
    console.log(checkedList);
  };

  useEffect(() => {
    if (checkedList.length === 0) {
      setPrice(0);
    }
  }, [checkedList]);

  return (
    <>
      <Row gutter={16} className="rounded-md">
        <Col span={14} className="!pl-4">
          <div className="text-2xl font-bold">Purchase EMR</div>

          <Form form={form} className="mt-4 h-[300px]" layout="vertical">
            <Row gutter={30} className="h-[100%]">
              {listOptions.map((option, index) => (
                <Col span={24} key={index} className="mt-5">
                  <Form.Item name={option.Title} valuePropName="checked" className="flex justify-between">
                    <Checkbox
                      onChange={(e) => {
                        onChange(e, index);
                        // setPrice(checkedList.length * option.Price);
                      }}
                    >{`${option.Title}  :  ${option.Price} ATP`}</Checkbox>
                  </Form.Item>
                  <div className="mt-5">
                    <DatePicker onChange={() => {}} className="me-5" />
                    <DatePicker onChange={() => {}} />
                  </div>
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
            <Divider />
            {checkedList.map((item) => (
              <div className="flex justify-between items-center">
                <p className="text-[16px] text-black mt-3">{item}</p>
              </div>
            ))}
            <Divider />
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
