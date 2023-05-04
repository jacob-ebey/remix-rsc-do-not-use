import { Counter } from "../components/counter.js";

import { loadItems } from "../actions/items.js";

export function Component() {
  console.log(loadItems);

  return (
    <>
      <h2>Home</h2>
      <Counter />
    </>
  );
}
