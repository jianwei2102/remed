import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { decryptData, fetchProfile } from "../../utils/util.ts";
import { Avatar, Button, Card, Col, Descriptions, Image, Modal, QRCode, QRCodeProps, Row, Space } from "antd";

interface ProfileDetails {
  specialization: string;
  medicalLicenseNumber: string;
  affiliations: string;
  workHours: string;
  image: string;
  education: string;
  experience: string;
  languagesSpoken: string[];
  contactInformation: string;
  fullName: string;
}

const Profile = () => {
  const navigate = useNavigate();

  const { account, connected } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [renderType] = useState<QRCodeProps["type"]>("canvas");
  const [details, setDetails] = useState<ProfileDetails | null>(null);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  function doDownload(url: string, fileName: string) {
    const a = document.createElement("a");
    a.download = fileName;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const downloadQRCode = () => {
    const canvas = document.getElementById("myqrcode")?.querySelector<HTMLCanvasElement>("canvas");
    if (canvas) {
      const url = canvas.toDataURL();
      doDownload(url, "QRCode.png");
    }
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
        
        if (response.data.role === "patient") {
          navigate("/");
        } else if (response.data.role === "doctor") {
          // let personalDetails = (response.data as { personalDetails: string })["personalDetails"];
          // let details = JSON.parse(decryptData(personalDetails, "profile"));
          setDetails(JSON.parse(response.data.userInfo));
          // console.log("details", details);
        }
      } else {
        navigate("/");
      }
    };
    getProfile();
  }, [account]);

  return (
    <>
      <Space direction="vertical" size={22} className="w-full">
        <Card
          title={
            <Row className="py-2" gutter={10}>
              <Col>
                <Avatar
                  size={48}
                  icon={
                    <Image
                      src={`https://${import.meta.env.VITE_APP_ThirdWeb_Client_ID}.ipfscdn.io/ipfs/${details?.image}/`}
                      alt="Profile Image"
                    />
                  }
                />
              </Col>
              <Col className="ml-2">
                <div>{details?.fullName}</div>
                <div className="font-normal">{account?.address}</div>
                {/* <div className="font-normal">{wallet?.publicKey.toBase58()}</div> */}
              </Col>
            </Row>
          }
          extra={
            <Button type="link" onClick={showModal}>
              QR Code
            </Button>
          }
        >
          <Descriptions column={1}>
            <Descriptions.Item label="Specialization">{details?.specialization}</Descriptions.Item>
            <Descriptions.Item label="Medical License Number">{details?.medicalLicenseNumber}</Descriptions.Item>
            <Descriptions.Item label="Affiliations">{details?.affiliations}</Descriptions.Item>
            <Descriptions.Item label="Work Hours">{details?.workHours}</Descriptions.Item>
            <Descriptions.Item label="Language Spoken">{details?.languagesSpoken.join(", ")}</Descriptions.Item>
            <Descriptions.Item label="Contact Information">{details?.contactInformation}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title={"Education"} style={{ width: "100%" }}>
          <div
            dangerouslySetInnerHTML={{
              __html: details?.education?.replace(/\n/g, "<br />") ?? "",
            }}
          />
        </Card>
        <Card title={"Experience"} style={{ width: "100%" }}>
          <div
            dangerouslySetInnerHTML={{
              __html: details?.experience?.replace(/\n/g, "<br />") ?? "",
            }}
          />
        </Card>
      </Space>
      <Modal
        title="Wallet Address's QR Code"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[]}
        width={420}
        centered
      >
        <div id="myqrcode" className="flex flex-col justify-center items-center mt-4">
          {/* <QRCode type={renderType} bgColor="#fff" value={wallet?.publicKey.toBase58()} /> */}
          {account?.address && (
            <QRCode type={renderType} bgColor="#fff" value={account.address} />
          )}
          <Button type="primary" className="mt-4" onClick={downloadQRCode}>
            Download
          </Button>
          <span className="mt-4 text-center">
            <p className="text-sm font-semibold">Your Wallet Address</p>
            <p className="text-xs">{account?.address}</p>
            {/* <p className="text-xs">{wallet?.publicKey.toBase58()}</p> */}
          </span>
        </div>
      </Modal>
    </>
  );
};

export default Profile;
