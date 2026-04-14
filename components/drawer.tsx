import SubtitleItem from "@/components/subtitle/item";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Subtitle, useVideoInfoStore } from "@/store/use-video-info-store";
import type { MediaPlayerInstance } from "@vidstack/react";
import ISO631 from "iso-639-1";
import { useTranslations } from "next-intl";
import { type RefObject, useCallback, useMemo, useRef, useState } from "react";
export const SubtitleDrawer = ({
  player,
}: {
  player: RefObject<MediaPlayerInstance>;
}) => {
  const t = useTranslations("drawer");
  const {
    title,
    displayLanguage,
    updateVideoInfo,
    translateLanguage,
    subtitles,
    originalSubtitles,
  } = useVideoInfoStore((state) => ({
    title: state.title,
    displayLanguage: state.displayLanguage,
    updateVideoInfo: state.updateAll,
    translateLanguage: state.language,
    subtitles: state.subtitles,
    originalSubtitles: state.originalSubtitles,
  }));
  const languages = useMemo(() => {
    return [
      { label: t("original"), value: "original" },
      translateLanguage
        ? {
            label: ISO631.getNativeName(translateLanguage),
            value: translateLanguage,
          }
        : null,
    ].filter(Boolean) as { label: string; value: string }[];
  }, [translateLanguage, t]);
  const setSelectedLanguage = useCallback(
    (value: string) => {
      updateVideoInfo({ displayLanguage: value });
    },
    [updateVideoInfo]
  );

  const displaySubtitles = useMemo(() => {
    if (displayLanguage === "original") {
      return originalSubtitles;
    }
    return subtitles;
  }, [subtitles, originalSubtitles, displayLanguage]);

  const subtitleTypes = [
    { label: "vtt", value: "vtt" },
    { label: "srt", value: "srt" },
    { label: "txt", value: "txt" },
  ];
  const [selectedSubtitleType, setSelectedSubtitleType] = useState(
    subtitleTypes[0].value
  );

  const ref = useRef<HTMLDivElement>(null);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const drawerInstance = useRef<any>(null);

  const formatVTT = useCallback((subtitles: Subtitle[]): string => {
    let content = "WEBVTT\n\n";
    for (const subtitle of subtitles) {
      const startTime = convertTimeToVTTFormat(subtitle.startTime);
      const endTime = convertTimeToVTTFormat(subtitle.end);
      content += `${startTime} --> ${endTime}\n${subtitle.text}\n\n`;
    }
    return content;
  }, []);

  const formatSRT = useCallback((subtitles: Subtitle[]): string => {
    return subtitles
      .map((subtitle, index) => {
        const startTime = convertTimeToSRTFormat(subtitle.startTime);
        const endTime = convertTimeToSRTFormat(subtitle.end);
        return `${index + 1}\n${startTime} --> ${endTime}\n${
          subtitle.text
        }\n\n`;
      })
      .join("");
  }, []);

  const formatText = useCallback((subtitles: Subtitle[]): string => {
    return subtitles.map((subtitle) => `${subtitle.text}\n\n`).join("");
  }, []);

  const convertTimeToVTTFormat = useCallback((time: number): string => {
    const date = new Date(time * 1000);
    return date.toISOString().substr(11, 12).replace(".", ",");
  }, []);

  const convertTimeToSRTFormat = useCallback((time: number): string => {
    const date = new Date(time * 1000);
    return date.toISOString().substr(11, 12).replace(".", ",");
  }, []);

  const handleDownload = useCallback(() => {
    const subtitles: Subtitle[] = displaySubtitles || [];
    let content = "";

    switch (selectedSubtitleType) {
      case "vtt":
        content = formatVTT(subtitles);
        break;
      case "srt":
        content = formatSRT(subtitles);
        break;
      case "txt":
        content = formatText(subtitles);
        break;
      default:
        throw new Error(`Unsupported subtitle type: ${selectedSubtitleType}`);
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.${selectedSubtitleType}`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSelectedSubtitleType(subtitleTypes[0].value);
  }, [selectedSubtitleType, formatSRT, formatText, formatVTT, title]);

  const closeDrawer = useCallback(() => {
    if (drawerInstance.current) {
      drawerInstance.current.hide();
    }
  }, []);

  const openDrawer = useCallback(async () => {
    if (!drawerInstance.current) {
      const { Drawer } = await import("flowbite");
      drawerInstance.current = new Drawer(ref.current, {}, {});
    }
    drawerInstance.current.show();
  }, []);

  function handleSeek(startTime: number) {
    console.log("startTime", startTime);
    if (player.current) {
      player.current.remoteControl.seek(startTime);
      closeDrawer();
    }
  }

  return (
    <>
      <div className="text-center">
        <Button type="button" onClick={openDrawer}>
          {t("subtitles")}
        </Button>
      </div>
      <div
        id="drawer-subtitles"
        ref={ref}
        className="fixed top-0 left-0 z-40 h-screen overflow-hidden transition-transform -translate-x-full bg-white w-80 dark:bg-gray-800"
        tabIndex={-1}
        aria-labelledby="drawer-label"
      >
        <div className="flex items-center justify-between p-2">
          <h5
            id="drawer-label"
            className="inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400"
          >
            <svg
              className="w-4 h-4 me-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            {t("subtitles")}
          </h5>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8  flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={closeDrawer}
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">{t("close")}</span>
          </button>
        </div>
        <div className="absolute top-[56px] left-0 right-0 z-10  w-full bg-white flex justify-between gap-2 border-b p-2 items-center">
          <Select onValueChange={setSelectedLanguage} value={displayLanguage}>
            <SelectTrigger className="flex-1 bg-white">
              <SelectValue placeholder={t("select_language")} />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="p-2 mt-[60px] mb-24 absolute overflow-y-auto h-[calc(100%-164px)] w-full">
          <div className="space-y-2">
            {displaySubtitles?.map((subtitle, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <SubtitleItem
                key={index}
                subtitle={subtitle}
                onClick={(startTime) => handleSeek(startTime)}
              />
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 w-full bg-white flex justify-between gap-2 border-t p-2 items-center">
          <Select
            onValueChange={setSelectedSubtitleType}
            value={selectedSubtitleType}
          >
            <SelectTrigger className="flex-1 bg-white">
              <SelectValue placeholder={t("select_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {subtitleTypes.map((subtitleType) => (
                <SelectItem key={subtitleType.value} value={subtitleType.value}>
                  {subtitleType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleDownload}>{t("download_subtitle")}</Button>
        </div>
      </div>
    </>
  );
};
