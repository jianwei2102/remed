import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { Button, Layout, theme } from "antd";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Logo, MenuList, ToggleThemeButton, DateTime } from "./components/index.tsx";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { WalletSelector } from "./components/WalletSelector.tsx";
import {
  HomePage,
  PurchaseRecord,
  Collection,
  Authorization,
  MedicalRecords,
  Medications,
  LabResults,
  DoctorAuthorization,
  Profile,
  DoctorProfile,
  AppendRecord,
  Settings,
  ViewRecord,
  ModifyRecord,
  RewardPage,
} from "./pages/index.tsx";
import Test from "./pages/test";
import { ConnectWallet } from "@thirdweb-dev/react";

const { Header, Sider, Content } = Layout;

function App() {

  const [darkTheme, setDarkTheme] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <ThirdwebProvider clientId={import.meta.env.VITE_APP_ThirdWeb_Client_ID}>
      {/* <Header />

      <div className="flex items-center justify-center flex-col">
        {connected ? (
          <Card>
            <CardContent className="flex flex-col gap-10 pt-6">
              <WalletDetails />
              <NetworkInfo />
              <AccountInfo />
            </CardContent>
          </Card>
        ) : (
          <CardHeader>
            <CardTitle>To get started Connect a wallet</CardTitle>
          </CardHeader>
        )}
      </div> */}
      <Router>
        <Layout>
          <Sider
            collapsed={collapsed}
            collapsible
            trigger={null}
            theme={darkTheme ? "dark" : "light"}
            style={{
              overflow: "auto",
              height: "100vh",
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <Logo darkTheme={darkTheme} collapsed={collapsed} />
            <MenuList darkTheme={darkTheme} />
            <ToggleThemeButton darkTheme={darkTheme} toggleTheme={() => setDarkTheme(!darkTheme)} />
          </Sider>

          <Layout className={`${collapsed ? "ml-[80px]" : "ml-[200px]"} transition-all duration-200`}>
            <Header
              className="p-0 flex flex-wrap h-auto items-center justify-between pr-10 gap-4"
              style={{ background: colorBgContainer }}
            >
              <Button
                type="text"
                className="ml-4 flex-none"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
              <DateTime />
              {import.meta.env.VITE_APP_BlockChain === "Aptos" ? <WalletSelector /> : <ConnectWallet />}
              {/* Aptos Wallet */}
              {/* <WalletSelector /> */}

              {/* Sepolia and Scroll Wallet */}
            {/* <ConnectWallet /> */}
            </Header>

            <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
              <div
                className="min-h-[calc(100vh-138px)] overflow-auto"
                style={{ padding: 24, background: colorBgContainer }}
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/purchaseRecord" element={<PurchaseRecord />} />
                  <Route path="/collection" element={<Collection />} />
                  <Route path="/authorization" element={<Authorization />} />
                  <Route path="/authorization" element={<Authorization />} />
                  <Route path="/medicalRecord" element={<MedicalRecords />} />
                  <Route path="/medications" element={<Medications />} />
                  <Route path="/labResults" element={<LabResults />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/test" element={<Test />} />
                  <Route path="/doctor/authorization" element={<DoctorAuthorization />} />
                  <Route path="/doctor/viewRecord" element={<ViewRecord />} />
                  <Route path="/doctor/modifyRecord" element={<ModifyRecord />} />
                  <Route path="/doctor/appendRecord" element={<AppendRecord />} />
                  <Route path="/doctor/profile" element={<DoctorProfile />} />
                  <Route path="/rewards" element={<RewardPage />} />
                </Routes>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ThirdwebProvider>
  );
}

export default App;
