import { RouteProps } from "remix/server";

import { Counter } from "../../components/counter.js";

export function loader() {
  // throw new Response(null, { status: 302, headers: { Location: "/about" } });
  return {
    message: new Promise<string>((resolve) =>
      setTimeout(() => {
        resolve("Hello Dashboard!");
      }, 2000)
    ),
  };
}

export function action() {
  return {
    message: "Hello Action!",
  };
}

export async function Component({
  Form,
  actionData,
  loaderData,
}: RouteProps<typeof loader, typeof action>) {
  return (
    <>
      <h2>{actionData?.message ?? (await loaderData.message)}</h2>
      <p>
        <a href="/">Home</a>
      </p>
      <p>
        <a href="/dashboard/item/2">Item</a>
      </p>
      <p>
        <a href="/dashboard">Self</a>
      </p>
      <Form method="post">
        <button type="submit" name="test" value="hello">
          Submit
        </button>
      </Form>
      <Counter />
    </>
  );
}

export function Loading() {
  return <p>Loading Index...</p>;
}
