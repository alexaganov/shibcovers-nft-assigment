import copy from "copy-to-clipboard";
import { useCallback, useEffect, useState } from "react";

const useCopyToClipboard = ({ timeout }: { timeout?: number } = {}) => {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (value: string) => {
    const success = copy(value);

    if (success) {
      setCopiedValue(value);
      setIsCopied(true);
    } else {
      setCopiedValue(null);
      setIsCopied(false);
    }
  }, []);

  useEffect(() => {
    if (!timeout || timeout <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsCopied(false);
    }, timeout);

    return () => {
      clearInterval(timeoutId);
    };
  }, [isCopied, timeout]);

  return {
    isCopied,
    copiedValue,
    copyToClipboard,
  };
};

export default useCopyToClipboard;
