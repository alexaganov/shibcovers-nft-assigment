import getQueryClient from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { HomePage } from "./HomePage";
import { getTopNftHoldersInfiniteQueryOptions } from "@/hooks/useTopNftHoldersInfiniteQuery";

export const HydratedHomePage = async () => {
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery(
    getTopNftHoldersInfiniteQueryOptions()
  );
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <HomePage />
    </HydrationBoundary>
  );
};
