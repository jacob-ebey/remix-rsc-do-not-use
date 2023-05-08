"use client";

import * as React from "react";

import {
  type Location,
  useLocation,
  useMatches,
  useNavigation,
} from "./router.client.js";
import { ServerMatch } from "./router.shared.js";

const SCROLL_RESTORATION_STORAGE_KEY = "react-router-scroll-positions";
/** @type {Record<string, number>} */
let savedScrollPositions = {};

export interface ScrollRestorationProps {
  getKey?: (location: Location, matches: ServerMatch[]) => string | null;
  storageKey?: string;
}

export function ScrollRestoration({
  getKey,
  storageKey,
}: ScrollRestorationProps) {
  useScrollRestoration({ getKey, storageKey });
  return null;
}

function useScrollRestoration({
  getKey,
  storageKey,
}: ScrollRestorationProps = {}) {
  let location = useLocation();
  let matches = useMatches();
  let navigation = useNavigation();

  // Trigger manual scroll restoration while we're active
  React.useEffect(() => {
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);

  // Save positions on pagehide
  usePageHide(
    React.useCallback(() => {
      if (navigation.state === "idle" && !navigation.transitioning) {
        let key = (getKey ? getKey(location, matches) : null) || location.key;
        savedScrollPositions[key] = window.scrollY;
      }
      sessionStorage.setItem(
        storageKey || SCROLL_RESTORATION_STORAGE_KEY,
        JSON.stringify(savedScrollPositions)
      );
      window.history.scrollRestoration = "auto";
    }, [storageKey, getKey, navigation.state, location, matches])
  );

  React.useEffect(() => {
    return () => {
      if (navigation.state === "idle" && !navigation.transitioning) {
        let key = (getKey ? getKey(location, matches) : null) || location.key;
        savedScrollPositions[key] = window.scrollY;
      }
    };
  }, [location, navigation, getKey]);

  if (typeof document !== "undefined") {
    React.useLayoutEffect(() => {
      // try to scroll to the hash
      if (location.hash) {
        let el = document.getElementById(location.hash.slice(1));
        if (el) {
          el.scrollIntoView();
          return;
        }
      }

      // Don't reset if this navigation opted out
      if (location.state && location.state.preventScrollReset === true) {
        return;
      }

      if (typeof savedScrollPositions[location.key] === "number") {
        window.scrollTo(0, savedScrollPositions[location.key]);
        return;
      }

      // otherwise go to the top on new locations
      window.scrollTo(0, 0);
    }, [location]);
  }
}

/**
 * Setup a callback to be fired on the window's `pagehide` event. This is
 * useful for saving some data to `window.localStorage` just before the page
 * refreshes.  This event is better supported than beforeunload across browsers.
 *
 * Note: The `callback` argument should be a function created with
 * `React.useCallback()`.
 */
function usePageHide(callback: (...args: any[]) => any, options?: any) {
  let { capture } = options || {};
  React.useEffect(() => {
    let opts = capture != null ? { capture } : undefined;
    window.addEventListener("pagehide", callback, opts);
    return () => {
      window.removeEventListener("pagehide", callback, opts);
    };
  }, [callback, capture]);
}
