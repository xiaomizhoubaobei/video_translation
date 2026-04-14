"use client";

import { getVideoInfo } from "@/app/actions";
import { SubtitleDrawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import LanguageSwitch from "@/components/language-switch";
import { VideoPlayer } from "@/components/video/player";
import { cn } from "@/lib/utils";
import { useVideoInfoStore } from "@/store/use-video-info-store";
import { MediaPlayerInstance } from "@vidstack/react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useComponentSize } from "react-use-size";

export default function SharePage() {
  const { id: shareId } = useParams();
  const { updateVideoInfo } = useVideoInfoStore((state) => ({
    updateVideoInfo: state.updateAll,
  }));
  useEffect(() => {
    const _getVideoInfo = async () => {
      if (!shareId) {
        return;
      }
      const videoInfo = await getVideoInfo(shareId as string);
      console.log(videoInfo);

      updateVideoInfo(videoInfo);
    };
    _getVideoInfo();
  }, [shareId]);

  const [
    title,
    poster,
    originalVideoUrl,
    realVideoUrl,
    videoType,
    id,
    language,
    subtitles,
    displayLanguage,
    originalSubtitles,
  ] = useVideoInfoStore((state) => [
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
    return subtitles;
  }, [subtitles, displayLanguage, originalSubtitles]);

  const player = useRef<MediaPlayerInstance>(null);

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
  const showBrand = process.env.NEXT_PUBLIC_SHOW_BRAND === "true";
  const loaded = useMemo(() => {
    return !!(
      headerHeight &&
      (footerHeight || !showBrand) &&
      headerWidth &&
      (footerWidth || !showBrand)
    );
  }, [headerHeight, footerHeight, headerWidth, footerWidth, showBrand]);

  return (
    <main className="h-full">
      <LanguageSwitch className="fixed right-4 top-2 z-10" />
      <Header
        className={cn("pt-16 min-w-[375px]")}
        isSubmitting={false}
        setIsSubmitting={() => {}}
        hiddenActions={true}
        ref={headerRef}
      />
      {loaded && realVideoUrl && (
        <section
          className="flex flex-col items-center min-w-[375px] w-full h-full py-6"
          style={{
            height: `calc(100vh - ${headerHeight}px - ${footerHeight}px)`,
          }}
        >
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
            </div>
          </div>
        </section>
      )}
      {showBrand && (
        <Footer className={cn("pb-6 min-w-[375px]")} ref={footerRef} />
      )}
    </main>
  );
}
