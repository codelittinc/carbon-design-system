/**
 * CarbonOS Design System — server-safe entry point.
 *
 *   import { cn, formatMoney } from "@codelittinc/carbon-design-system/utils";
 *
 * Everything here is a pure function: no React, no hooks, no browser globals.
 * That is the whole point of this file existing separately from `src/index.ts`.
 *
 * The package root is one bundle marked `"use client"`, because almost all of it
 * is React client components. An RSC bundler applies that directive to every
 * export in the module, including plain functions — so a *server* component that
 * imported `cn` from the root got a client reference back, and calling it threw
 * at request time:
 *
 *   Error: Attempted to call cn() from the server but cn is on the client.
 *
 * Nothing catches that earlier: types resolve, the bundle builds, and the page
 * only fails when it actually renders. (It cost a 500 on a signed-in admin page
 * in player-scoreboard-v2 to find.) This entry has no directive, so these
 * helpers can be called from server components, client components, and plain
 * Node alike.
 *
 * These same helpers stay exported from the package root as well, so existing
 * client-side imports keep working — this is additive.
 *
 * **Only add pure functions here.** Anything that touches React, `window`, or
 * `document` belongs in the root entry. `tsup.config.ts` asserts that this
 * bundle never gains the `"use client"` directive.
 */

export { cn } from "./lib/cn";
export { formatMoney, formatDate, formatPeriodLabel } from "./lib/format";
