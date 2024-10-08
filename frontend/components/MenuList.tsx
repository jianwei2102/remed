import { Menu } from "antd";
import Icon from "@ant-design/icons";
import type { GetProps } from "antd";
import { CgPill } from "react-icons/cg";
import { FiFileText } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";
import { LiaFileMedicalAltSolid } from "react-icons/lia";
import { fetchProfile, decryptData } from "../utils/util.ts";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
// import { MdOutlineNotificationsActive } from "react-icons/md";
import { PiUserCheck, PiTestTubeDuotone } from "react-icons/pi";
import { AiOutlineHome, AiOutlineSetting } from "react-icons/ai";
import { AiFillGift, AiOutlineGift } from "react-icons/ai";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface MenuListProps {
  darkTheme: boolean;
}

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const MenuList = ({ darkTheme }: MenuListProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { account, connected } = useWallet();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const defaultItem = useMemo(
    () => [
      {
        key: "/",
        icon: <AiOutlineHome size={18} />,
        label: "Homepage",
        onClick: () => navigate("/"),
      },
    ],
    [navigate],
  );

  const patientItems: MenuItem[] = useMemo(() => {
    type CustomIconComponentProps = GetProps<typeof Icon>;
    const EcgSvg = () => (
      <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 2C9.43043 2 9.81257 2.27543 9.94868 2.68377L15 17.8377L17.0513 11.6838C17.1874 11.2754 17.5696 11 18 11H22C22.5523 11 23 11.4477 23 12C23 12.5523 22.5523 13 22 13H18.7208L15.9487 21.3162C15.8126 21.7246 15.4304 22 15 22C14.5696 22 14.1874 21.7246 14.0513 21.3162L9 6.16228L6.94868 12.3162C6.81257 12.7246 6.43043 13 6 13H2C1.44772 13 1 12.5523 1 12C1 11.4477 1.44772 11 2 11H5.27924L8.05132 2.68377C8.18743 2.27543 8.56957 2 9 2Z" />
      </svg>
    );
    const EcgIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={EcgSvg} {...props} />;

    return [
      {
        key: "/",
        icon: <AiOutlineHome size={18} />,
        label: "Dashboard",
        onClick: () => navigate("/"),
      },
      {
        key: "/authorization",
        icon: <PiUserCheck size={18} />,
        label: "Auth Doctor",
        onClick: () => navigate("/authorization"),
      },
      {
        key: "/medicalRecord",
        icon: <EcgIcon />,
        label: "Medical Records",
        onClick: () => navigate("/medicalRecord"),
      },
      {
        key: "/medications",
        icon: <CgPill size={18} />,
        label: "Medications",
        onClick: () => navigate("/medications"),
      },
      {
        key: "/labResults",
        icon: <PiTestTubeDuotone size={18} />,
        label: "Lab Results",
        onClick: () => navigate("/labResults"),
      },
      {
        key: "/rewards",
        icon: <AiOutlineGift size={18} />,
        label: "Rewards",
        onClick: () => navigate("/rewards"),
      },
      {
        key: "/profile",
        icon: <AiOutlineUser size={18} />,
        label: "Profile",
        onClick: () => navigate("/profile"),
      },
      {
        key: "/settings",
        icon: <AiOutlineSetting size={18} />,
        label: "Settings",
        onClick: () => navigate("/settings"),
      },
      // {
      //   key: "/notification",
      //   icon: <MdOutlineNotificationsActive size={18} />,
      //   label: "Notification",
      //   onClick: () => navigate("/notification"),
      // },
    ];
  }, [navigate]);

  const doctorItems = useMemo(() => {
    const isAppendRecord = location.pathname === "/doctor/appendRecord";
    const isViewRecord = location.pathname === "/doctor/viewRecord";

    return [
      {
        key: "/",
        icon: <AiOutlineHome size={18} />,
        label: "Dashboard",
        onClick: () => navigate("/"),
      },
      {
        key: "/doctor/authorization",
        icon: <PiUserCheck size={18} />,
        label: "Auth Patient",
        onClick: () => navigate("/doctor/authorization"),
      },
      {
        key: "/doctor/viewRecord",
        icon: <FiFileText size={18} />,
        label: "View Record",
        disabled: !isViewRecord,
        onClick: () => {
          if (!isViewRecord) navigate("/doctor/viewRecord");
        },
      },
      {
        key: "/doctor/appendRecord",
        icon: <LiaFileMedicalAltSolid size={18} />,
        label: "Append Record",
        disabled: !isAppendRecord,
        onClick: () => {
          if (!isAppendRecord) navigate("/doctor/appendRecord");
        },
      },
      {
        key: "/doctor/profile",
        icon: <AiOutlineUser size={18} />,
        label: "Profile",
        onClick: () => navigate("/doctor/profile"),
      },
      {
        key: "/settings",
        icon: <AiOutlineSetting size={18} />,
        label: "Settings",
        onClick: () => navigate("/settings"),
      },
      // {
      //   key: "/notification",
      //   icon: <MdOutlineNotificationsActive size={18} />,
      //   label: "Notification",
      //   onClick: () => navigate("/notification"),
      // },
    ];
  }, [navigate, location.pathname]);

  const researcherItems = useMemo(() => {
    return [
      {
        key: "/",
        icon: <AiOutlineHome size={18} />,
        label: "Dashboard",
        onClick: () => navigate("/"),
      },
      {
        key: "/purchaseRecord",
        icon: <PiUserCheck size={18} />,
        label: "Purchase Record",
        onClick: () => navigate("/purchaseRecord"),
      },
      // {
      //   key: "/doctor/profile",
      //   icon: <AiOutlineUser size={18} />,
      //   label: "Profile",
      //   onClick: () => navigate("/doctor/profile"),
      // },
      {
        key: "/collection",
        icon: <PiUserCheck size={18} />,
        label: "Collection",
        onClick: () => navigate("/collection"),
      },
      {
        key: "/settings",
        icon: <AiOutlineSetting size={18} />,
        label: "Settings",
        onClick: () => navigate("/settings"),
      },
    ];
  }, [navigate, location.pathname]);

  useEffect(() => {
    setMenuItems(defaultItem);

    const getProfile = async () => {
      if (account) {
        let response = await fetchProfile(account.address);
        if (response.status === "success") {
          if (response.data.role === "patient") {
            setMenuItems(patientItems);
          } else if (response.data.role === "doctor") {
            setMenuItems(doctorItems);
          } else if (response.data.role === "researcher") {
            setMenuItems(researcherItems);
          }
        }
      } else {
        setMenuItems(defaultItem);
      }
    };

    getProfile();
  }, [account, defaultItem, patientItems, doctorItems]);

  return (
    <Menu
      theme={darkTheme ? "dark" : "light"}
      className="mt-1 flex flex-col gap-3 text-lg relative"
      items={menuItems}
      selectedKeys={[location.pathname]}
      defaultSelectedKeys={["/"]}
    />
  );
};

export default MenuList;
