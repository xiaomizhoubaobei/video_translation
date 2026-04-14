"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "@/navigation";
import { LanguagesIcon } from "lucide-react";
import { useLocale } from "next-intl";
const languages = [
  { key: "zh", label: "中文" },
  { key: "en", label: "English" },
  { key: "ja", label: "日本語" },
  { key: "de", label: "Deutsch" },
  { key: "fr", label: "Français" },
  { key: "ko", label: "한국어" },
];
export interface LanguageSwitchProps {
  className?: string;
}
export default function LanguageSwitch({ className }: LanguageSwitchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild={true}>
          <Button
            aria-label="Switch language"
            variant="icon"
            size="roundIconSm"
            className={cn(className)}
          >
            <LanguagesIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent aria-describedby={undefined}>
          {languages.map((language) => {
            return (
              <DropdownMenuItem
                key={language.key}
                onSelect={() => {
                 try {
                  router.push(`/${pathname}`, {locale: language.key as any});
                 } catch (e) {
                  console.error(e)
                 }
                }}
              >
                {language.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
