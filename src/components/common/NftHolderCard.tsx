"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { TopNftHolder } from "@/hooks/useTopNftHoldersInfiniteQuery";
import { cn } from "@/lib/utils";
import { Check, Copy, ExternalLink } from "lucide-react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getExplorerUrl } from "@/utils/web3";
import { shibarium } from "viem/chains";
import { Hash } from "viem";
import { Button } from "../ui/button";

export const NftHolderCard = ({
  data,
}: {
  data: {
    holder: TopNftHolder;
    position: number;
  };
}) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 800 });
  const CopyIcon = isCopied ? Check : Copy;

  const { holder, position } = data;

  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex w-full justify-between gap-1">
          <Badge variant="secondary">#{position}</Badge>

          <div className="flex gap-1">
            <Button size="icon-xs" variant="outline" asChild>
              <a
                target="_blank"
                href={getExplorerUrl({
                  hash: holder.walletAddress as Hash,
                  chain: shibarium,
                  type: "address",
                })}
              >
                <ExternalLink />
              </a>
            </Button>
            <Button
              size="icon-xs"
              variant="outline"
              className={cn("flex-shrink-0", {
                "!text-green-500": isCopied,
              })}
              onClick={() => copyToClipboard(holder.walletAddress)}
            >
              <CopyIcon />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex-1 items-center overflow-hidden flex text-sm gap-1">
            <div className="rounded-full shadow flex items-center justify-center border">
              <Jazzicon
                diameter={22}
                seed={jsNumberForAddress(holder.walletAddress)}
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="flex flex-1 min-w-0">
                    <span className="truncate flex-1 min-w-0">
                      {holder.walletAddress}
                    </span>
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{holder.walletAddress}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Badge variant="secondary" className="flex-1 w-full justify-center">
          <span>
            {holder.tokenCount} <span className="font-normal">Minted</span>
          </span>
        </Badge>
      </CardHeader>
    </Card>
  );
};
