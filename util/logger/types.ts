import type { ReactNode } from "react";

export type LogLevel = "debug" | "info" | "warning" | "error" | "none";
export type LogType = "debug" | "info" | "success" | "warning" | "error";

export interface LoggerContextType {
  level: LogLevel;
  setLevel: (level: LogLevel) => void;
}

export interface LoggerOptions {
  prefix?: string;
}

export interface LoggerProviderProps {
  children: ReactNode;
  initialLevel?: LogLevel;
}
