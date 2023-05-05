import { RouteProps } from "remix/server";

export function Component({ outlet }: RouteProps) {
  return (
    <>
      <h1>Home</h1>
      {outlet}
    </>
  );
}
