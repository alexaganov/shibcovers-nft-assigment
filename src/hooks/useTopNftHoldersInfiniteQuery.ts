import { useInfiniteQuery } from "@tanstack/react-query";
import ky from "ky";

export const useTopNftHoldersInfiniteQuery = ({
  limit = 24,
  options,
}: {
  limit?: number;
  options?: { enabled?: boolean };
} = {}) => {
  return useInfiniteQuery({
    queryKey: ["topNftHolders", limit],
    queryFn: ({ pageParam: offset = 0 }) => {
      return ky
        .get(`/api/top-holders`, {
          searchParams: {
            offset,
            limit,
          },
        })
        .json<
          {
            walletAddress: string;
            totalMinted: number;
          }[]
        >();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages = []) =>
      lastPage.length === limit ? pages.length * limit : undefined,
    ...options,
  });
};
