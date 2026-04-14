"use server";
import { readFile } from "fs/promises";
import ky from "ky";
import { join } from "path";
// Root Interface representing the entire JSON response
interface ApiResponse {
  code: number;
  message: string;
  ttl: number;
  data: Data;
}

// Data Interface representing the "data" object
interface Data {
  from: string;
  result: string;
  message: string;
  quality: number;
  format: string;
  timelength: number;
  accept_format: string;
  accept_description: string[];
  accept_quality: number[];
  video_codecid: number;
  seek_param: string;
  seek_type: string;
  durl: Durl[];
  support_formats: SupportFormat[];
  high_format: HighFormat | null;
  last_play_time: number;
  last_play_cid: number;
  view_info: ViewInfo | null;
}

// Durl Interface representing each item in the "durl" array
interface Durl {
  order: number;
  length: number;
  size: number;
  ahead: string;
  vhead: string;
  url: string;
  backup_url: string | null;
}

// SupportFormat Interface representing each item in the "support_formats" array
interface SupportFormat {
  quality: number;
  format: string;
  new_description: string;
  display_desc: string;
  superscript: string;
  codecs: string | null;
}

// HighFormat Interface (currently null, can be expanded if structure is known)
interface HighFormat {
  // Define properties if available
}

// ViewInfo Interface (currently null, can be expanded if structure is known)
interface ViewInfo {
  // Define properties if available
}

export const getRealUrlForBilibili = async (bid: string) => {
  try {
    const response = await ky
      .get(`https://abcd-biliapi.tools302.com/getvideo?bvid=${bid}`)
      .json<ApiResponse>();
    return response;
  } catch (error) {
    console.error(error);
  }
};
const SHARE_DIR = join(
  process.env.NEXT_PUBLIC_DEFAULT_SHARE_DIR || "shared"
);

export const getVideoInfo = async (id: string) => {
  const filePath = join(SHARE_DIR, `${id}.json`);
  try {
    const data = await readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    throw new Error("File read failed");
  }
};
