"use client";
import * as Remix from "@remix-run/react";

export default function PublicLayout() {
  return (
    <>
      <h1>Public</h1>
      <Remix.Outlet />
    </>
  );
}
