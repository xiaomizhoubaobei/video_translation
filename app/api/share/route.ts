import { VideoInfoShare } from "@/store/use-video-info-store";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

const SHARE_DIR = join(
  process.env.NEXT_PUBLIC_DEFAULT_SHARE_DIR || "shared"
);

export async function POST(request: NextRequest) {
  const videoData: VideoInfoShare = await request.json();
  console.log(videoData);
  const id = nanoid();
  const filePath = join(SHARE_DIR, `${id}.json`);
  console.log(filePath);

  try {
    if (!existsSync(SHARE_DIR)) {
      await mkdir(SHARE_DIR, { recursive: true });
    }

    await writeFile(filePath, JSON.stringify(videoData, null, 2), "utf8");
    return NextResponse.json({ id });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
