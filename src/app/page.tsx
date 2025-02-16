"use client";
import InfiniteQueryState from "@/components/InfiniteQueryState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { useTopNftHoldersInfiniteQuery } from "@/hooks/useTopNftHoldersInfiniteQuery";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

const WalletDetailsCard = ({
  data,
}: {
  data: {
    position: number;
    walletAddress: string;
    totalMinted: number;
  };
}) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 800 });
  const CopyIcon = isCopied ? Check : Copy;

  const { walletAddress, position, totalMinted } = data;

  return (
    <Card>
      <CardHeader>
        <p className="text-center text-muted-foreground text-sm mb-2">
          #{position}
        </p>
        <Jazzicon
          paperStyles={{ margin: "auto" }}
          diameter={80}
          seed={jsNumberForAddress(walletAddress)}
        />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center mb-1">
          Total minted: <span className="font-semibold">{totalMinted}</span>
        </p>
        <div className="flex gap-1 overflow-hidden items-center">
          <p className="flex min-w-0">
            <span className="truncate flex-1 min-w-0">{walletAddress}</span>
          </p>
          <Button
            className={cn("flex-shrink-0", {
              "!text-green-500": isCopied,
            })}
            onClick={() => copyToClipboard(walletAddress)}
            variant="outline"
            size="icon"
          >
            <CopyIcon />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ITEMS_PER_PAGE = 24;

export default function Home() {
  const infiniteQuery = useTopNftHoldersInfiniteQuery({
    limit: ITEMS_PER_PAGE,
  });
  const allData = infiniteQuery.data?.pages.flatMap((page) => page);

  const layoutClassName =
    "grid gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-6";

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
        <ul className={layoutClassName}>
          {allData?.map((item, index) => {
            return (
              <li key={item.walletAddress}>
                <WalletDetailsCard
                  data={{
                    ...item,
                    position: index + 1,
                  }}
                />
              </li>
            );
          })}
        </ul>

        <InfiniteQueryState
          loading={
            <div className={layoutClassName}>
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => {
                return <Skeleton key={index} className="h-[13.375rem]" />;
              })}
            </div>
          }
          query={infiniteQuery}
        />
      </div>
    </div>
  );
}
