import ky from "ky";
import { NextResponse } from "next/server";

const CONTRACT_ADDRESS = "0x007Bbf85988cAF18Cf4222C9214e4fa019b3e002";

interface NftTransaction {
  blockHash: string;
  blockNumber: string;
  confirmations: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  from: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  hash: string;
  input: string;
  logIndex: string;
  nonce: string;
  timeStamp: string;
  to: string;
  tokenDecimal: string;
  tokenID: string;
  tokenName: string;
  tokenSymbol: string;
  transactionIndex: string;
}

const getAllNftTransactions = async ({
  contractAddress,
  page = 0,
  offset = 10000,
}: {
  contractAddress: string;
  page?: number;
  offset?: number;
}) => {
  const response = await ky.get(
    `https://www.shibariumscan.io/api?module=account&action=tokennfttx&address=0x0000000000000000000000000000000000000000&contractaddress=${contractAddress}&page=${page}&offset=${offset}`,
    {
      timeout: 20000,
    }
  );

  const data = await response.json<{
    status: string;
    message: string;
    result: NftTransaction[];
  }>();

  if (data.status !== "1") {
    throw new Error(data.message);
  }

  return data;
};

const getTotalMintedNftByWallets = async () => {
  const data = await getAllNftTransactions({
    contractAddress: CONTRACT_ADDRESS,
  });

  const walletAddressToTransaction = data.result.reduce((acc, transaction) => {
    if (!acc[transaction.to]) {
      acc[transaction.to] = [];
    }

    acc[transaction.to].push(transaction);

    return acc;
  }, {} as Record<string, NftTransaction[]>);

  const totalMintedByWallets = Object.entries(
    walletAddressToTransaction
  ).reduce((acc, [walletAddress, transactions]) => {
    acc.push({
      walletAddress,
      totalMinted: transactions.length,
    });

    return acc;
  }, [] as { walletAddress: string; totalMinted: number }[]);

  totalMintedByWallets.sort((a, b) => b.totalMinted - a.totalMinted);

  return totalMintedByWallets;
};

export const revalidate = 300; // revalidate every 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || 24); // default limit
  const offset = Number(searchParams.get("offset") || 0); // default offset

  try {
    const totalMintedByWallets = await getTotalMintedNftByWallets();

    const limited = totalMintedByWallets.slice(0, 100);

    return NextResponse.json(limited.slice(offset, offset + limit));
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
