import { toSeconds } from "./utils";

export const REFRESH_TOKEN_EXPIRATION = toSeconds("30d") // 30 days
export const ACCESS_TOKEN_EXPIRATION = toSeconds("15m"); // 15 minutes

export const CLEAR_EXPIRED_TOKENS_SCHEDULE = '0 0 * * *'; // Every day at midnight
export const CLEAR_EXPIRED_STORIES_SCHEDULE = '*/5 * * * *'; // Every 5 minutes
export const START_WEEKLY_CONTEST_SCHEDULE = '0 0 * * 1'; // Every Monday at midnight

export const BEHOOVE_COIN_MINIMUM_DENOMINATION = 0.00000001;
