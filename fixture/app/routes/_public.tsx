import * as Remix from "@remix-run/react";

export function Component() {
  return (
    <>
      <h1>Public</h1>
      <Remix.Outlet />
    </>
  );
}
