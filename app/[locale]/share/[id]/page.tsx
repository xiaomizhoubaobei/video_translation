import SharePage from "@/components/page/share";
import { detectLocale } from "@/util/locale-util";
import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";

const languages = [
  { locale: "zh", url: "/zh" },
  { locale: "en", url: "/en" },
  { locale: "ja", url: "/ja" },
  { locale: "de", url: "/de" },
  { locale: "fr", url: "/fr" },
  { locale: "ko", url: "/ko" },
];

type Props = {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const headers_ = headers();
  const hostname = headers_.get("host");

  const previousImages = (await parent).openGraph?.images || [];

  const info = {
    zh: {
      title: "AI视频实时翻译",
      description: "传入视频链接，实时生成翻译字幕",
      image:
        "https://file.302ai.cn/gpt/imgs/20240827/e812819ea22845a98a062124253755fc.jpeg",
    },
    en: {
      title: "AI Video Real-Time Translation",
      description: "Enter the video link and generate subtitles in real time",
      image:
        "https://file.302ai.cn/gpt/imgs/20240827/10fdac28c1534635b082d4aecf2beb05.jpeg",
    },
    ja: {
      title: "AIビデオリアルタイム翻訳",
      description:
        "ビデオリンクを入力し、翻訳された字幕をリアルタイムで生成します",
      image:
        "https://file.302ai.cn/gpt/imgs/20240827/671992fe6135457a8117e9fe82b3d1e0.jpeg",
    },
  };

  let locale = detectLocale(
    (searchParams && (searchParams.lang as string)) || params.locale || "en"
  ) as keyof typeof info;

  if (!(locale in info)) {
    locale = "en";
  }

  return {
    title: info[locale as keyof typeof info].title,
    description: info[locale as keyof typeof info].description,
    metadataBase: new URL(
      (hostname as string).includes("localhost")
        ? "http://localhost:3000"
        : `https://${hostname}`
    ),
    alternates: {
      canonical: `/${locale}`,
      languages: languages
        .filter((item) => item.locale !== locale)
        .map((item) => ({
          [item.locale]: `${item.url}`,
        }))
        .reduce((acc, curr) => Object.assign(acc, curr), {}),
    },
    openGraph: {
      url: `/${locale}`,
      images: [info[locale as keyof typeof info].image, ...previousImages],
    },
    twitter: {
      site: (hostname as string).includes("localhost")
        ? `http://localhost:3000/${locale}`
        : `https://${hostname}/${locale}`,
      images: [info[locale as keyof typeof info].image, ...previousImages],
    },
  };
}
export default function Page() {
  return <SharePage />;
}
