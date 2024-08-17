import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const aptosConfig = new AptosConfig({ network: Network.DEVNET });
export const aptos = new Aptos(aptosConfig);
export const moduleAddress = "0x63120a4547c03eb3114345181ede867be88b7d75acbbbeb337fbb84b958d75a4";
