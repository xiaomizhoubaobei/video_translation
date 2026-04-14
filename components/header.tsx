"use client";
import { transcript, TranscriptResult, translate } from "@/api/transcript";
import { getRealUrlForVideo } from "@/app/actions/video";
import { getRealUrlForDouyin } from "@/app/actions/video/douyin";
import { getRealUrlForTiktok } from "@/app/actions/video/tiktok";
import { getRealUrlForYoutube } from "@/app/actions/video/youtube";
import History from "@/components/history";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Subtitle, useVideoInfoStore } from "@/store/use-video-info-store";
import { save } from "@/util/db";
import { useLogger } from "@/util/logger";
import { detectUrl } from "@/util/url-util";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  type Dispatch,
  type SetStateAction,
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

const languages = [
  { key: "zh", label: "中文" },
  { key: "en", label: "English" },
  { key: "ja", label: "日本語" },
  { key: "de", label: "Deutsch" },
  { key: "fr", label: "Français" },
  { key: "ko", label: "한국어" },
];

interface HeaderProps {
  className?: string;
  isSubmitting?: boolean;
  hiddenActions?: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
}

export const Header = forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, isSubmitting, hiddenActions, setIsSubmitting }, ref) => {
    const t = useTranslations("header");
    const logger = useLogger("header");
    const [originalVideoUrl, realVideoUrl, updateVideoInfo, refresh] =
      useVideoInfoStore((state) => [
        state.originalVideoUrl,
        state.realVideoUrl,
        state.updateAll,
        state.refresh,
      ]);

    const [language, setLanguage] = useState(languages[0].key);
    const [url, setUrl] = useState<string | undefined>(originalVideoUrl);

    useEffect(() => {
      console.log("originalVideoUrl", originalVideoUrl);
      setUrl(originalVideoUrl);
    }, [originalVideoUrl]);

    const onSubmit = useCallback(async () => {
      setIsSubmitting(true);

      try {
        const lang = languages.find((lang) => lang.key === language)
          ?.key as string;
        logger.debug(`language: ${lang}, url: ${url}`);
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        let detectedUrl = detectUrl(url!);
        let originUrl = detectedUrl;
        if (!detectedUrl) {
          toast.error(t("error.invalid_url"));

          return;
        }

        refresh();

        let tmpUrl = detectedUrl;
        let title = "";
        let isDouyin = false;
        let isTiktok = false;
        let isYoutube = false;
        if (
          detectedUrl.includes("douyin") &&
          !detectedUrl.endsWith(".mp3") &&
          !detectedUrl.includes("mime_type=video_mp4")
        ) {
          try {
            const resp = await getRealUrlForDouyin(
              detectedUrl!,
              process.env.NEXT_PUBLIC_API_KEY!
            );
            if (!resp) {
              toast.error(t("error.get_real_url_failed"));
              setIsSubmitting(false);
              return;
            }
            tmpUrl =
              resp.data.aweme_details.at(0)?.music.play_url.url_list.at(0) ||
              "";
            detectedUrl =
              resp.data.aweme_details.at(0)?.video.play_addr.url_list.at(0) ||
              "";
            title = resp.data.aweme_details.at(0)?.share_info.share_title || "";
            isDouyin = true;
          } catch (e) {
            logger.error(t("error.get_real_url_failed"));
            toast.error(t("error.get_real_url_failed"));
            setIsSubmitting(false);
            return;
          }
        } else if (
          detectedUrl.includes("tiktok") &&
          !detectedUrl.endsWith(".mp3") &&
          !detectedUrl.includes("mime_type=video_mp4")
        ) {
          try {
            const resp = await getRealUrlForTiktok(
              detectedUrl!,
              process.env.NEXT_PUBLIC_API_KEY!
            );
            if (!resp) {
              toast.error(t("error.get_real_url_failed"));
              setIsSubmitting(false);
              return;
            }
            tmpUrl =
              resp.data.aweme_details.at(0)?.music.play_url.url_list.at(0) ||
              "";
            detectedUrl =
              resp.data.aweme_details.at(0)?.video.play_addr.url_list.at(0) ||
              "";
            title = resp.data.aweme_details.at(0)?.share_info.share_title || "";
            isTiktok = true;
          } catch (e) {
            logger.error(t("error.get_real_url_failed"));
            toast.error(t("error.get_real_url_failed"));
            setIsSubmitting(false);
            return;
          }
        } else if (detectedUrl.includes("youtube.com")) {
          try {
            const params = new URLSearchParams(detectedUrl.split("?")[1]);
            const id = params.get("v");
            if (!id) {
              toast.error(t("error.invalid_youtube_url"));
              setIsSubmitting(false);
              return;
            }
            let resp: any;
            try {
              resp = await getRealUrlForYoutube(
                id,
                process.env.NEXT_PUBLIC_API_KEY!
              );
            } catch (e) {
              logger.error(t("error.get_real_url_failed"));
            }

            if (!resp) {
              detectedUrl = `https://www.youtube.com/watch?v=${id}`;
              title = "";
              isYoutube = true;
            } else {
              detectedUrl = resp.data.formats[0].url;
              title = resp.data.title;
              isYoutube = true;
            }
          } catch (e) {
            logger.error(t("error.get_real_url_failed"));
          }
        }

        let data: TranscriptResult | null = null;
        try {
          data = await transcript(t, tmpUrl);

          if (!data) {
            toast.error(t("error.transcript_failed"));
            setIsSubmitting(false);
            return;
          }
        } catch (e) {
          toast.error(t("error.transcript_failed"));
          setIsSubmitting(false);
          return;
        }

        toast.success(t("success.transcript"));

        let translatedSubtitles: Subtitle[] | undefined;
        try {
          translatedSubtitles = await translate(
            t,
            data.detail.subtitlesArray,
            lang
          );
        } catch (e) {
          toast.error(t("error.translate_failed"));
          setIsSubmitting(false);
          return;
        }

        if (!translatedSubtitles) {
          toast.error(t("error.translate_failed"));
          setIsSubmitting(false);
          return;
        }

        updateVideoInfo({
          id: data.detail.id || Date.now().toString(),
          title: data.detail.title,
          videoType: data.detail.type,
          poster: data.detail.cover,
          language: lang,
          displayLanguage: lang,
          originalSubtitles: data.detail.subtitlesArray,
          originalVideoUrl: originUrl!,
        });
        logger.debug(data);

        if (data.detail.type === "bilibili") {
          const url = await getRealUrlForVideo("bilibili", data.detail.id);
          if (!url) {
            toast.error(t("error.get_real_url_failed"));
            setIsSubmitting(false);
            return;
          }
          updateVideoInfo({ realVideoUrl: url });
        } else if (data.detail.url.includes("xiaohongshu")) {
          const url = await getRealUrlForVideo(
            "xiaohongshu",
            data.detail.id,
            process.env.NEXT_PUBLIC_API_KEY!
          );
          if (!url) {
            toast.error(t("error.get_real_url_failed"));
            setIsSubmitting(false);
            return;
          }
          updateVideoInfo({
            videoType: "xiaohongshu",
            realVideoUrl: url,
            title: data.detail.descriptionText,
          });
        } else if (isDouyin) {
          updateVideoInfo({
            videoType: "douyin",
            title: title,
            realVideoUrl: detectedUrl || "",
          });
        } else if (isTiktok) {
          updateVideoInfo({
            id: originUrl!,
            videoType: "tiktok",
            title: title,
            realVideoUrl: detectedUrl || "",
          });
        } else if (isYoutube) {
          updateVideoInfo({
            realVideoUrl: detectedUrl || "",
          });
        } else {
          updateVideoInfo({ realVideoUrl: data.detail.url });
        }

        updateVideoInfo({ subtitles: translatedSubtitles });
        logger.debug(translatedSubtitles);

        console.log("save", useVideoInfoStore.getState());

        await save(useVideoInfoStore.getState());

        toast.success(t("success.translate"));
        setIsSubmitting(false);
      } finally {
        setIsSubmitting(false);
      }
    }, [setIsSubmitting, t, url, language, logger, updateVideoInfo, refresh]);
    const showBrand = process.env.NEXT_PUBLIC_SHOW_BRAND === "true";

    return (
      <header
        className={cn(
          "flex flex-col items-center justify-center space-y-4 container",
          className
        )}
        ref={ref}
      >
        <div className="flex items-center space-x-4">
          {showBrand && (
            <Image
              alt="302"
              className="size-10 object-contain"
              src="https://file.302.ai/gpt/imgs/5b36b96aaa052387fb3ccec2a063fe1e.png"
              width={300}
              height={300}
            />
          )}
          <h1 className="text-3xl font-bold">{t("title")}</h1>
        </div>

        <div className="flex md:flex-row flex-col w-full items-center justify-center gap-2 text-xs sm:gap-4">
          <Select
            disabled={isSubmitting}
            value={language}
            onValueChange={setLanguage}
          >
            <SelectTrigger
              className={cn("md:w-[100px] bg-white", hiddenActions && "hidden")}
            >
              <SelectValue placeholder={t("language_select_placeholder")} />
            </SelectTrigger>
            <SelectContent className="md:w-[100px] min-w-0">
              {languages.map((language) => (
                <SelectItem
                  className="md:w-[96px]"
                  key={language.key}
                  value={language.key}
                >
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="flex-grow sm:w-[36rem] sm:flex-grow-0 bg-white"
            color="primary"
            placeholder={t("src_input_placeholder")}
            disabled={isSubmitting || hiddenActions}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <Button
              disabled={isSubmitting || hiddenActions}
              onClick={onSubmit}
              className={cn(hiddenActions && "hidden")}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Spinner className="text-white size-4" />{" "}
                  <span>{t("start_button_loading")}</span>
                </div>
              ) : (
                t("start_button")
              )}
            </Button>

            <History
              disabled={isSubmitting || hiddenActions}
              className={cn(hiddenActions && "hidden")}
            />
          </div>
        </div>
      </header>
    );
  }
);

Header.displayName = "Header";
