"use client";

import * as React from "react";

export function Counter() {
  const [count, setCount] = React.useState(0);

  const decrement = React.useCallback(() => setCount((c) => c - 1), [setCount]);
  const increment = React.useCallback(() => setCount((c) => c + 1), [setCount]);

  return (
    <p>
      <button onClick={decrement}>-</button>
      <span> {count} </span>
      <button onClick={increment}>+</button>
    </p>
  );
}
