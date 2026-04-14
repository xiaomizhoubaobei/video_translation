export function detectUrls(text: string): string[] {
  const urlPattern =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&\/\/=]*)/gi;
  const matches = text.match(urlPattern);
  return matches || [];
}

export function detectUrl(text: string): string | null {
  const urls = detectUrls(text);
  return urls.length > 0 ? urls[0] : null;
}
