import { toSeconds } from "./utils";

export const REFRESH_TOKEN_EXPIRATION = toSeconds("30d") // 30 days
export const ACCESS_TOKEN_EXPIRATION = toSeconds("15m");
