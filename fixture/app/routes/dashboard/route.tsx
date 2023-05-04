import * as Remix from "@remix-run/react";

export default function Dashboard() {
  return (
    <>
      <h1>Home</h1>
      <Remix.Outlet />
    </>
  );
}
