import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const aptosConfig = new AptosConfig({ network: Network.DEVNET });
export const aptos = new Aptos(aptosConfig);
export const moduleAddress = "0xb289ca0db88599a6f7f952621b674aeeb2c7080696a887c6bc3d480ea354f510";
