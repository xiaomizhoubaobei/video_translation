"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { forwardRef } from "react";

interface FooterProps {
  className?: string;
}

export const Footer = forwardRef<HTMLDivElement, FooterProps>(({ className }, ref) => {
  const t = useTranslations("footer");

  const region = process.env.NEXT_PUBLIC_REGION;

  return (
    <footer
      className={cn("flex flex-col items-center justify-center", className)}
      style={{ color: "rgb(102, 102, 102)", fontSize: "12px" }}
      ref={ref}
    >
      <div>{t("ai")}</div>
      <div className="flex items-center justify-center gap-1">
        Powered By
        <a href={region ? "https://302.ai/" : "https://302ai.cn/"} rel="noreferrer" target="_blank">
          <img
            alt="gpt302"
            className="object-contain"
            src="https://file.302.ai/gpt/imgs/91f7b86c2cf921f61e8cf9dc7b1ec5ee.png"
            width="55"
          />
        </a>
      </div>
    </footer>
  );
});
