import { ShopifyImage } from "./images.js";
import { CartPopover } from "./layout.client.js";
import { LoadingIndicator } from "./loading-indicator.js";

export function Layout({ cart, children }) {
  const itemsCount = cart
    ? cart.lines.reduce((p, line) => p + line.quantity, 0)
    : 0;

  const createSelectedOptionsQuery = (selectedItems) => {
    if (!selectedItems || !selectedItems.length) return "";

    const searchParams = new URLSearchParams();
    for (const item of selectedItems) {
      searchParams.set(item.name, item.value);
    }
    return "?" + searchParams.toString();
  };

  return (
    <>
      <LoadingIndicator />

      {/* Header Navbar */}
      <nav className="sticky top-0 left-0 z-20 w-full border-b border-gray-200 bg-white py-2.5 px-6">
        <div className="container mx-auto flex max-w-6xl flex-wrap items-center justify-between">
          <a href="/" className="flex items-center">
            <span className="self-center whitespace-nowrap text-2xl font-semibold">
              mock.shop
            </span>
          </a>
          <div className="flex items-center">
            <CartPopover
              openable={!!cart}
              button={
                <div className="relative py-2" aria-label="Cart">
                  <div className="t-0 absolute left-3">
                    <span data-testid="cart-items-count" className="flex h-2 w-2 items-center justify-center rounded-full bg-red-500 p-3 text-xs text-white">
                      {itemsCount > 9 ? "9+" : itemsCount}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="file: mt-4 h-6 w-6"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                </div>
              }
            >
              {!!cart && (
                <div className="overflow-y-auto rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 max-h-[80vh]">
                  <div className="bg-gray-50 p-4">
                    <a
                      href="/cart"
                      className="flow-root rounded-md px-2 py-2 transition duration-150 ease-in-out hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                    >
                      <span className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          Full Cart
                        </span>
                      </span>
                      <span className="block text-sm text-gray-500">
                        {cart.lines.length > 9
                          ? "You have more items in your cart not shown below!"
                          : "View your full cart or begin checking out!"}
                      </span>
                    </a>
                  </div>

                  <div className="relative grid gap-8 bg-white p-7 lg:grid-cols-2">
                    {cart.lines.slice(0, 9).map((item) => (
                      <a
                        key={item.id}
                        href={
                          "/product/" +
                          item.merchandise.product.id.split("/").slice(-1)[0] +
                          createSelectedOptionsQuery(
                            item.merchandise.selectedOptions
                          )
                        }
                        className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white sm:h-12 sm:w-12">
                          <ShopifyImage
                            className="w-full h-full object-cover"
                            src={item.merchandise.image.url}
                            width={90}
                          />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {item.merchandise.product.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.merchandise.title} | Qty: {item.quantity}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CartPopover>
          </div>
        </div>
      </nav>

      {children}

      {/* Footer */}
      <footer className="py-6  bg-gray-200 text-gray-900">
        <div className="container px-6 mx-auto space-y-6 divide-y divide-gray-400 md:space-y-12 divide-opacity-50">
          <div className="grid justify-center  lg:justify-between">
            <div className="flex flex-col self-center text-sm text-center md:block lg:col-start-1 md:space-x-6">
              <span>Copy rgight © 2023 by codemix team </span>
              <a rel="noopener noreferrer" href="#">
                <span>Privacy policy</span>
              </a>
              <a rel="noopener noreferrer" href="#">
                <span>Terms of service</span>
              </a>
            </div>
            <div className="flex justify-center pt-4 space-x-4 lg:pt-0 lg:col-end-13">
              <a
                rel="noopener noreferrer"
                href="#"
                title="Email"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 duration-150 text-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </a>
              <a
                rel="noopener noreferrer"
                href="#"
                title="Twitter"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 duration-150 text-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 50 50"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M 50.0625 10.4375 C 48.214844 11.257813 46.234375 11.808594 44.152344 12.058594 C 46.277344 10.785156 47.910156 8.769531 48.675781 6.371094 C 46.691406 7.546875 44.484375 8.402344 42.144531 8.863281 C 40.269531 6.863281 37.597656 5.617188 34.640625 5.617188 C 28.960938 5.617188 24.355469 10.21875 24.355469 15.898438 C 24.355469 16.703125 24.449219 17.488281 24.625 18.242188 C 16.078125 17.8125 8.503906 13.71875 3.429688 7.496094 C 2.542969 9.019531 2.039063 10.785156 2.039063 12.667969 C 2.039063 16.234375 3.851563 19.382813 6.613281 21.230469 C 4.925781 21.175781 3.339844 20.710938 1.953125 19.941406 C 1.953125 19.984375 1.953125 20.027344 1.953125 20.070313 C 1.953125 25.054688 5.5 29.207031 10.199219 30.15625 C 9.339844 30.390625 8.429688 30.515625 7.492188 30.515625 C 6.828125 30.515625 6.183594 30.453125 5.554688 30.328125 C 6.867188 34.410156 10.664063 37.390625 15.160156 37.472656 C 11.644531 40.230469 7.210938 41.871094 2.390625 41.871094 C 1.558594 41.871094 0.742188 41.824219 -0.0585938 41.726563 C 4.488281 44.648438 9.894531 46.347656 15.703125 46.347656 C 34.617188 46.347656 44.960938 30.679688 44.960938 17.09375 C 44.960938 16.648438 44.949219 16.199219 44.933594 15.761719 C 46.941406 14.3125 48.683594 12.5 50.0625 10.4375 Z" />
                </svg>
              </a>
              <a
                rel="noopener noreferrer"
                href="#"
                title="GitHub"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 duration-150 text-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                >
                  <path d="M10.9,2.1c-4.6,0.5-8.3,4.2-8.8,8.7c-0.5,4.7,2.2,8.9,6.3,10.5C8.7,21.4,9,21.2,9,20.8v-1.6c0,0-0.4,0.1-0.9,0.1 c-1.4,0-2-1.2-2.1-1.9c-0.1-0.4-0.3-0.7-0.6-1C5.1,16.3,5,16.3,5,16.2C5,16,5.3,16,5.4,16c0.6,0,1.1,0.7,1.3,1c0.5,0.8,1.1,1,1.4,1 c0.4,0,0.7-0.1,0.9-0.2c0.1-0.7,0.4-1.4,1-1.8c-2.3-0.5-4-1.8-4-4c0-1.1,0.5-2.2,1.2-3C7.1,8.8,7,8.3,7,7.6C7,7.2,7,6.6,7.3,6 c0,0,1.4,0,2.8,1.3C10.6,7.1,11.3,7,12,7s1.4,0.1,2,0.3C15.3,6,16.8,6,16.8,6C17,6.6,17,7.2,17,7.6c0,0.8-0.1,1.2-0.2,1.4 c0.7,0.8,1.2,1.8,1.2,3c0,2.2-1.7,3.5-4,4c0.6,0.5,1,1.4,1,2.3v2.6c0,0.3,0.3,0.6,0.7,0.5c3.7-1.5,6.3-5.1,6.3-9.3 C22,6.1,16.9,1.4,10.9,2.1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
