import axios from "axios";
import { useNavigate } from "react-router-dom";
import { checkTokenBalance, mintTokens } from "@/lib/maschain";
import { useEffect, useState } from "react";
import { Button, message } from "antd";
import { decryptData, fetchProfile } from "../../utils/util.ts";
import { AiOutlineLineChart, AiOutlineRocket, AiTwotoneCheckCircle } from "react-icons/ai";
import { AiFillPlusCircle } from "react-icons/ai";
import { AiTwotoneWallet } from "react-icons/ai";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import bodyCheckupImg from "../../assets/body_checkup.jpg";
import medicalEquipmentImg from "../../assets/medical_equipment.jpg";
import supplementImg from "../../assets/supplement.jpg";
import { set } from "date-fns";

const RewardPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { account, connected } = useWallet();

  const [profile, setProfile] = useState<object | null>(null);

  const [tokenBalance, setTokenBalance] = useState(0);
  const [maschainTokenNum, setMaschainTokenNum] = useState(0);

  const getTotalToken = () => {
    return tokenBalance + maschainTokenNum;
  };

  useEffect(() => {
    const getProfile = async () => {
      if (!account) {
        console.log("Connection or wallet not available");
        return;
      }

      console.log("Account address: ", account.address);

      try {
        let response = await fetchProfile(account.address);

        console.log(response);

        if (response.status === "success") {
          return response.data;
        } else {
          // Direct to register if unable to find profile
          console.log("Unable to find profile");
          return;
        }
      } catch (error) {
        return;
      }
    };

    const callFunctions = async () => {
      // get profile
      let response = await getProfile();

      console.log(response);

      setProfile(response);

      setMaschainTokenNum(response.maschainTokenNum);

      // send to maschain
      const balance = await getMaschainTokenBalance(response.maschainAddress);

      setTokenBalance(balance || 0);
    };

    callFunctions();
  }, [account]);

  useEffect(() => {
    const getProfile = async () => {
      if (!connected || !account) {
        console.log("Connection or wallet not found!");
        navigate("/");
        return;
      }
      let response = await fetchProfile(account.address);
      if (response.status === "success") {
        
        if (response.data.role !== "patient") {
          navigate("/");
        } 
      } else {
        navigate("/");
      }
    };
    getProfile();
  }, [account]);

  const getMaschainTokenBalance = async (walletAddr: string) => {
    const data = {
      wallet_address: walletAddr,
      contract_address: import.meta.env.VITE_APP_MASCHAIN_CONTRACT_ADDRESS,
    };

    const resp = await checkTokenBalance(data);

    if (resp.status == 200) {
      return parseInt(resp.result);
    } else {
      messageApi.open({
        type: "error",
        content: "Error getting MasChain balance...",
      });
    }
  };

  const rewards = [
    {
      img: bodyCheckupImg,
      cost: 80,
      title1: "Healthcare Check-ups",
      title2: "Do a full body check-up for free",
      numClaims: 12,
    },
    {
      img: medicalEquipmentImg,
      cost: 100,
      title1: "Home Med Equipments",
      title2: "Get free medical equipments for home use",
      numClaims: 219,
    },
    {
      img: supplementImg,
      cost: 50,
      title1: "Health Supplements",
      title2: "Claim healthcare supplements for your children",
      numClaims: 88,
    },
  ];

  const handleMintClick = () => {
    if (profile == null) {
      messageApi.open({
        type: "error",
        content: "Please connect to your wallet first.",
      });
      return;
    }

    if (maschainTokenNum <= 0) {
      messageApi.open({
        type: "error",
        content: "No token to mint.",
      });
      return;
    }

    const mint = async (toWalletAddress: string, amount: number) => {
      const data = {
        wallet_address: import.meta.env.VITE_APP_MASCHAIN_DEFAULT_WALLET_ADDRESS,
        to: toWalletAddress,
        amount: amount,
        contract_address: import.meta.env.VITE_APP_MASCHAIN_CONTRACT_ADDRESS,
        callback_url: "https://postman-echo.com/post?",
      };

      const resp = await mintTokens(data);

      console.log(resp);

      if (resp.status == 200) {
        messageApi.open({
          type: "loading",
          content: "Minting MasChain tokens...",
        });

        setTimeout(async function () {
          messageApi.open({
            type: "success",
            content: "MasChain tokens minted successfully!",
          });

          // update token balance
          const balance = await getMaschainTokenBalance(profile.maschainAddress);

          setTokenBalance(balance || 0);
          setMaschainTokenNum(0);
        }, 5000);
      } else {
        messageApi.open({
          type: "error",
          content: "Error minting MasChain tokens...",
        });
      }
    };

    mint(profile.maschainAddress, (profile.maschainTokenNum).toString());
  };

  const handleClaimReward = (cost: number) => {

    // FIXME: this is a temporary fix to bypass insufficient balance check
    // if (tokenBalance < cost) {
    //   messageApi.open({
    //     type: "error",
    //     content: "Insufficient balance!",
    //   });
    //   return;
    // }

    messageApi.open({
      type: "loading",
      content: "Claiming reward...",
    });

    setTimeout(function () {
      messageApi.open({
        type: "success",
        content: "Reward claimed successfully!",
      });
    }, 2000);
  };

  return (
    <div>
      {contextHolder}
      <div className="mt-3 flex justify-between text-start">
        <div className="flex flex-col gap-2.5">
          <div className="text-3xl font-bold leading-[39px] lg:text-[38px] lg:leading-[45px]">MasChain Wallet</div>
        </div>
        <div className="hidden items-end justify-end sm:flex">
          <Button type="primary" icon={<AiOutlineRocket />} size={"large"} onClick={handleMintClick}>
            Mint
          </Button>
        </div>
      </div>

      <div className="mt-10 min-w-[375px] md:min-w-[700px] xl:min-w-[800px] grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <div className="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] border-gray-200 bg-white bg-clip-border shadow-md shadow-[#F3F3F3] dark:border-[#ffffff33] dark:!bg-navy-800 dark:text-white dark:shadow-none">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
              <AiTwotoneWallet size={36}></AiTwotoneWallet>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">Your Balance</p>
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">{tokenBalance}</h4>
          </div>
        </div>

        <div className="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] border-gray-200 bg-white bg-clip-border shadow-md shadow-[#F3F3F3] dark:border-[#ffffff33] dark:!bg-navy-800 dark:text-white dark:shadow-none">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
              <AiTwotoneCheckCircle size={36}></AiTwotoneCheckCircle>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">Available to Mint</p>
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">{maschainTokenNum}</h4>
          </div>
        </div>

        <div className="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] border-gray-200 bg-white bg-clip-border shadow-md shadow-[#F3F3F3] dark:border-[#ffffff33] dark:!bg-navy-800 dark:text-white dark:shadow-none">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
              <AiOutlineLineChart size={36}></AiOutlineLineChart>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">Total</p>
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">{getTotalToken()}</h4>
          </div>
        </div>
      </div>

      <div className="mt-16 flex w-full flex-col justify-center gap-10">
        <div className=" flex justify-between text-start">
          <div className="flex flex-col gap-2.5">
            <div className="text-3xl font-bold leading-[39px] lg:text-[38px] lg:leading-[45px]">Rewards</div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-between gap-[30px] rounded-[20px] sm:flex-row">
          {rewards.map((data, i) => {
            return (
              <article
                key={i}
                className="bg-white p-6 mb-6 shadow transition duration-300 group transform rounded-2xl border"
              >
                <div className="relative mb-4 rounded-2xl">
                  <img className="h-48 rounded-2xl w-full object-contain" src={data.img} alt="" />
                  <div className="absolute bottom-3 left-3 inline-flex items-center rounded-lg bg-white p-2 shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="h-5 w-5 text-red-700"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                    <span className="ml-1 text-sm text-slate-400">{data.numClaims}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center w-full pb-4 mb-auto">
                  <div className="flex items-center">
                    <div className="flex flex-1">
                      <div className="">
                        <p className="text-lg font-bold ">{data.title1}</p>
                        <p className="text-sm text-gray-500">{data.title2}</p>
                        <p className="font-semibold mt-5">Cost: {data.cost} MasChain Tokens</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end"></div>
                </div>
                <Button type="primary" icon={<AiFillPlusCircle />} size={"large"} className="w-full mt-3" onClick={() => handleClaimReward(data.cost)}>
                  Claim Reward
                </Button>
                <div></div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RewardPage;
