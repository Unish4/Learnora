import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ENV } from "./env.js";

export const globalLimiter = arcjet({
  key: ENV.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }),
    tokenBucket({ mode: "LIVE", refillRate: 100, interval: 60, capacity: 100 }),
  ],
});
