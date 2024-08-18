import { Col, Row } from "antd";
import img from "../../assets/welcomingIllustration.png";

const ResearcherDashboard = () => {
  return (
    <>
      <Row className="flex justify-center mt-32">
        <Col>
          <img className="w-full h-full object-contain" src={img} alt="Patient Illustration" />
        </Col>
      </Row>
      <Row className="flex justify-center mt-16">
        <Col>
          <div className="flex flex-col justify-center items-center h-full">
            <div className="text-4xl font-semibold">Welcome to ReMed as Researcher !</div>
            <div className="text-lg text-gray-500 mt-4 text-center">
              Where you can pay to access medical records and contribute to medical research.
              {/* <div className="italic text-sm mt-2">Login with your Aptos wallet to get started!</div> */}
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ResearcherDashboard;
