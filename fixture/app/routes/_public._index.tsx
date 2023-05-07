import { RouteProps } from "remix/server";

import { Counter } from "../components/counter.js";

export function loader() {
  // throw new Response(null, { status: 302, headers: { Location: "/about" } });
  return {
    message: new Promise<string>((resolve) =>
      setTimeout(() => {
        resolve("Hello World!");
      }, 2000)
    ),
  };
}

export async function Component({ loaderData }: RouteProps<typeof loader>) {
  return (
    <>
      <h2>{await loaderData.message}</h2>
      <p>
        <a href="/dashboard">Dashboard</a>
      </p>
      <Counter />
    </>
  );
}
