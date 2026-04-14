import { Link } from "@/navigation";
import type { UseTranslationsReturnType } from "@/type/type";
import { type ReactNode, useCallback } from "react";
import { ErrorIcon, toast } from "react-hot-toast";

export function useErrorToast(t: UseTranslationsReturnType) {
  const region = process.env.NEXT_PUBLIC_REGION;

  const relogin = useCallback(
    (chunks: ReactNode) => (
      <Link href="/auth" className="underline" style={{ color: "#0070f0" }} target="_blank">
        {chunks}
      </Link>
    ),
    [],
  );

  const gw = useCallback(
    (chunks: ReactNode) => (
      <Link
        href={region ? "https://302.ai/" : "https://302ai.cn/"}
        className="underline"
        style={{ color: "#0070f0" }}
        target="_blank"
        rel="noreferrer"
      >
        {chunks}
      </Link>
    ),
    [region],
  );

  const toastError = useCallback(
    (errorCode: number | string) => {
      const message = t.rich(errorCode.toString(), {
        relogin,
        gw,
      });

      toast(
        () => (
          <div className="flex items-center gap-2">
            <div>
              <ErrorIcon />
            </div>
            <div>{message}</div>
          </div>
        ),
        {
          id: errorCode.toString(),
        },
      );
    },
    [t, gw, relogin],
  );

  return { toastError };
}
