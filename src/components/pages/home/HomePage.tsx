"use client";

import InfiniteQueryState from "@/components/common/InfiniteQueryState";
import { NftHolderCard } from "@/components/common/NftHolderCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopNftHoldersInfiniteQuery } from "@/hooks/useTopNftHoldersInfiniteQuery";

const ITEMS_PER_LOAD = 30;
const TOTAL_ITEMS = 100;

export const HomePage = () => {
  const infiniteQuery = useTopNftHoldersInfiniteQuery({
    limit: ITEMS_PER_LOAD,
    max: TOTAL_ITEMS,
  });
  const allData = infiniteQuery.data?.pages.flatMap((page) => page);

  const totalSkeletonCards = Math.min(
    TOTAL_ITEMS - (allData?.length ?? 0),
    ITEMS_PER_LOAD
  );

  const gridLayoutClassName =
    "grid gap-4 grid-cols-1 min-[480px]:grid-cols-3 lg:grid-cols-6";

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
        {!!allData?.length && (
          <ul className={gridLayoutClassName}>
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
        )}

        <InfiniteQueryState
          loading={
            <div className={gridLayoutClassName}>
              {Array.from({ length: totalSkeletonCards }, (_, i) => {
                return <Skeleton key={i} className="h-[116px] rounded-xl" />;
              })}
            </div>
          }
          query={infiniteQuery}
        />
      </div>
    </div>
  );
};
