"use client";

import * as React from "react";
import nprogress from "nprogress";

import { useNavigation } from "remix/client";

export function LoadingIndicator() {
  const navigation = useNavigation();

  React.useEffect(() => {
    if (navigation.state === "idle" && !navigation.transitioning) {
      nprogress.done();
    } else {
      nprogress.start();
    }
  }, [navigation]);

  React.useEffect(
    () => () => {
      nprogress.done();
    },
    []
  );

  return null;
}
