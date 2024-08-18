import { Form, Button, Row, Col, Checkbox, Card, DatePicker, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfile } from "../../utils/util.ts";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptos } from "@/utils/aptos.ts";

const listOptions = [
  {
    Title: "Medical Record",
    Price: 0.005,
  },
  {
    Title: "Medication",
    Price: 0.01,
  },
  {
    Title: "Lab Result - Vital Sign",
    Price: 0.015,
  },
  {
    Title: "Lab Result - X Ray",
    Price: 0.02,
  },
  {
    Title: "Lab Result - Blood Count",
    Price: 0.025,
  },
];

const PurchaseRecord = () => {
  const navigate = useNavigate();
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [form] = Form.useForm();
  const [price, setPrice] = useState<number>(0);
  const [checkedList, setCheckedList] = useState<string[]>([]);

  const onChange = (e: any, index: number) => {
    if (e.target.checked) {
      setCheckedList((prev) => [...prev, e.target.id]);
      setPrice((prev) => Math.round((prev + listOptions[index].Price) * 1000) / 1000);
    } else {
      setCheckedList((prev) => prev.filter((item) => item !== e.target.id));
      setPrice((prev) => Math.round((prev - listOptions[index].Price) * 1000) / 1000);
    }
  };

  useEffect(() => {
    if (checkedList.length === 0) {
      setPrice(0);
    }
  }, [checkedList]);

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

  // Function to handle the transfer
  const handleCheckout = async () => {
    if (!account || price <= 0) {
      message.error("Invalid wallet or amount");
      return;
    }

    try {
      const receiver = "0xf148fa6813a01805e858c07fbb303023a293e07c4e0bcc1a55d6e8d0479ab056"; // replace with the actual receiver wallet address
      const transaction: InputTransactionData = {
        data: {
          function: "0x1::coin::transfer", // Aptos Coin Transfer Function
          functionArguments: [receiver, (price * 1e8).toString()], // Send amount in the smallest unit (Octas)
          typeArguments: ["0x1::aptos_coin::AptosCoin"],
        },
      };

      // Ensure the transaction is correctly signed and submitted
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash }); // Wait for the transaction to be confirmed

      console.log("Transaction response:", response);
      message.success(" The record has been purchased successfully.");
    } catch (error) {
      console.error("Transaction failed:", error);
      message.error("Transaction failed. Please try again.");
    }
  };

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
          >
            <p>Total Price: {price} ATP</p>
            <Button type="primary" onClick={handleCheckout}>
              Checkout
            </Button>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PurchaseRecord;
