import { toSeconds } from "./utils";

export const REFRESH_TOKEN_EXPIRATION = toSeconds("30d") // 30 days
export const ACCESS_TOKEN_EXPIRATION = toSeconds("15m"); // 15 minutes
export const CLEAR_EXPIRED_TOKENS_INTERVAL = toSeconds("1d"); // 1 hour
