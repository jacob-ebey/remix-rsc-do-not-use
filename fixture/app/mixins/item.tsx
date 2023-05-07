import { defineMixin } from "remix/server";

let count = 0;

export const ItemMixin = defineMixin<{ id: string }>({
  loader({ params }) {
    if (params.id === "3") {
      throw new Error("Oh no!");
    }
    return {
      itemId: params.id,
    };
  },
  async action({ request }) {
    const formData = new URLSearchParams(await request.text());
    const by = Number.parseInt(formData.get("by") || "1", 10);
    if (!Number.isSafeInteger(by) || by < -10 || by > 10) {
      throw new Error("Invalid increment");
    }
    count += by;
  },
  Component({ loaderData, Form }) {
    return (
      <>
        <p>Item {loaderData.itemId}</p>
        <Form method="post">
          <input type="number" name="by" defaultValue="1" />
          <button type="submit">Increment {count}</button>
        </Form>
      </>
    );
  },
  Boundary({ error }) {
    return (
      <>
        <h2>Item Error</h2>
        <p>{String((error as any)?.message || error)}</p>
      </>
    );
  },
});
