import { useCallback, useContext, useMemo } from "react";
import { colorMap, logLevels, validLogTypes } from "./constants";
import { LoggerContext } from "./context";
import type { LogLevel, LogType, LoggerOptions } from "./types";

const formatMessage = (message: unknown): string => {
  if (typeof message === "object") {
    return JSON.stringify(message, null, 2);
  }
  return String(message);
};

const formatTimestamp = (): string => {
  return new Date().toLocaleTimeString("zh-Hans-CN", { hour12: false });
};

export const useLogger = (namespace: string, options: LoggerOptions = {}) => {
  const { prefix = "" } = options;
  const context = useContext(LoggerContext);

  if (!context) {
    throw new Error("useLogger must be used within a LoggerProvider");
  }

  const { level } = context;

  const log = useCallback(
    (message: unknown, type: LogType) => {
      if (validLogTypes[type] < logLevels[level.toLocaleLowerCase() as LogLevel]) return;

      const timestamp = formatTimestamp();
      const formattedMessage = formatMessage(message);
      const logMessage = `${timestamp} [${type.toUpperCase()}] [${namespace}] ${prefix} ${formattedMessage}`;

      const style = `color: ${colorMap[type]}; font-weight: bold;`;
      console.log(`%c${logMessage}`, style);
    },
    [namespace, level, prefix],
  );

  return useMemo(
    () => ({
      debug: (message: unknown) => log(message, "debug"),
      info: (message: unknown) => log(message, "info"),
      success: (message: unknown) => log(message, "success"),
      warning: (message: unknown) => log(message, "warning"),
      error: (message: unknown) => log(message, "error"),
    }),
    [log],
  );
};

export const useLoggerLevel = () => {
  const context = useContext(LoggerContext);

  if (!context) {
    throw new Error("useLoggerLevel must be used within a LoggerProvider");
  }

  return context;
};
