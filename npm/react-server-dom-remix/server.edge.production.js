/**
 * @license React
 * react-server-dom-webpack-server.edge.production.min.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import aa from "react";
import ba from "react-dom";

var l = null,
  m = 0;
function n(a, b) {
  if (0 !== b.length)
    if (512 < b.length)
      0 < m &&
        (a.enqueue(new Uint8Array(l.buffer, 0, m)),
        (l = new Uint8Array(512)),
        (m = 0)),
        a.enqueue(b);
    else {
      var d = l.length - m;
      d < b.length &&
        (0 === d
          ? a.enqueue(l)
          : (l.set(b.subarray(0, d), m), a.enqueue(l), (b = b.subarray(d))),
        (l = new Uint8Array(512)),
        (m = 0));
      l.set(b, m);
      m += b.length;
    }
  return !0;
}
var p = new TextEncoder();
function ca(a, b) {
  "function" === typeof a.error ? a.error(b) : a.close();
}
var q = JSON.stringify;
function da(a, b, d) {
  a = q(d, a.toJSON);
  b = b.toString(16) + ":" + a + "\n";
  return p.encode(b);
}
function t(a, b, d) {
  a = q(d);
  b = b.toString(16) + ":" + a + "\n";
  return p.encode(b);
}
var u = Symbol.for("react.client.reference"),
  ea = Symbol.for("react.server.reference"),
  ka = { prefetchDNS: fa, preconnect: ha, preload: ia, preinit: ja };
function fa(a, b) {
  if ("string" === typeof a) {
    var d = v();
    if (d) {
      var c = d.hints,
        e = "D" + a;
      c.has(e) || (c.add(e), b ? A(d, "D", [a, b]) : A(d, "D", a), B(d));
    }
  }
}
function ha(a, b) {
  if ("string" === typeof a) {
    var d = v();
    if (d) {
      var c = d.hints,
        e =
          null == b || "string" !== typeof b.crossOrigin
            ? null
            : "use-credentials" === b.crossOrigin
            ? "use-credentials"
            : "";
      e = "C" + (null === e ? "null" : e) + "|" + a;
      c.has(e) || (c.add(e), b ? A(d, "C", [a, b]) : A(d, "C", a), B(d));
    }
  }
}
function ia(a, b) {
  if ("string" === typeof a) {
    var d = v();
    if (d) {
      var c = d.hints,
        e = "L" + a;
      c.has(e) || (c.add(e), A(d, "L", [a, b]), B(d));
    }
  }
}
function ja(a, b) {
  if ("string" === typeof a) {
    var d = v();
    if (d) {
      var c = d.hints,
        e = "I" + a;
      c.has(e) || (c.add(e), A(d, "I", [a, b]), B(d));
    }
  }
}
var la = ba.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Dispatcher,
  C = "function" === typeof AsyncLocalStorage,
  na = C ? new AsyncLocalStorage() : null,
  D = Symbol.for("react.element"),
  oa = Symbol.for("react.fragment"),
  pa = Symbol.for("react.provider"),
  qa = Symbol.for("react.server_context"),
  ra = Symbol.for("react.forward_ref"),
  sa = Symbol.for("react.suspense"),
  ta = Symbol.for("react.suspense_list"),
  ua = Symbol.for("react.memo"),
  E = Symbol.for("react.lazy"),
  va = Symbol.for("react.default_value"),
  wa = Symbol.for("react.memo_cache_sentinel"),
  xa = Symbol.iterator,
  F = null;
function G(a, b) {
  if (a !== b) {
    a.context._currentValue = a.parentValue;
    a = a.parent;
    var d = b.parent;
    if (null === a) {
      if (null !== d)
        throw Error(
          "The stacks must reach the root at the same time. This is a bug in React."
        );
    } else {
      if (null === d)
        throw Error(
          "The stacks must reach the root at the same time. This is a bug in React."
        );
      G(a, d);
      b.context._currentValue = b.value;
    }
  }
}
function ya(a) {
  a.context._currentValue = a.parentValue;
  a = a.parent;
  null !== a && ya(a);
}
function za(a) {
  var b = a.parent;
  null !== b && za(b);
  a.context._currentValue = a.value;
}
function Aa(a, b) {
  a.context._currentValue = a.parentValue;
  a = a.parent;
  if (null === a)
    throw Error(
      "The depth must equal at least at zero before reaching the root. This is a bug in React."
    );
  a.depth === b.depth ? G(a, b) : Aa(a, b);
}
function Ba(a, b) {
  var d = b.parent;
  if (null === d)
    throw Error(
      "The depth must equal at least at zero before reaching the root. This is a bug in React."
    );
  a.depth === d.depth ? G(a, d) : Ba(a, d);
  b.context._currentValue = b.value;
}
function H(a) {
  var b = F;
  b !== a &&
    (null === b
      ? za(a)
      : null === a
      ? ya(b)
      : b.depth === a.depth
      ? G(b, a)
      : b.depth > a.depth
      ? Aa(b, a)
      : Ba(b, a),
    (F = a));
}
function Ca(a, b) {
  var d = a._currentValue;
  a._currentValue = b;
  var c = F;
  return (F = a =
    {
      parent: c,
      depth: null === c ? 0 : c.depth + 1,
      context: a,
      parentValue: d,
      value: b,
    });
}
var Da = Error(
  "Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`"
);
function Ea() {}
function Fa(a, b, d) {
  d = a[d];
  void 0 === d ? a.push(b) : d !== b && (b.then(Ea, Ea), (b = d));
  switch (b.status) {
    case "fulfilled":
      return b.value;
    case "rejected":
      throw b.reason;
    default:
      if ("string" !== typeof b.status)
        switch (
          ((a = b),
          (a.status = "pending"),
          a.then(
            function (c) {
              if ("pending" === b.status) {
                var e = b;
                e.status = "fulfilled";
                e.value = c;
              }
            },
            function (c) {
              if ("pending" === b.status) {
                var e = b;
                e.status = "rejected";
                e.reason = c;
              }
            }
          ),
          b.status)
        ) {
          case "fulfilled":
            return b.value;
          case "rejected":
            throw b.reason;
        }
      I = b;
      throw Da;
  }
}
var I = null;
function Ga() {
  if (null === I)
    throw Error(
      "Expected a suspended thenable. This is a bug in React. Please file an issue."
    );
  var a = I;
  I = null;
  return a;
}
var J = null,
  K = 0,
  L = null;
function Ha() {
  var a = L;
  L = null;
  return a;
}
function Ia(a) {
  return a._currentValue;
}
var Ma = {
  useMemo: function (a) {
    return a();
  },
  useCallback: function (a) {
    return a;
  },
  useDebugValue: function () {},
  useDeferredValue: M,
  useTransition: M,
  readContext: Ia,
  useContext: Ia,
  useReducer: M,
  useRef: M,
  useState: M,
  useInsertionEffect: M,
  useLayoutEffect: M,
  useImperativeHandle: M,
  useEffect: M,
  useId: Ja,
  useMutableSource: M,
  useSyncExternalStore: M,
  useCacheRefresh: function () {
    return Ka;
  },
  useMemoCache: function (a) {
    for (var b = Array(a), d = 0; d < a; d++) b[d] = wa;
    return b;
  },
  use: La,
};
function M() {
  throw Error("This Hook is not supported in Server Components.");
}
function Ka() {
  throw Error("Refreshing the cache is not supported in Server Components.");
}
function Ja() {
  if (null === J)
    throw Error("useId can only be used while React is rendering");
  var a = J.identifierCount++;
  return ":" + J.identifierPrefix + "S" + a.toString(32) + ":";
}
function La(a) {
  if ((null !== a && "object" === typeof a) || "function" === typeof a) {
    if ("function" === typeof a.then) {
      var b = K;
      K += 1;
      null === L && (L = []);
      return Fa(L, a, b);
    }
    if (a.$$typeof === qa) return a._currentValue;
  }
  throw Error("An unsupported type was passed to use(): " + String(a));
}
function Na() {
  return new AbortController().signal;
}
function Oa() {
  var a = v();
  return a ? a.cache : new Map();
}
var Pa = {
    getCacheSignal: function () {
      var a = Oa(),
        b = a.get(Na);
      void 0 === b && ((b = Na()), a.set(Na, b));
      return b;
    },
    getCacheForType: function (a) {
      var b = Oa(),
        d = b.get(a);
      void 0 === d && ((d = a()), b.set(a, d));
      return d;
    },
  },
  Qa = Array.isArray;
function Ra(a) {
  return Object.prototype.toString
    .call(a)
    .replace(/^\[object (.*)\]$/, function (b, d) {
      return d;
    });
}
function Sa(a) {
  switch (typeof a) {
    case "string":
      return JSON.stringify(10 >= a.length ? a : a.slice(0, 10) + "...");
    case "object":
      if (Qa(a)) return "[...]";
      a = Ra(a);
      return "Object" === a ? "{...}" : a;
    case "function":
      return "function";
    default:
      return String(a);
  }
}
function N(a) {
  if ("string" === typeof a) return a;
  switch (a) {
    case sa:
      return "Suspense";
    case ta:
      return "SuspenseList";
  }
  if ("object" === typeof a)
    switch (a.$$typeof) {
      case ra:
        return N(a.render);
      case ua:
        return N(a.type);
      case E:
        var b = a._payload;
        a = a._init;
        try {
          return N(a(b));
        } catch (d) {}
    }
  return "";
}
function O(a, b) {
  var d = Ra(a);
  if ("Object" !== d && "Array" !== d) return d;
  d = -1;
  var c = 0;
  if (Qa(a)) {
    var e = "[";
    for (var f = 0; f < a.length; f++) {
      0 < f && (e += ", ");
      var g = a[f];
      g = "object" === typeof g && null !== g ? O(g) : Sa(g);
      "" + f === b
        ? ((d = e.length), (c = g.length), (e += g))
        : (e = 10 > g.length && 40 > e.length + g.length ? e + g : e + "...");
    }
    e += "]";
  } else if (a.$$typeof === D) e = "<" + N(a.type) + "/>";
  else {
    e = "{";
    f = Object.keys(a);
    for (g = 0; g < f.length; g++) {
      0 < g && (e += ", ");
      var h = f[g],
        k = JSON.stringify(h);
      e += ('"' + h + '"' === k ? h : k) + ": ";
      k = a[h];
      k = "object" === typeof k && null !== k ? O(k) : Sa(k);
      h === b
        ? ((d = e.length), (c = k.length), (e += k))
        : (e = 10 > k.length && 40 > e.length + k.length ? e + k : e + "...");
    }
    e += "}";
  }
  return void 0 === b
    ? e
    : -1 < d && 0 < c
    ? ((a = " ".repeat(d) + "^".repeat(c)), "\n  " + e + "\n  " + a)
    : "\n  " + e;
}
var Ta = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Ua = Ta.ContextRegistry,
  Va = Ta.ReactCurrentDispatcher,
  Wa = Ta.ReactCurrentCache;
function Xa(a) {
  console.error(a);
}
function Ya(a, b, d, c, e) {
  if (null !== Wa.current && Wa.current !== Pa)
    throw Error("Currently React only supports one RSC renderer at a time.");
  la.current = ka;
  Wa.current = Pa;
  var f = new Set(),
    g = [],
    h = new Set(),
    k = {
      status: 0,
      flushScheduled: !1,
      fatalError: null,
      destination: null,
      bundlerConfig: b,
      cache: new Map(),
      nextChunkId: 0,
      pendingChunks: 0,
      hints: h,
      abortableTasks: f,
      pingedTasks: g,
      completedImportChunks: [],
      completedHintChunks: [],
      completedJSONChunks: [],
      completedErrorChunks: [],
      writtenSymbols: new Map(),
      writtenClientReferences: new Map(),
      writtenServerReferences: new Map(),
      writtenProviders: new Map(),
      identifierPrefix: e || "",
      identifierCount: 1,
      onError: void 0 === d ? Xa : d,
      toJSON: function (r, w) {
        return Za(k, this, r, w);
      },
    };
  k.pendingChunks++;
  b = $a(c);
  a = ab(k, a, b, f);
  g.push(a);
  return k;
}
var P = null;
function v() {
  if (P) return P;
  if (C) {
    var a = na.getStore();
    if (a) return a;
  }
  return null;
}
var bb = {};
function cb(a, b) {
  a.pendingChunks++;
  var d = ab(a, null, F, a.abortableTasks);
  switch (b.status) {
    case "fulfilled":
      return (d.model = b.value), db(a, d), d.id;
    case "rejected":
      var c = Q(a, b.reason);
      R(a, d.id, c);
      return d.id;
    default:
      "string" !== typeof b.status &&
        ((b.status = "pending"),
        b.then(
          function (e) {
            "pending" === b.status && ((b.status = "fulfilled"), (b.value = e));
          },
          function (e) {
            "pending" === b.status && ((b.status = "rejected"), (b.reason = e));
          }
        ));
  }
  b.then(
    function (e) {
      d.model = e;
      db(a, d);
    },
    function (e) {
      d.status = 4;
      e = Q(a, e);
      R(a, d.id, e);
      null !== a.destination && S(a, a.destination);
    }
  );
  return d.id;
}
function eb(a) {
  if ("fulfilled" === a.status) return a.value;
  if ("rejected" === a.status) throw a.reason;
  throw a;
}
function fb(a) {
  switch (a.status) {
    case "fulfilled":
    case "rejected":
      break;
    default:
      "string" !== typeof a.status &&
        ((a.status = "pending"),
        a.then(
          function (b) {
            "pending" === a.status && ((a.status = "fulfilled"), (a.value = b));
          },
          function (b) {
            "pending" === a.status && ((a.status = "rejected"), (a.reason = b));
          }
        ));
  }
  return { $$typeof: E, _payload: a, _init: eb };
}
function T(a, b, d, c, e, f) {
  if (null !== c && void 0 !== c)
    throw Error(
      "Refs cannot be used in Server Components, nor passed to Client Components."
    );
  if ("function" === typeof b) {
    if (b.$$typeof === u) return [D, b, d, e];
    K = 0;
    L = f;
    e = b(e);
    return "object" === typeof e && null !== e && "function" === typeof e.then
      ? "fulfilled" === e.status
        ? e.value
        : fb(e)
      : e;
  }
  if ("string" === typeof b) return [D, b, d, e];
  if ("symbol" === typeof b) return b === oa ? e.children : [D, b, d, e];
  if (null != b && "object" === typeof b) {
    if (b.$$typeof === u) return [D, b, d, e];
    switch (b.$$typeof) {
      case E:
        var g = b._init;
        b = g(b._payload);
        return T(a, b, d, c, e, f);
      case ra:
        return (a = b.render), (K = 0), (L = f), a(e, void 0);
      case ua:
        return T(a, b.type, d, c, e, f);
      case pa:
        return (
          Ca(b._context, e.value),
          [D, b, d, { value: e.value, children: e.children, __pop: bb }]
        );
    }
  }
  throw Error("Unsupported Server Component type: " + Sa(b));
}
function db(a, b) {
  var d = a.pingedTasks;
  d.push(b);
  1 === d.length &&
    ((a.flushScheduled = null !== a.destination),
    setTimeout(function () {
      return gb(a);
    }, 0));
}
function ab(a, b, d, c) {
  var e = {
    id: a.nextChunkId++,
    status: 0,
    model: b,
    context: d,
    ping: function () {
      return db(a, e);
    },
    thenableState: null,
  };
  c.add(e);
  return e;
}
function hb(a, b, d, c) {
  var e = c.$$async ? c.$$id + "#async" : c.$$id,
    f = a.writtenClientReferences,
    g = f.get(e);
  if (void 0 !== g)
    return b[0] === D && "1" === d
      ? "$L" + g.toString(16)
      : "$" + g.toString(16);
  try {
    var h = a.bundlerConfig,
      k = c.$$id;
    g = "";
    var r = h[k];
    if (r) g = r.name;
    else {
      var w = k.lastIndexOf("#");
      -1 !== w && ((g = k.slice(w + 1)), (r = h[k.slice(0, w)]));
      if (!r)
        throw Error(
          'Could not find the module "' +
            k +
            '" in the React Client Manifest. This is probably a bug in the React Server Components bundler.'
        );
    }
    var x = { id: r.id, chunks: r.chunks, name: g, async: !!c.$$async };
    a.pendingChunks++;
    var y = a.nextChunkId++,
      ma = q(x),
      z = y.toString(16) + ":I" + ma + "\n";
    var vb = p.encode(z);
    a.completedImportChunks.push(vb);
    f.set(e, y);
    return b[0] === D && "1" === d
      ? "$L" + y.toString(16)
      : "$" + y.toString(16);
  } catch (wb) {
    return (
      a.pendingChunks++,
      (b = a.nextChunkId++),
      (d = Q(a, wb)),
      R(a, b, d),
      "$" + b.toString(16)
    );
  }
}
function Za(a, b, d, c) {
  switch (c) {
    case D:
      return "$";
  }
  for (
    ;
    "object" === typeof c &&
    null !== c &&
    (c.$$typeof === D || c.$$typeof === E);

  )
    try {
      switch (c.$$typeof) {
        case D:
          var e = c;
          c = T(a, e.type, e.key, e.ref, e.props, null);
          break;
        case E:
          var f = c._init;
          c = f(c._payload);
      }
    } catch (g) {
      d = g === Da ? Ga() : g;
      if ("object" === typeof d && null !== d && "function" === typeof d.then)
        return (
          a.pendingChunks++,
          (a = ab(a, c, F, a.abortableTasks)),
          (c = a.ping),
          d.then(c, c),
          (a.thenableState = Ha()),
          "$L" + a.id.toString(16)
        );
      a.pendingChunks++;
      c = a.nextChunkId++;
      d = Q(a, d);
      R(a, c, d);
      return "$L" + c.toString(16);
    }
  if (null === c) return null;
  if ("object" === typeof c) {
    if (c.$$typeof === u) return hb(a, b, d, c);
    if ("function" === typeof c.then) return "$@" + cb(a, c).toString(16);
    if (c.$$typeof === pa)
      return (
        (c = c._context._globalName),
        (b = a.writtenProviders),
        (d = b.get(d)),
        void 0 === d &&
          (a.pendingChunks++,
          (d = a.nextChunkId++),
          b.set(c, d),
          (c = t(a, d, "$P" + c)),
          a.completedJSONChunks.push(c)),
        "$" + d.toString(16)
      );
    if (c === bb) {
      a = F;
      if (null === a)
        throw Error(
          "Tried to pop a Context at the root of the app. This is a bug in React."
        );
      c = a.parentValue;
      a.context._currentValue = c === va ? a.context._defaultValue : c;
      F = a.parent;
      return;
    }
    return !Qa(c) &&
      (null === c || "object" !== typeof c
        ? (a = null)
        : ((a = (xa && c[xa]) || c["@@iterator"]),
          (a = "function" === typeof a ? a : null)),
      a)
      ? Array.from(c)
      : c;
  }
  if ("string" === typeof c) {
    if ("Z" === c[c.length - 1] && b[d] instanceof Date) return "$D" + c;
    a = "$" === c[0] ? "$" + c : c;
    return a;
  }
  if ("boolean" === typeof c) return c;
  if ("number" === typeof c)
    return (
      (a = c),
      Number.isFinite(a)
        ? 0 === a && -Infinity === 1 / a
          ? "$-0"
          : a
        : Infinity === a
        ? "$Infinity"
        : -Infinity === a
        ? "$-Infinity"
        : "$NaN"
    );
  if ("undefined" === typeof c) return "$undefined";
  if ("function" === typeof c) {
    if (c.$$typeof === u) return hb(a, b, d, c);
    if (c.$$typeof === ea)
      return (
        (d = a.writtenServerReferences),
        (b = d.get(c)),
        void 0 !== b
          ? (a = "$F" + b.toString(16))
          : ((b = c.$$bound),
            (e = { id: c.$$id, bound: b ? Promise.resolve(b) : null }),
            a.pendingChunks++,
            (b = a.nextChunkId++),
            (e = da(a, b, e)),
            a.completedJSONChunks.push(e),
            d.set(c, b),
            (a = "$F" + b.toString(16))),
        a
      );
    if (/^on[A-Z]/.test(d))
      throw Error(
        "Event handlers cannot be passed to Client Component props." +
          O(b, d) +
          "\nIf you need interactivity, consider converting part of this to a Client Component."
      );
    throw Error(
      'Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".' +
        O(b, d)
    );
  }
  if ("symbol" === typeof c) {
    e = a.writtenSymbols;
    f = e.get(c);
    if (void 0 !== f) return "$" + f.toString(16);
    f = c.description;
    if (Symbol.for(f) !== c)
      throw Error(
        "Only global symbols received from Symbol.for(...) can be passed to Client Components. The symbol Symbol.for(" +
          (c.description + ") cannot be found among global symbols.") +
          O(b, d)
      );
    a.pendingChunks++;
    d = a.nextChunkId++;
    b = t(a, d, "$S" + f);
    a.completedImportChunks.push(b);
    e.set(c, d);
    return "$" + d.toString(16);
  }
  if ("bigint" === typeof c) return "$n" + c.toString(10);
  throw Error(
    "Type " +
      typeof c +
      " is not supported in Client Component props." +
      O(b, d)
  );
}
function Q(a, b) {
  a = a.onError;
  b = a(b);
  if (null != b && "string" !== typeof b)
    throw Error(
      'onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "' +
        typeof b +
        '" instead'
    );
  return b || "";
}
function ib(a, b) {
  null !== a.destination
    ? ((a.status = 2), ca(a.destination, b))
    : ((a.status = 1), (a.fatalError = b));
}
function R(a, b, d) {
  d = { digest: d };
  b = b.toString(16) + ":E" + q(d) + "\n";
  b = p.encode(b);
  a.completedErrorChunks.push(b);
}
function A(a, b, d) {
  var c = a.nextChunkId++;
  d = q(d);
  b = "H" + b;
  c = c.toString(16) + ":" + b;
  c = p.encode(c + d + "\n");
  a.completedHintChunks.push(c);
}
function gb(a) {
  var b = Va.current;
  Va.current = Ma;
  var d = P;
  J = P = a;
  try {
    var c = a.pingedTasks;
    a.pingedTasks = [];
    for (var e = 0; e < c.length; e++) {
      var f = c[e];
      var g = a;
      if (0 === f.status) {
        H(f.context);
        try {
          var h = f.model;
          if ("object" === typeof h && null !== h && h.$$typeof === D) {
            var k = h,
              r = f.thenableState;
            f.model = h;
            h = T(g, k.type, k.key, k.ref, k.props, r);
            for (
              f.thenableState = null;
              "object" === typeof h && null !== h && h.$$typeof === D;

            )
              (k = h),
                (f.model = h),
                (h = T(g, k.type, k.key, k.ref, k.props, null));
          }
          var w = da(g, f.id, h);
          g.completedJSONChunks.push(w);
          g.abortableTasks.delete(f);
          f.status = 1;
        } catch (z) {
          var x = z === Da ? Ga() : z;
          if (
            "object" === typeof x &&
            null !== x &&
            "function" === typeof x.then
          ) {
            var y = f.ping;
            x.then(y, y);
            f.thenableState = Ha();
          } else {
            g.abortableTasks.delete(f);
            f.status = 4;
            var ma = Q(g, x);
            R(g, f.id, ma);
          }
        }
      }
    }
    null !== a.destination && S(a, a.destination);
  } catch (z) {
    Q(a, z), ib(a, z);
  } finally {
    (Va.current = b), (J = null), (P = d);
  }
}
function S(a, b) {
  l = new Uint8Array(512);
  m = 0;
  try {
    for (var d = a.completedImportChunks, c = 0; c < d.length; c++)
      a.pendingChunks--, n(b, d[c]);
    d.splice(0, c);
    var e = a.completedHintChunks;
    for (c = 0; c < e.length; c++) n(b, e[c]);
    e.splice(0, c);
    var f = a.completedJSONChunks;
    for (c = 0; c < f.length; c++) a.pendingChunks--, n(b, f[c]);
    f.splice(0, c);
    var g = a.completedErrorChunks;
    for (c = 0; c < g.length; c++) a.pendingChunks--, n(b, g[c]);
    g.splice(0, c);
  } finally {
    (a.flushScheduled = !1),
      l &&
        0 < m &&
        (b.enqueue(new Uint8Array(l.buffer, 0, m)), (l = null), (m = 0));
  }
  0 === a.pendingChunks && b.close();
}
function jb(a) {
  a.flushScheduled = null !== a.destination;
  C
    ? setTimeout(function () {
        return na.run(a, gb, a);
      }, 0)
    : setTimeout(function () {
        return gb(a);
      }, 0);
}
function B(a) {
  if (
    !1 === a.flushScheduled &&
    0 === a.pingedTasks.length &&
    null !== a.destination
  ) {
    var b = a.destination;
    a.flushScheduled = !0;
    setTimeout(function () {
      return S(a, b);
    }, 0);
  }
}
function kb(a, b) {
  try {
    var d = a.abortableTasks;
    if (0 < d.size) {
      var c = Q(
        a,
        void 0 === b
          ? Error("The render was aborted by the server without a reason.")
          : b
      );
      a.pendingChunks++;
      var e = a.nextChunkId++;
      R(a, e, c);
      d.forEach(function (f) {
        f.status = 3;
        var g = "$" + e.toString(16);
        f = t(a, f.id, g);
        a.completedErrorChunks.push(f);
      });
      d.clear();
    }
    null !== a.destination && S(a, a.destination);
  } catch (f) {
    Q(a, f), ib(a, f);
  }
}
function $a(a) {
  if (a) {
    var b = F;
    H(null);
    for (var d = 0; d < a.length; d++) {
      var c = a[d],
        e = c[0];
      c = c[1];
      Ua[e] || (Ua[e] = aa.createServerContext(e, va));
      Ca(Ua[e], c);
    }
    a = F;
    H(b);
    return a;
  }
  return null;
}
function lb(a, b) {
  var d = "",
    c = a[b];
  if (c) d = c.name;
  else {
    var e = b.lastIndexOf("#");
    -1 !== e && ((d = b.slice(e + 1)), (c = a[b.slice(0, e)]));
    if (!c)
      throw Error(
        'Could not find the module "' +
          b +
          '" in the React Server Manifest. This is probably a bug in the React Server Components bundler.'
      );
  }
  return { id: c.id, chunks: c.chunks, name: d, async: !1 };
}
var U = new Map(),
  mb = new Map();
function nb() {}
function ob(a) {
  for (var b = a.chunks, d = [], c = 0; c < b.length; c++) {
    var e = b[c],
      f = U.get(e);
    if (void 0 === f) {
      f = __webpack_chunk_load__(e);
      d.push(f);
      var g = U.set.bind(U, e, null);
      f.then(g, nb);
      U.set(e, f);
    } else null !== f && d.push(f);
  }
  if (a.async) {
    if ((b = mb.get(a.id))) return "fulfilled" === b.status ? null : b;
    var h = Promise.all(d).then(function () {
      return __webpack_require__(a.id);
    });
    h.then(
      function (k) {
        h.status = "fulfilled";
        h.value = k;
      },
      function (k) {
        h.status = "rejected";
        h.reason = k;
      }
    );
    mb.set(a.id, h);
    return h;
  }
  return 0 < d.length ? Promise.all(d) : null;
}
function V(a) {
  if (a.async) {
    var b = mb.get(a.id);
    if ("fulfilled" === b.status) b = b.value;
    else throw b.reason;
  } else b = __webpack_require__(a.id);
  return "*" === a.name
    ? b
    : "" === a.name
    ? b.__esModule
      ? b.default
      : b
    : b[a.name];
}
function W(a, b, d, c) {
  this.status = a;
  this.value = b;
  this.reason = d;
  this._response = c;
}
W.prototype = Object.create(Promise.prototype);
W.prototype.then = function (a, b) {
  switch (this.status) {
    case "resolved_model":
      pb(this);
  }
  switch (this.status) {
    case "fulfilled":
      a(this.value);
      break;
    case "pending":
    case "blocked":
      a && (null === this.value && (this.value = []), this.value.push(a));
      b && (null === this.reason && (this.reason = []), this.reason.push(b));
      break;
    default:
      b(this.reason);
  }
};
function qb(a, b) {
  for (var d = 0; d < a.length; d++) (0, a[d])(b);
}
function rb(a, b) {
  if ("pending" === a.status || "blocked" === a.status) {
    var d = a.reason;
    a.status = "rejected";
    a.reason = b;
    null !== d && qb(d, b);
  }
}
function sb(a, b, d, c, e, f) {
  var g = lb(a._bundlerConfig, b);
  a = ob(g);
  if (d)
    d = Promise.all([d, a]).then(function (h) {
      h = h[0];
      var k = V(g);
      return k.bind.apply(k, [null].concat(h));
    });
  else if (a)
    d = Promise.resolve(a).then(function () {
      return V(g);
    });
  else return V(g);
  d.then(tb(c, e, f), ub(c));
  return null;
}
var X = null,
  Y = null;
function pb(a) {
  var b = X,
    d = Y;
  X = a;
  Y = null;
  try {
    var c = JSON.parse(a.value, a._response._fromJSON);
    null !== Y && 0 < Y.deps
      ? ((Y.value = c),
        (a.status = "blocked"),
        (a.value = null),
        (a.reason = null))
      : ((a.status = "fulfilled"), (a.value = c));
  } catch (e) {
    (a.status = "rejected"), (a.reason = e);
  } finally {
    (X = b), (Y = d);
  }
}
function xb(a, b) {
  a._chunks.forEach(function (d) {
    "pending" === d.status && rb(d, b);
  });
}
function Z(a, b) {
  var d = a._chunks,
    c = d.get(b);
  c ||
    ((c = a._formData.get(a._prefix + b)),
    (c =
      null != c
        ? new W("resolved_model", c, null, a)
        : new W("pending", null, null, a)),
    d.set(b, c));
  return c;
}
function tb(a, b, d) {
  if (Y) {
    var c = Y;
    c.deps++;
  } else c = Y = { deps: 1, value: null };
  return function (e) {
    b[d] = e;
    c.deps--;
    0 === c.deps &&
      "blocked" === a.status &&
      ((e = a.value),
      (a.status = "fulfilled"),
      (a.value = c.value),
      null !== e && qb(e, c.value));
  };
}
function ub(a) {
  return function (b) {
    return rb(a, b);
  };
}
function yb(a, b, d, c) {
  if ("$" === c[0])
    switch (c[1]) {
      case "$":
        return c.slice(1);
      case "@":
        return (b = parseInt(c.slice(2), 16)), Z(a, b);
      case "S":
        return Symbol.for(c.slice(2));
      case "F":
        c = parseInt(c.slice(2), 16);
        c = Z(a, c);
        "resolved_model" === c.status && pb(c);
        if ("fulfilled" !== c.status) throw c.reason;
        c = c.value;
        return sb(a, c.id, c.bound, X, b, d);
      case "K":
        b = c.slice(2);
        var e = a._prefix + b + "_",
          f = new FormData();
        a._formData.forEach(function (g, h) {
          h.startsWith(e) && f.append(h.slice(e.length), g);
        });
        return f;
      case "I":
        return Infinity;
      case "-":
        return "$-0" === c ? -0 : -Infinity;
      case "N":
        return NaN;
      case "u":
        return;
      case "D":
        return new Date(Date.parse(c.slice(2)));
      case "n":
        return BigInt(c.slice(2));
      default:
        c = parseInt(c.slice(1), 16);
        a = Z(a, c);
        switch (a.status) {
          case "resolved_model":
            pb(a);
        }
        switch (a.status) {
          case "fulfilled":
            return a.value;
          case "pending":
          case "blocked":
            return (c = X), a.then(tb(c, b, d), ub(c)), null;
          default:
            throw a.reason;
        }
    }
  return c;
}
function zb(a, b) {
  var d =
      2 < arguments.length && void 0 !== arguments[2]
        ? arguments[2]
        : new FormData(),
    c = new Map(),
    e = {
      _bundlerConfig: a,
      _prefix: b,
      _formData: d,
      _chunks: c,
      _fromJSON: function (f, g) {
        return "string" === typeof g ? yb(e, this, f, g) : g;
      },
    };
  return e;
}
function Ab(a) {
  xb(a, Error("Connection closed."));
}
function Bb(a, b, d) {
  var c = lb(a, b);
  a = ob(c);
  return d
    ? Promise.all([d, a]).then(function (e) {
        e = e[0];
        var f = V(c);
        return f.bind.apply(f, [null].concat(e));
      })
    : a
    ? Promise.resolve(a).then(function () {
        return V(c);
      })
    : Promise.resolve(V(c));
}
export const decodeAction = function (a, b) {
  var d = new FormData(),
    c = null;
  a.forEach(function (e, f) {
    if (f.startsWith("$ACTION_"))
      if (f.startsWith("$ACTION_REF_")) {
        e = "$ACTION_" + f.slice(12) + ":";
        e = zb(b, e, a);
        Ab(e);
        e = Z(e, 0);
        e.then(function () {});
        if ("fulfilled" !== e.status) throw e.reason;
        e = e.value;
        c = Bb(b, e.id, e.bound);
      } else
        f.startsWith("$ACTION_ID_") &&
          ((e = f.slice(11)), (c = Bb(b, e, null)));
    else d.append(f, e);
  });
  return null === c
    ? null
    : c.then(function (e) {
        return e.bind(null, d);
      });
};
export const decodeReply = function (a, b) {
  if ("string" === typeof a) {
    var d = new FormData();
    d.append("0", a);
    a = d;
  }
  a = zb(b, "", a);
  Ab(a);
  return Z(a, 0);
};
export const renderToReadableStream = function (a, b, d) {
  var c = Ya(
    a,
    b,
    d ? d.onError : void 0,
    d ? d.context : void 0,
    d ? d.identifierPrefix : void 0
  );
  if (d && d.signal) {
    var e = d.signal;
    if (e.aborted) kb(c, e.reason);
    else {
      var f = function () {
        kb(c, e.reason);
        e.removeEventListener("abort", f);
      };
      e.addEventListener("abort", f);
    }
  }
  return new ReadableStream(
    {
      type: "bytes",
      start: function () {
        jb(c);
      },
      pull: function (g) {
        if (1 === c.status) (c.status = 2), ca(g, c.fatalError);
        else if (2 !== c.status && null === c.destination) {
          c.destination = g;
          try {
            S(c, g);
          } catch (h) {
            Q(c, h), ib(c, h);
          }
        }
      },
      cancel: function () {},
    },
    { highWaterMark: 0 }
  );
};
