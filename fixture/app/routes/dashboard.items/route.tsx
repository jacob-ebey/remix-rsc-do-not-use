"use client";

import stylesHref from "./styles.css";

export function links() {
  return [{ rel: "stylesheet", href: stylesHref }];
}

export default function DashboardItems() {
  return <h2>Items</h2>;
}
