"use client";
import { SubtitleDrawer } from "@/components/drawer";
import EmptyCard from "@/components/empty-card";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import LanguageSwitch from "@/components/language-switch";
import { VideoPlayer } from "@/components/video/player";
import { cn } from "@/lib/utils";
import { useVideoInfoStore } from "@/store/use-video-info-store";
import type { MediaPlayerInstance } from "@vidstack/react";
import ky from "ky";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTitle } from "react-use";
import { useComponentSize } from "react-use-size";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

export default function Home() {
  const locale = useLocale();
  const t = useTranslations("home");

  const [title, poster, originalVideoUrl, realVideoUrl, videoType, id, language, subtitles, displayLanguage, originalSubtitles  ] =
    useVideoInfoStore((state) => [
      state.title,
      state.poster,
      state.originalVideoUrl,
      state.realVideoUrl,
      state.videoType,
      state.id,
      state.language,
      state.subtitles,
      state.displayLanguage,
      state.originalSubtitles,
    ]);

  const displaySubtitles = useMemo(() => {
    if (displayLanguage === "original") {
      return originalSubtitles;
    }
    return subtitles
  }, [subtitles, displayLanguage, originalSubtitles]);


  useTitle(t("title"));
  const player = useRef<MediaPlayerInstance>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showBrand = process.env.NEXT_PUBLIC_SHOW_BRAND === "true";

  const {
    ref: headerRef,
    height: headerHeight,
    width: headerWidth,
  } = useComponentSize();
  const {
    ref: footerRef,
    height: footerHeight,
    width: footerWidth,
  } = useComponentSize();
  const loaded = useMemo(() => {
    return !!(headerHeight && (footerHeight || !showBrand) && headerWidth && (footerWidth || !showBrand));
  }, [headerHeight, footerHeight, headerWidth, footerWidth, showBrand]);

  useEffect(() => {
    console.log(showBrand, loaded);
  }, [showBrand, loaded]);

  const [shareId, setShareId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);


  const handleShare = async () => {
    try {
      const { id: shareId } = await ky
        .post("/api/share", {
          json: {
            id,
            title,
            poster,
            originalVideoUrl,
            realVideoUrl,
            videoType,
            language,
            subtitles,
            originalSubtitles,
          },
        })
        .json<{ id: string }>();
      if (shareId) {
        navigator.clipboard.writeText(
          `${window.location.origin}/${locale}/share/${shareId}?lang=${locale}`
        );
        setShareId(shareId);
      }
      if (window.self !== window.top) {
        setShareDialogOpen(true);
      } else {
        toast.success(t("share.success"));
      }
    } catch (error) {
      toast.error(t("share.errorCreate"));
    }
  };

  useEffect(() => {
    import("flowbite");
  }, []);
  return (
    <main className="h-full">
      <LanguageSwitch className="fixed right-16 top-2 z-10" />

      <Header
        className={cn(
          "pt-16 min-w-[375px]",

          !loaded || !realVideoUrl
            ? "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -mt-16"
            : ""
        )}
        ref={headerRef}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
      {loaded && realVideoUrl && (
        <section
          className="flex flex-col items-center min-w-[375px] w-full h-full py-6"
          style={{
            height: `calc(100vh - ${headerHeight}px - ${footerHeight}px)`,
          }}
        >
          {isSubmitting ? (
            // empty state
            <>
              <EmptyCard
                className="max-w-[1080px] container  border p-2 rounded-lg bg-white w-full h-full"
                description={t("empty.description")}
                title={t("empty.title")}
              />
            </>
          ) : (
            <>
              <div className="h-full max-w-[1080px] container border p-2 rounded-lg bg-white flex flex-col gap-2">
                <VideoPlayer
                  ref={player}
                  src={realVideoUrl || ""}
                  type={videoType || ""}
                  id={id || ""}
                  poster={poster}
                  title={title || ""}
                  subtitles={displaySubtitles}
                  language={language}
                />
                <div className="flex items-center justify-center gap-2">
                  <SubtitleDrawer player={player} />
                  <Button onClick={handleShare}>{t("share.button")}</Button>
                  <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                    <DialogContent aria-describedby={undefined}>
                      <DialogHeader>
                        <DialogTitle>{t("share.successIframe")}</DialogTitle>
                      </DialogHeader>
                      <Input
                        value={`${window.location.origin}/${locale}/share/${shareId}?lang=${locale}`}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/${locale}/share/${shareId}?lang=${locale}`
                          );
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </>
          )}
        </section>
      )}
      {showBrand && (<Footer
        className={cn(
          "pb-6 min-w-[375px]",
          (!loaded || !realVideoUrl) && "fixed bottom-0 left-0 right-0"
        )}
          ref={footerRef}
        />
      )}
    </main>
  );
}
