import * as Tooltip from "@radix-ui/react-tooltip";
import {
  CaptionButton,
  FullscreenButton,
  MuteButton,
  PlayButton,
  isTrackCaptionKind,
  useMediaState,
} from "@vidstack/react";
import {
  Minimize as FullscreenExitIcon,
  Maximize as FullscreenIcon,
  VolumeX as MuteIcon,
  PauseIcon,
  PlayIcon,
  SubtitlesIcon,
  Volume2 as VolumeHighIcon,
  Volume1 as VolumeLowIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

export interface MediaButtonProps {
  tooltipSide?: Tooltip.TooltipContentProps["side"];
  tooltipAlign?: Tooltip.TooltipContentProps["align"];
  tooltipOffset?: number;
}

export const buttonClass =
  "group ring-media-focus relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 focus-visible:ring-4 aria-disabled:hidden";

export const tooltipClass =
  "animate-out fade-out slide-out-to-bottom-2 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in data-[state=delayed-open]:slide-in-from-bottom-4 z-10 rounded-sm bg-black/90 px-2 py-0.5 text-sm font-medium text-white parent-data-[open]:hidden";

export function Play({ tooltipOffset = 0, tooltipSide = "top", tooltipAlign = "center" }: MediaButtonProps) {
  const t = useTranslations("player");

  const isPaused = useMediaState("paused");
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <PlayButton className={buttonClass}>
          {isPaused ? <PlayIcon className="w-7 h-7 translate-x-px" /> : <PauseIcon className="w-7 h-7" />}
        </PlayButton>
      </Tooltip.Trigger>
      <Tooltip.Content className={tooltipClass} side={tooltipSide} align={tooltipAlign} sideOffset={tooltipOffset}>
        {isPaused ? t("play") : t("pause")}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}

export function Mute({ tooltipOffset = 0, tooltipSide = "top", tooltipAlign = "center" }: MediaButtonProps) {
  const t = useTranslations("player");

  const volume = useMediaState("volume");
  const isMuted = useMediaState("muted");
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <MuteButton className={buttonClass}>
          {isMuted || volume === 0 ? (
            <MuteIcon className="w-7 h-7" />
          ) : volume < 0.5 ? (
            <VolumeLowIcon className="w-7 h-7" />
          ) : (
            <VolumeHighIcon className="w-7 h-7" />
          )}
        </MuteButton>
      </Tooltip.Trigger>
      <Tooltip.Content className={tooltipClass} side={tooltipSide} align={tooltipAlign} sideOffset={tooltipOffset}>
        {isMuted ? t("unmute") : t("mute")}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}

export function Caption({ tooltipOffset = 0, tooltipSide = "top", tooltipAlign = "center" }: MediaButtonProps) {
  const t = useTranslations("player");

  const track = useMediaState("textTrack");
  const isOn = track && isTrackCaptionKind(track);
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <CaptionButton className={buttonClass}>
          <SubtitlesIcon className={`w-7 h-7 ${!isOn ? "text-white/60" : ""}`} />
        </CaptionButton>
      </Tooltip.Trigger>
      <Tooltip.Content className={tooltipClass} side={tooltipSide} align={tooltipAlign} sideOffset={tooltipOffset}>
        {isOn ? "Closed-Captions Off" : "Closed-Captions On"}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}

export function Fullscreen({ tooltipOffset = 0, tooltipSide = "top", tooltipAlign = "center" }: MediaButtonProps) {
  const t = useTranslations("player");

  const isActive = useMediaState("fullscreen");
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <FullscreenButton className={buttonClass}>
          {isActive ? <FullscreenExitIcon className="w-7 h-7" /> : <FullscreenIcon className="w-7 h-7" />}
        </FullscreenButton>
      </Tooltip.Trigger>
      <Tooltip.Content className={tooltipClass} side={tooltipSide} align={tooltipAlign} sideOffset={tooltipOffset}>
        {isActive ? t("exit_fullscreen") : t("enter_fullscreen")}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
