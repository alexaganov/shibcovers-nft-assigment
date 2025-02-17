import React, { ReactNode } from "react";
import { useInView } from "react-intersection-observer";

import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { getErrorMessage } from "@/utils/error";
import { Button } from "../ui/button";

interface InfiniteQueryStateProps {
  isEmpty?: boolean;
  query: UseInfiniteQueryResult<InfiniteData<unknown, unknown>, unknown>;
  loading?: ReactNode;
  className?: string;
  triggerClassName?: string;
  empty?: ReactNode;
}

const InfiniteQueryState = ({
  query,
  triggerClassName,
  empty,
  isEmpty = !query.data?.pages.length,
  loading,
  className,
}: InfiniteQueryStateProps) => {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    error,
    refetch,
    hasNextPage,
    isError,
  } = query;
  const { ref } = useInView({
    onChange: (inView) =>
      inView &&
      !isError &&
      !isLoading &&
      !isFetchingNextPage &&
      fetchNextPage(),
  });

  const showLoader = !isError && (isLoading || hasNextPage);
  const showEmpty = !isLoading && !isError && isEmpty;
  const showError = !isLoading && isError;
  const showAllLoaded = !isError && !isLoading && !isEmpty && !hasNextPage;

  const handleTryAgainButtonClick = () => {
    if (isEmpty) {
      refetch();
    } else {
      fetchNextPage();
    }
  };

  if (!showLoader && !showEmpty && !showEmpty && !showAllLoaded) {
    return null;
  }

  return (
    <div className={cn("flex flex-col flex-1", className)}>
      {showLoader && (
        // Key is added to trigger in view cb again if component is already in view
        <div ref={ref} key={data?.pages.length} className={triggerClassName}>
          {loading || <Loader2 className="m-auto size-9 animate-spin" />}
        </div>
      )}

      {showAllLoaded && (
        <p className="m-auto text-center text-muted-foreground">All Loaded!</p>
      )}

      {showEmpty &&
        (empty || (
          <p className="m-auto text-center text-muted-foreground">Empty</p>
        ))}

      {showError && (
        <div className="flex flex-col gap-3 m-auto">
          <p className="text-center">
            Something went wrong:
            <br />
            {getErrorMessage(error)}
          </p>
          <Button className="mx-auto" onClick={handleTryAgainButtonClick}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default InfiniteQueryState;
