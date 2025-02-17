import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_DEPLOYMENT_BLOCK } from "@/config";
import { getHolderModel } from "@/models/holders";
import { indexMintedNfts } from "@/utils/indexing";
import { NextResponse } from "next/server";

if (!NFT_CONTRACT_ADDRESS) {
  throw new Error("Invalid contract address");
}

if (!NFT_CONTRACT_DEPLOYMENT_BLOCK) {
  throw new Error("Invalid contract deployment block number");
}

export async function GET(request: Request) {
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
