import { LoadingProps, RouteProps } from "remix/server";

export function loader() {
  // throw new Response(null, { status: 302, headers: { Location: "/about" } });
  return {
    message: "Dashboard",
    // message: new Promise<string>((resolve) =>
    //   setTimeout(() => {
    //     resolve("Dashboard");
    //   }, 500)
    // ),
  };
}

export async function Component({
  loaderData,
  outlet,
}: RouteProps<typeof loader>) {
  return (
    <>
      <h2>{await loaderData.message}</h2>
      {outlet}
    </>
  );
}

export function Loading() {
  return (
    <>
      <h1>Loading...</h1>
    </>
  );
}
