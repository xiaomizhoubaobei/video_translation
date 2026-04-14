"use client";
import type { VideoInfoState } from "@/store/use-video-info-store";
import Dexie, { type Table } from "dexie";
import { isFunction, pickBy } from "es-toolkit";

class SessionDatabase extends Dexie {
  sessions!: Table<Omit<VideoInfoState, "_hasHydrated">>;

  constructor() {
    super("VTSessions");
    this.version(2).stores({
      sessions: "++id, title, createdAt, updatedAt",
    });
  }
}

const db = new SessionDatabase();

// 创建一个新的类型，只包含非函数属性

export const save = async (session: VideoInfoState) => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const result = pickBy(session, (value: any, key: any) => !isFunction(value) && key !== "_hasHydrated");
  const data = await db.sessions.get(result.id);

  if (data) {
    await db.sessions.update(session.id, { ...result });
  } else {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    await db.sessions.add({ ...result, createdAt: result.createdAt!, updatedAt: result.updatedAt! });
  }
};

export const getAll = async () => {
  const sessions = await db.sessions.toArray();
  return sessions.sort((prev, next) => next.updatedAt - prev.updatedAt);
};

export const remove = async (id: string) => {
  await db.sessions.delete(id);
};
