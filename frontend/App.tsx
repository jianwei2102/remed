import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Header } from "@/components/Header";
import { WalletDetails } from "@/components/WalletDetails";
import { NetworkInfo } from "@/components/NetworkInfo";
import { AccountInfo } from "@/components/AcoountInfo";

import { useState } from "react";
import { Button, Layout, theme } from "antd";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Logo, MenuList, ToggleThemeButton, DateTime } from "./components/index.tsx";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { WalletSelector } from "./components/WalletSelector.tsx";
import {
  HomePage,
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
} from "./pages/index.tsx";
import Test from "./pages/test";

const { Header, Sider, Content } = Layout;

function App() {
  const { connected } = useWallet();

  const [darkTheme, setDarkTheme] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <>
      <Header />

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
      </div>
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
              <WalletSelector />
            </Header>

            <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
              <div
                className="min-h-[calc(100vh-138px)] overflow-auto"
                style={{ padding: 24, background: colorBgContainer }}
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  {/* <Route path="/authorization" element={<Authorization />} />
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
                   <Route path="/doctor/profile" element={<DoctorProfile />} /> */}
                </Routes>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </>
  );
}

export default App;
