import { getRealUrlForVideo } from "@/app/actions/video";
import { type Subtitle, useVideoInfoStore } from "@/store/use-video-info-store";
import { isVideoUrlUsable } from "@/util/video";
import {
  MediaPlayer,
  type MediaPlayerInstance,
  MediaProvider,
  Poster,
  Track,
  useMediaRemote,
} from "@vidstack/react";
import type { DefaultLayoutTranslations } from "@vidstack/react/player/layouts/default";
import {
  DefaultAudioLayout,
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import { useTranslations } from "next-intl";
import { type ForwardedRef, forwardRef, memo, useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";

interface PlayerProps {
  title: string;
  src: string;
  id?: string;
  type?: string;
  subtitles?: Subtitle[];
  language?: string;
  poster?: string;
}

const Player = forwardRef(function Player(
  { title, id, src, type, subtitles, language, poster }: PlayerProps,
  ref: ForwardedRef<MediaPlayerInstance>
) {
  const playerRef = useRef<MediaPlayerInstance | null>(null);

  useEffect(() => {
    if (playerRef.current && ref) {
      if (typeof ref === "function") {
        console.log("ref", ref);
        ref(playerRef.current);
      } else {
        ref.current = playerRef.current;
      }
    }
  }, [ref, playerRef]);

  const t = useTranslations("player");
  const tError = useTranslations("header");
  const playerLanguage: DefaultLayoutTranslations = {
    "Caption Styles": t("caption_styles"),
    "Captions look like this": t("captions_look_like_this"),
    "Closed-Captions Off": t("closed-captions_off"),
    "Closed-Captions On": t("closed-captions_on"),
    "Display Background": t("display_background"),
    "Enter Fullscreen": t("enter_fullscreen"),
    "Enter PiP": t("enter_pip"),
    "Exit Fullscreen": t("exit_fullscreen"),
    "Exit PiP": t("exit_pip"),
    "Google Cast": t("google_cast"),
    "Keyboard Animations": t("keyboard_animations"),
    "Seek Backward": t("seek_backward"),
    "Seek Forward": t("seek_forward"),
    "Skip To Live": t("skip_to_live"),
    "Text Background": t("text_background"),
    Accessibility: t("accessibility"),
    AirPlay: t("airplay"),
    Announcements: t("announcements"),
    Audio: t("audio"),
    Auto: t("auto"),
    Boost: t("boost"),
    Captions: t("captions"),
    Chapters: t("chapters"),
    Color: t("color"),
    Connected: t("connected"),
    Connecting: t("connecting"),
    Continue: t("continue"),
    Default: t("default"),
    Disabled: t("disabled"),
    Disconnected: t("disconnected"),
    Download: t("download"),
    Family: t("family"),
    Font: t("font"),
    Fullscreen: t("fullscreen"),
    LIVE: t("live"),
    Loop: t("loop"),
    Mute: t("mute"),
    Normal: t("normal"),
    Off: t("off"),
    Opacity: t("opacity"),
    Pause: t("pause"),
    PiP: t("pip"),
    Play: t("play"),
    Playback: t("playback"),
    Quality: t("quality"),
    Replay: t("replay"),
    Reset: t("reset"),
    Seek: t("seek"),
    Settings: t("settings"),
    Shadow: t("shadow"),
    Size: t("size"),
    Speed: t("speed"),
    Text: t("text"),
    Track: t("track"),
    Unmute: t("unmute"),
    Volume: t("volume"),
  };

  const {
    originalVideoUrl,
    realVideoUrl,
    videoType,
    videoId,
    updateVideoInfo,
  } = useVideoInfoStore((state) => ({
    originalVideoUrl: state.originalVideoUrl,
    realVideoUrl: state.realVideoUrl,
    videoType: state.videoType,
    videoId: state.id,
    updateVideoInfo: state.updateAll,
  }));
  const realVideoType = useMemo(() => {
    return src.includes('youtube.com') ? 'video/youtube' : 'video/mp4'
  }, [src])

  useEffect(() => {
    let videoUrl = src;
    if (videoUrl.includes('youtube.com')) {
      return
    }
    if (!videoUrl) {
      videoUrl = originalVideoUrl!;
    }
    if (videoUrl) {
      isVideoUrlUsable(videoUrl).then((res: boolean) => {
        console.log("isVideoUrlUsable", res);
        if (!res) {
          const retryGetRealUrl = async (retries = 3) => {
            for (let i = 0; i < retries; i++) {
              const url = await getRealUrlForVideo(
                videoType as string,
                videoId as string,
                process.env.NEXT_PUBLIC_API_KEY!
              );
              console.log(`Attempt ${i + 1}: realVideoUrl`, url);
              if (url) {
                updateVideoInfo({ realVideoUrl: url });
                return;
              }
              if (i < retries - 1)
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            toast.error(t("error.get_real_url_failed"));
          };
          retryGetRealUrl();
        }
      });
    }
  }, [src, videoType, videoId, updateVideoInfo, originalVideoUrl, t]);

  const { displayLanguage } = useVideoInfoStore((state) => ({
    displayLanguage: state.displayLanguage,
  }));
  const remote = useMediaRemote(playerRef.current);
  useEffect(() => {
    console.log("playerRef.current", playerRef.current?.textTracks);
  }, [playerRef.current?.textTracks]);

  useEffect(() => {
    remote.changeTextTrackMode(0, "showing");
  }, [subtitles]);

  return (
    <MediaPlayer
      ref={ref}
      className="h-[calc(100%-50px)] aspect-video bg-slate-900 text-white font-sans overflow-hidden rounded-md ring-media-focus data-[focus]:ring-4"
      title={title}
      src={{ src: src, type: realVideoType }}
      viewType="video"
      streamType="on-demand"
      logLevel="warn"
      crossOrigin
      playsInline
    >
      <MediaProvider>
        <Poster
          className="absolute inset-0 block h-full w-full rounded-md opacity-0 transition-opacity data-[visible]:opacity-100 object-cover"
          src={poster}
          alt=""
        />
        <Track
          label={displayLanguage}
          kind="subtitles"
          type="json"
          default={true}
          content={{
            cues: subtitles?.map((item) => ({
              startTime: item.startTime,
              endTime: item.end,
              text: item.text,
            })),
          }}
        />
      </MediaProvider>
      <DefaultVideoLayout
        translations={playerLanguage}
        icons={defaultLayoutIcons}
      />
      <DefaultAudioLayout
        translations={playerLanguage}
        icons={defaultLayoutIcons}
      />
    </MediaPlayer>
  );
});

export const VideoPlayer = memo(Player);
