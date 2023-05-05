import type { RouteProps } from "remix/server";

export function Component({ outlet }: RouteProps) {
  return (
    <>
      <h1>Public</h1>
      {outlet}
    </>
  );
}
