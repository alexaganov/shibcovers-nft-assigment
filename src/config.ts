import { Address } from "viem";

export const HOST = process.env.NEXT_PUBLIC_HOST ?? "http://localhost:3000";

export const NFT_CONTRACT_ADDRESS = (process.env.NFT_CONTRACT_ADDRESS ||
  "") as Address;

export const NFT_CONTRACT_DEPLOYMENT_BLOCK = BigInt(
  process.env.NFT_CONTRACT_DEPLOYMENT_BLOCK ?? 0
);
