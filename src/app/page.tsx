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
    walletAddress: string;
    totalMinted: number;
  };
}) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 800 });
  const CopyIcon = isCopied ? Check : Copy;

  return (
    <Card>
      <CardHeader className="items-center">
        <Jazzicon diameter={80} seed={jsNumberForAddress(data.walletAddress)} />
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 overflow-hidden items-center">
          <p className="flex flex-1 min-w-0">
            <span className="truncate flex-1 min-w-0">
              {data.walletAddress}
            </span>
          </p>
          <Button
            className={cn("flex-shrink-0", {
              "!text-green-500": isCopied,
            })}
            onClick={() => copyToClipboard(data.walletAddress)}
            variant="outline"
            size="icon"
          >
            <CopyIcon />
          </Button>
        </div>
        <p className="text-muted-foreground text-center">
          Total minted:{" "}
          <span className="font-semibold">{data.totalMinted}</span>
        </p>
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
          {allData?.map((item) => {
            return (
              <li key={item.walletAddress}>
                <WalletDetailsCard data={item} />
              </li>
            );
          })}
        </ul>

        <InfiniteQueryState
          loading={
            <div className={layoutClassName}>
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => {
                return <Skeleton key={index} className="h-[214]" />;
              })}
            </div>
          }
          query={infiniteQuery}
        />
      </div>
    </div>
  );
}
