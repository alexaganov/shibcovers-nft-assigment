import { HOST } from "@/config";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import ky from "ky";

export interface TopNftHolder {
  tokenCount: number;
  walletAddress: string;
}

export const getTopNftHoldersInfiniteQueryOptions = ({
  limit = 30,
}: { limit?: number } = {}) => {
  return infiniteQueryOptions({
    queryKey: ["topNftHolders", limit],
    queryFn: ({ pageParam: offset = 0 }) => {
      return ky
        .get(`${HOST}/api/top-holders`, {
          searchParams: {
            offset,
            limit,
          },
          timeout: false,
        })
        .json<TopNftHolder[]>();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages = []) =>
      lastPage.length === limit ? pages.length * limit : undefined,
  });
};

export const useTopNftHoldersInfiniteQuery = () => {
  return useInfiniteQuery(getTopNftHoldersInfiniteQueryOptions());
};
