"use client";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Subtitle } from "@/store/use-video-info-store";
import React from "react";

export interface SubtitleItemProps {
  subtitle: Subtitle;
  onClick?: (startTime: number) => void;
  searchText?: string;
  className?: string;
}

export default function SubtitleItem({ subtitle, onClick, searchText = "", className }: SubtitleItemProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <Card className={cn("cursor-pointer shadow-none rounded-md hover:border-primary", className)}>
      <CardContent
        className="overflow-hidden hover:border-primary-400 p-2"
        onClick={() => onClick?.(subtitle.startTime)}
      >
        <div className="text-sm">
          <span className="mr-2 text-sky-400">{formatTime(subtitle.startTime)}</span>
          <span>{subtitle.text}</span>
        </div>
      </CardContent>
    </Card>
  );
}
