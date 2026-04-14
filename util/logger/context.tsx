"use client";
import React, { createContext, useState } from "react";
import type { LogLevel, LoggerContextType, LoggerProviderProps } from "./types";

export const LoggerContext = createContext<LoggerContextType | undefined>(undefined);

export const LoggerProvider: React.FC<LoggerProviderProps> = ({ children, initialLevel }) => {
  const [level, setLevel] = useState<LogLevel>(initialLevel || "info");

  return <LoggerContext.Provider value={{ level, setLevel }}>{children}</LoggerContext.Provider>;
};
