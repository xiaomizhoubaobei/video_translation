import type { LogLevel, LogType } from "./types";

export const logLevels: { [key in LogLevel]: number } = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3,
  none: 4,
};

export const validLogTypes: { [key in LogType]: number } = {
  debug: 0,
  info: 1,
  success: 1,
  warning: 2,
  error: 3,
};

export const colorMap: { [key in LogType]: string } = {
  debug: "#00bcd4",
  info: "#2196f3",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
};
