import { RouteProps } from "remix/server";

export default function Root({ outlet }: RouteProps) {
  return (
    <>
      <h1>Root</h1>
      {outlet}
    </>
  );
}
