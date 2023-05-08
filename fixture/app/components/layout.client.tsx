"use client";

import * as React from "react";
import { Popover, Transition } from "@headlessui/react";
import { usePopper } from "react-popper";

import { useLocation, useNavigation } from "remix/client";

export function CartPopover({ button, children, openable }) {
  let [referenceElement, setReferenceElement] =
    React.useState<HTMLButtonElement>();
  let [popperElement, setPopperElement] = React.useState<HTMLDivElement>();
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-end",
  });

  if (!openable) return button;
  return (
    <Popover>
      {({ open, close }) => (
        <>
          <Popover.Button ref={setReferenceElement}>{button}</Popover.Button>
          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="fixed inset-0 z-30">
              <HandleInteractions open={open} close={close} />
              <Popover.Overlay className="fixed inset-0 bg-black opacity-30" />
              <div
                className="w-screen max-w-sm lg:max-w-3xl"
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
              >
                <div className="px-4 sm:px-0">{children}</div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

function HandleInteractions({ close, open }) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

  const location = useLocation();
  const navigation = useNavigation();
  const [lastKey, setLastKey] = React.useState(
    location.pathname + location.search
  );
  React.useEffect(() => {
    const newKey = location.pathname + location.search;
    if (newKey !== lastKey && !navigation.transitioning) {
      close();
      setLastKey(newKey);
    }
  }, [open, location, navigation, lastKey, setLastKey]);

  return null;
}
