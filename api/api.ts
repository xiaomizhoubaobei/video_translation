import { useErrorStore } from "@/store/use-error-store";
import { isNotNil } from "es-toolkit";
import ky from "ky";

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}
const apiKy = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  timeout: false,
  hooks: {
    beforeRequest: [
      (request) => {
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        if (apiKey) {
          request.headers.set("Authorization", `Bearer ${apiKey}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (!response.ok) {
          const res = await response.json<{ error: { err_code: number } }>();
          if (isNotNil(res.error?.err_code)) {
            useErrorStore.getState().setErrorCode(res.error.err_code.toString());
          }
        }
      },
    ],
  },
});

export { apiKy };
