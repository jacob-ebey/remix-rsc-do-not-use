import { RouteProps } from "remix/server";
import { ItemMixin } from "../../mixins/item.js";

export const mixins = {
  item: ItemMixin.map(({ params }) => ({ id: params.itemId })),
  item2: ItemMixin.map(({ params }) => ({ id: params.itemId })),
} as const;

export function Component({ mixins }: RouteProps) {
  return (
    <>
      <h2>Item</h2>
      <mixins.item.Outlet />
      <mixins.item2.Outlet />
    </>
  );
}
