"use client";

import { getCookie, setCookie } from "cookies-next";
import { useEffect } from "react";
import {
    DARK_MODE_COOKIE,
    type DarkModePreference,
    DEFAULT_CLASS_NAME,
    PREFERENCE_COOKIE,
    TARGET_CLASS_NAME_ATTRIBUTE,
    TARGET_SELECTOR,
} from "./constants";

/**
 * Get the client's current dark mode state
 *
 * ***WARNING***: Only call this function from the client
 *
 * @returns If dark mode is enabled
 */
export function getClientDarkMode(): boolean {
    if (typeof window === "undefined") {
        console.warn("getClientDarkMode should only be called on the client");
    }

    return getCookie(DARK_MODE_COOKIE) === "true";
}

/**
 * Get the client's current dark mode preference
 *
 * ***WARNING***: Only call this function from the client
 *
 * @returns The dark mode preference
 */
export function getClientPreference(): DarkModePreference {
    if (typeof window === "undefined") {
        console.warn("getClientPreference should only be called on the client");
    }

    const cookie = getCookie(PREFERENCE_COOKIE);
    if (cookie === "dark") return "dark";
    if (cookie === "light") return "light";
    return "system";
}

/**
 * Change the user's dark mode preference
 *
 * ***WARNING***: Only call this function from the client
 *
 * @param preference The user preference
 * @param darkModeClass A custom class that is used for dark mode
 */
export function updateClientPreference(preference: DarkModePreference) {
    if (typeof window === "undefined") {
        console.warn("updateClientPreference can only be called on the client");
        return;
    }

    setCookie(PREFERENCE_COOKIE, preference);
    const clientPreference = getClientPreference();
    setClientDarkMode(
        clientPreference === "system"
            ? getSystemPreferenceQuery().matches
            : clientPreference === "dark"
    );
}

/**
 * Place this component somewhere in your app to automatically update dark mode
 *
 * If this component is not rendered, it will not be able to update dark mode, so it's recommended to place in the root layout
 *
 * ***Note***: This component does not actually render anything, it only performs the functionality
 *
 * @param alwaysUpdate Set to true if you are not setting dark mode during server-side rendering. Forces dark mode to be updated when the component renders
 * @param darkModeClass A custom class that is used for dark mode
 */
export function DarkModeManager({
    alwaysUpdate,
}: {
    alwaysUpdate?: boolean;
}): React.ReactNode {
    // VERY effectful code, run after render to prevent hydration errors
    useEffect(() => {
        // Client ONLY
        if (typeof window === "undefined") return;

        const systemPreferenceQuery = getSystemPreferenceQuery();
        const clientPreference = getClientPreference();

        // Register the system preference change listener
        systemPreferenceQuery.addEventListener(
            "change",
            systemPreferenceUpdate
        );

        const targetDarkMode =
            clientPreference === "system"
                ? systemPreferenceQuery.matches
                : clientPreference === "dark";
        const currentDarkMode = getClientDarkMode();

        // Update the cookie if the user's preference has changed
        if (alwaysUpdate || targetDarkMode !== currentDarkMode) {
            setClientDarkMode(targetDarkMode);
        }

        // Remove the event listener before unmounting / rerendering
        return () =>
            systemPreferenceQuery.removeEventListener(
                "change",
                systemPreferenceUpdate
            );
    }, [alwaysUpdate]);

    return null;
}

/// Internals

/**
 * Internal
 */
function systemPreferenceUpdate(e: MediaQueryListEvent) {
    // Only update if the user hasn't set a preference
    if (getClientPreference() !== "system") return;
    setClientDarkMode(e.matches);
}

/**
 * Internal
 */
function getSystemPreferenceQuery() {
    return window.matchMedia("(prefers-color-scheme: dark)");
}

/**
 * Internal
 */
function setClientDarkMode(enabled: boolean) {
    setCookie(DARK_MODE_COOKIE, enabled.toString());

    // Get elements to update
    const targets = document.querySelectorAll(TARGET_SELECTOR);

    if (targets.length === 0) {
        console.warn(
            "No target found for dark mode! Make sure you have a",
            TARGET_SELECTOR,
            "attribute an element."
        );
    }

    // Toggle the class on each target
    for (const target of targets) {
        if (!(target instanceof HTMLElement)) {
            console.warn(
                TARGET_SELECTOR,
                "should only be applied to HTML elements"
            );
            continue;
        }

        const className: string =
            target.dataset[TARGET_CLASS_NAME_ATTRIBUTE] ?? DEFAULT_CLASS_NAME;
        target.classList.toggle(className, enabled);
    }
}
