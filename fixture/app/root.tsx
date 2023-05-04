import * as Remix from "@remix-run/react";

export default function Root() {
  return (
    <>
      <h1>Root</h1>
      <Remix.Outlet />
    </>
  );
}
