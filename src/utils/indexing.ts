import { connectDatabase } from "@/lib/db";
import { ContractMetaModel, ContractMetaType } from "@/models/contractMeta";
import { getHolderModel, HolderType } from "@/models/holders";
import { AnyBulkWriteOperation } from "mongoose";
import { Address, createPublicClient, http, zeroAddress } from "viem";
import { shibarium } from "viem/chains";

const client = createPublicClient({
  chain: shibarium,
  transport: http(shibarium.rpcUrls.default.http[0]),
});

const transferEventAbi = {
  anonymous: false,
  inputs: [
    { indexed: true, name: "from", type: "address" },
    { indexed: true, name: "to", type: "address" },
    { indexed: true, name: "tokenId", type: "uint256" },
  ],
  name: "Transfer",
  type: "event",
} as const;

const getContractDetails = async ({
  contractAddress,
  staleThresholdInMs = 1000 * 60 * 10, // 10 min
  contractDeployBlockNumber,
}: {
  contractAddress: string;
  contractDeployBlockNumber: bigint;
  staleThresholdInMs?: number;
}): Promise<{ meta: ContractMetaType; isIndexing: boolean } | null> => {
  const lowerAddress = contractAddress.toLowerCase();

  // Step 1: Ensure the document exists. Create it if not.
  let meta = await ContractMetaModel.findOne({ contractAddress: lowerAddress });

  if (!meta) {
    const lastIndexedBlockNumber =
      contractDeployBlockNumber === BigInt(0)
        ? contractDeployBlockNumber
        : contractDeployBlockNumber - BigInt(1);

    meta = await ContractMetaModel.create({
      contractAddress: lowerAddress,
      lastIndexedBlock: lastIndexedBlockNumber.toString(),
      isProcessing: false,
      startedProcessingAt: new Date(0),
    });
  }

  const now = new Date();
  const staleThresholdDate = new Date(now.getTime() - staleThresholdInMs);

  // Step 2: Try to acquire the lock atomically.
  const updatedMeta = await ContractMetaModel.findOneAndUpdate(
    {
      contractAddress: lowerAddress,
      $or: [
        { isProcessing: false },
        { startedProcessingAt: { $lt: staleThresholdDate } },
      ],
    },
    {
      $set: { isProcessing: true, startedProcessingAt: now },
    },
    { new: true }
  );

  if (updatedMeta) {
    return { meta: updatedMeta, isIndexing: false };
  }

  return { meta, isIndexing: true };
};

const updateHolders = async ({
  data,
  contractAddress,
  indexedBlock,
}: {
  contractAddress: Address;
  indexedBlock: bigint;
  data: Record<
    string,
    {
      tokenId: bigint;
    }[]
  >;
}) => {
  const normalizedContractAddress = contractAddress.toLocaleLowerCase();

  const HolderModel = getHolderModel(normalizedContractAddress as Address);

  const bulkWriteOperations = Object.entries(data).map(
    ([walletAddress, tokens]) => {
      const operation: AnyBulkWriteOperation<HolderType> = {
        updateOne: {
          filter: { walletAddress: walletAddress },
          update: {
            $addToSet: {
              tokens: {
                $each: tokens.map((token) => ({
                  tokenId: token.tokenId.toString(),
                })),
              },
            },
            $setOnInsert: { walletAddress },
          },
          upsert: true,
        },
      };

      return operation;
    }
  );

  await HolderModel.bulkWrite(bulkWriteOperations);

  await ContractMetaModel.findOneAndUpdate(
    {
      contractAddress: normalizedContractAddress,
    },
    {
      lastIndexedBlock: indexedBlock.toString(),
    },
    {
      upsert: true,
    }
  );
};

export const indexMintedNfts = async ({
  blockChunkSize = BigInt(100_000),
  minBlockAmount = 1_000,
  contractAddress,
  contractDeployBlockNumber,
}: {
  blockChunkSize?: bigint;
  minBlockAmount?: number;
  contractAddress: Address;
  contractDeployBlockNumber: bigint;
}) => {
  await connectDatabase();

  const normalizedContractAddress =
    contractAddress.toLocaleLowerCase() as Address;

  const contractDetails = await getContractDetails({
    contractAddress: normalizedContractAddress,
    contractDeployBlockNumber,
  });

  if (!contractDetails) {
    throw new Error("Couldn't get contract details");
  }

  if (contractDetails.isIndexing) {
    console.log("Indexing already in progress or lock is stale. Exiting.");
    return;
  }

  const latestBlockNumber = await client.getBlockNumber();

  let indexedBlock = BigInt(contractDetails.meta.lastIndexedBlock);

  if (indexedBlock >= latestBlockNumber) {
    return;
  }

  const availableBlockCount = latestBlockNumber - indexedBlock;

  if (availableBlockCount < minBlockAmount) {
    return;
  }

  try {
    while (indexedBlock < latestBlockNumber) {
      const fromBlock = indexedBlock + BigInt(1);
      let toBlock = fromBlock + blockChunkSize;

      if (toBlock >= latestBlockNumber) {
        toBlock = latestBlockNumber;
      }

      console.log(`Indexing minted NFTs from block ${fromBlock} to ${toBlock}`);

      try {
        const logs = await client.getLogs({
          address: normalizedContractAddress,
          event: transferEventAbi,
          args: { from: zeroAddress },
          fromBlock,
          toBlock,
        });

        console.log(`Found ${logs.length} minted NFTs`);

        if (logs.length > 0) {
          const walletToMintedTokenIds = logs.reduce(
            (acc, log) => {
              const { to: walletAddress, tokenId } = log.args;

              if (!walletAddress || !tokenId || log.blockNumber === null) {
                return acc;
              }

              const normalizedWalletAddress = walletAddress.toLowerCase();

              if (!acc[normalizedWalletAddress]) {
                acc[normalizedWalletAddress] = [];
              }

              acc[normalizedWalletAddress].push({
                tokenId,
              });

              return acc;
            },
            {} as Record<
              string,
              {
                tokenId: bigint;
              }[]
            >
          );

          await updateHolders({
            contractAddress: normalizedContractAddress,
            data: walletToMintedTokenIds,
            indexedBlock: toBlock,
          });
        }
      } catch (error) {
        console.error("Error fetching mint transactions:", error);

        break;
      }

      indexedBlock = toBlock;
    }
  } catch (error) {
    console.error("Error during NFT indexing:", error);
  } finally {
    await ContractMetaModel.updateOne(
      { contractAddress: normalizedContractAddress },
      { $set: { isProcessing: false } }
    );
  }
};
