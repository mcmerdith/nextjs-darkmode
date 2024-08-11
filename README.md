# nextjs-darkmode

This package is targetted for [Next.Js](https://nextjs.org/) projects using [shadcn/ui](https://ui.shadcn.com/), but may work with other ui frameworks depending on their implementation.

## Motivation

`shadcn/ui` handles dark mode by applying the `dark` class to some root element. I couldn't find a clean way to respect the user's system preference when using React Server Components, so I wrote this.

## Features

-   Automatic system preference detection
-   Automatic live updates, no page reload required
-   Simple installation and usage

## Installation

```bash
npm install --save nextjs-darkmode
```

## Usage

The package provides a `DEFAULT_CLASS_NAME` constant (defaults to `dark` from `shadcn/ui`).

To override this, set the `data-darkmode-class` attribute to the class you want to use on the element tagged with `data-darkmode-target`.

```html
<body data-darkmode-target data-darkmode-class="dark-theme"></body>
```

### With React Server Components

React Server Components are the preferred way to use this package. Rendering dark mode on the server prevents a flash of light for dark mode users.

```tsx
import { getServerDarkMode } from "nextjs-darkmode/server";
import { DarkModeManager } from "nextjs-darkmode/client";
import { DEFAULT_CLASS_NAME } from "nextjs-darkmode/constants";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const darkMode = getServerDarkMode(); // Use this to get the dark mode state for the initial server-side render

    return (
        <html lang="en">
            <body
                className={darkMode ? DEFAULT_CLASS_NAME : ""}
                data-darkmode-target
            >
                <DarkModeManager />
                {children}
            </body>
        </html>
    );
}
```

### Without React Server Components

Without React Server Components, an additional flag is required to force the dark mode to be updated on the client. The user will see a flash of light mode for dark mode users. This is obviously less than ideal, but it works if you can't use Server Components for some reason.

```tsx
"use client";

import { getClientDarkMode, DarkModeManager } from "nextjs-darkmode/client";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const darkMode = getClientDarkMode(); // Only necessary if you need to know the current dark mode state

    return (
        <html lang="en">
            <body data-darkmode-target>
                <DarkModeManager alwaysUpdate />
                {children}
            </body>
        </html>
    );
}
```

### Updating the user preference

Allowing the user to change the dark mode preference is as simple as calling `updateClientPreference` with the new preference.

```tsx
"use client";

import {
    getClientPreference,
    updateUserPreference,
} from "nextjs-darkmode/client";

export default function UpdatePreference() {
    return (
        <div>
            <p>Current dark mode preference: {getClientPreference()}</p>
            <button onClick={() => updateClientPreference("dark")}>
                Dark Mode
            </button>
            <button onClick={() => updateClientPreference("light")}>
                Light Mode
            </button>
            <button onClick={() => updateClientPreference("system")}>
                System Preference
            </button>
            {children}
        </div>
    );
}
```

## Issues

This is my first ever npm package, so I'm sure there's something I didn't do quite right. If you find any issues, please open an issue [here](https://github.com/mcmerdith/nextjs-darkmode/issues) or feel free to fix it yourself and submit a pull request.

## Versioning

This package uses [semver](https://semver.org/) for versioning.
