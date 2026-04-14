"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "@/navigation";
import { useVideoInfoStore } from "@/store/use-video-info-store";
import { getAll, remove, save } from "@/util/db";
import { formatDate } from "date-fns";
import { DeleteIcon, HistoryIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";

export interface HistoryProps {
  className?: string;
  disabled?: boolean;
}
export default function History({ className, disabled }: HistoryProps) {
  const t = useTranslations("history");

  const [updateAll] = useVideoInfoStore((state) => [state.updateAll]);
  const router = useRouter();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [history, setHistory] = useState<any[]>([]);
  return (
    <>
      <DropdownMenu
        onOpenChange={async (open) => {
          if (open) {
            const data = await getAll();
            setHistory(data);
          }
        }}
      >
        <DropdownMenuTrigger asChild={true} disabled={disabled}>
          <Button aria-label="show history" variant="icon" size="roundIconLg" className={cn(className)}>
            <HistoryIcon className="" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent aria-describedby={undefined} className="max-w-sm h-72 overflow-y-auto">
          {history.map((item) => {
            return (
              <DropdownMenuItem
                key={item.id}
                className="flex items-center gap-1 cursor-pointer"
                onClick={async () => {
                  updateAll({ ...item, updatedAt: Date.now() });
                  await save(useVideoInfoStore.getState());
                  toast.success(t("restored"));
                }}
              >
                <span className="line-clamp-1 flex-1">{item.title}</span>
                <span className="flex-shrink-0 text-gray-500">{formatDate(item.updatedAt, "MM-dd HH:mm")}</span>
                <Button
                  aria-label="remove history"
                  variant="icon"
                  size="roundIconSm"
                  className="hover:text-red-500"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await remove(item.id);
                    setHistory(history.filter((i) => i.id !== item.id));
                    toast.success(t("removed"));
                  }}
                >
                  <DeleteIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
