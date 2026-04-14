"use client";
import { useErrorToast } from "@/hook/use-error-toast";
import { useErrorStore } from "@/store/use-error-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export const ErrorHandler = () => {
  const { errorCode, clearErrorCode } = useErrorStore();
  const { toastError } = useErrorToast(useTranslations("errors"));

  useEffect(() => {
    if (errorCode) {
      toastError(errorCode);
      clearErrorCode();
    }
  }, [errorCode, clearErrorCode, toastError]);

  return null;
};
