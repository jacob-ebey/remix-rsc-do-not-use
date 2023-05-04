import stylesHref from "./styles.css";

export function links() {
  return [{ rel: "stylesheet", href: stylesHref }];
}

export function Component() {
  return <h2>Items</h2>;
}
