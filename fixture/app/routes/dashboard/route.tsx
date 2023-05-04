import * as Remix from "@remix-run/react";

export function Component() {
  return (
    <>
      <h1>Home</h1>
      <Remix.Outlet />
    </>
  );
}
