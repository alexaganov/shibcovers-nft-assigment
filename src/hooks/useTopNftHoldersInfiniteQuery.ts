import { HOST } from "@/config";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import ky from "ky";

export interface TopNftHolder {
  tokenCount: number;
  walletAddress: string;
}

interface GetTopNftHoldersInfiniteQueryOptionsParams {
  limit: number;
  max: number;
}

export const getTopNftHoldersInfiniteQueryOptions = ({
  limit = 30,
  max = 100,
}: Partial<GetTopNftHoldersInfiniteQueryOptionsParams> = {}) => {
  const actualLimit = Math.min(limit, max);

  return infiniteQueryOptions({
    queryKey: ["topNftHolders", actualLimit],
    queryFn: ({ pageParam }) => {
      return ky
        .get(`${HOST}/api/top-holders`, {
          next: {
            revalidate: 60,
          },
          searchParams: pageParam,
          // disable timeout because on first time call indexing can take some time
          timeout: false,
        })
        .json<TopNftHolder[]>();
    },
    initialPageParam: {
      limit: Math.min(limit, max),
      offset: 0,
    },
    getNextPageParam: (lastPage, pages) => {
      // last page
      if (lastPage.length !== limit) {
        return undefined;
      }

      const totalItems = pages.reduce((acc, curr) => acc + curr.length, 0);

      // all items loaded
      if (totalItems >= max) {
        return undefined;
      }

      return {
        limit: Math.min(limit, max - totalItems),
        offset: totalItems,
      };
    },
  });
};

export const useTopNftHoldersInfiniteQuery = (
  params: Partial<GetTopNftHoldersInfiniteQueryOptionsParams> = {}
) => {
  return useInfiniteQuery(getTopNftHoldersInfiniteQueryOptions(params));
};
