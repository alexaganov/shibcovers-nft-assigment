"use client";

import InfiniteQueryState from "@/components/common/InfiniteQueryState";
import { NftHolderCard } from "@/components/common/NftHolderCard";
import { useTopNftHoldersInfiniteQuery } from "@/hooks/useTopNftHoldersInfiniteQuery";

export const HomePage = () => {
  const infiniteQuery = useTopNftHoldersInfiniteQuery();
  const allData = infiniteQuery.data?.pages.flatMap((page) => page);

  return (
    <div className="w-full max-w-7xl mx-auto py-20 p-4">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Top 100 NFT Holders
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        A dashboard showcasing the leading 100 wallets,
        <br />
        ordered by the number of NFTs minted.
      </p>

      <div className="flex flex-col gap-4">
        <ul className="grid gap-4 grid-cols-1 min-[480px]:grid-cols-3 lg:grid-cols-6">
          {allData?.map((item, index) => {
            return (
              <li key={item.walletAddress}>
                <NftHolderCard
                  data={{
                    holder: item,
                    position: index + 1,
                  }}
                />
              </li>
            );
          })}
        </ul>

        <InfiniteQueryState query={infiniteQuery} />
      </div>
    </div>
  );
};
