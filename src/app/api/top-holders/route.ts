import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_DEPLOYMENT_BLOCK } from "@/config";
import { connectDatabase } from "@/lib/db";
import { getHolderModel } from "@/models/holders";
import { getErrorMessage } from "@/utils/error";
import { indexMintedNfts } from "@/utils/indexing";
import { NextResponse } from "next/server";

if (!NFT_CONTRACT_ADDRESS) {
  throw new Error("Invalid contract address");
}

if (!NFT_CONTRACT_DEPLOYMENT_BLOCK) {
  throw new Error("Invalid contract deployment block number");
}

const MONGODB_URI = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

export async function GET(request: Request) {
  await connectDatabase({
    uri: MONGODB_URI,
  });

  await indexMintedNfts({
    contractAddress: NFT_CONTRACT_ADDRESS,
    contractDeployBlockNumber: NFT_CONTRACT_DEPLOYMENT_BLOCK,
  });

  const { searchParams } = new URL(request.url);

  const limit = Math.max(Number(searchParams.get("limit") || 24), 1);
  const offset = Math.max(Number(searchParams.get("offset") || 0), 0);

  try {
    const topHolders = await getHolderModel(NFT_CONTRACT_ADDRESS).aggregate([
      {
        $project: {
          walletAddress: 1,
          tokenCount: { $size: "$tokens" },
        },
      },
      { $sort: { tokenCount: -1, walletAddress: 1 } },
      { $limit: 100 },
      { $skip: offset },
      { $limit: limit },
    ]);

    return NextResponse.json(topHolders);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Internal server error", message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
