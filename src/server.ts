import "server-only";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { DARK_MODE_COOKIE } from "./constants";

/**
 * Get the current dark mode state
 *
 * ***WARNING***: Only call this function from the server
 *
 * @returns If dark mode is enabled
 */
export function getServerDarkMode(): boolean {
    return getCookie(DARK_MODE_COOKIE, { cookies }) === "true";
}
