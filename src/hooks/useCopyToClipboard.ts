import { useState, useCallback } from 'react';

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;

/**
 * Copy text to clipboard with success state
 */
export function useCopyToClipboard(): [CopiedValue, CopyFn, boolean] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const copy: CopyFn = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setHasCopied(true);

      // Reset after 2 seconds
      setTimeout(() => setHasCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopiedText(null);
      setHasCopied(false);
      return false;
    }
  }, []);

  return [copiedText, copy, hasCopied];
}

export default useCopyToClipboard;
