import { BoundaryProps, LoadingProps, RouteProps } from "remix/server";

export function Component({ outlet }: RouteProps) {
  return (
    <html lang="en">
      <head>
        <title>Remix RSC</title>
      </head>
      <body>
        <h1>Root</h1>
        {outlet}
      </body>
    </html>
  );
}

export function Boundary({ error, location }: BoundaryProps) {
  console.error(error);
  return (
    <html lang="en">
      <head>
        <title>Remix RSC</title>
      </head>
      <body>
        <h1>Oops</h1>
        <p>
          <a href={location.pathname}>Recover from client error</a>
        </p>
        <p>
          <a href="/">Go Home</a>
        </p>
      </body>
    </html>
  );
}
