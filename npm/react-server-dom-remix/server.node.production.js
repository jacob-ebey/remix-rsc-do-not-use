/**
 * @license React
 * react-server-dom-webpack-server.node.production.min.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";
import ca from "react";
import aa from "async_hooks";
import ba from "util";
import da from "react-dom";

var l = null,
  m = 0,
  p = !0;
function r(a, b) {
  a = a.write(b);
  p = p && a;
}
function t(a, b) {
  if ("string" === typeof b) {
    if (0 !== b.length)
      if (2048 < 3 * b.length)
        0 < m && (r(a, l.subarray(0, m)), (l = new Uint8Array(2048)), (m = 0)),
          r(a, ea.encode(b));
      else {
        var d = l;
        0 < m && (d = l.subarray(m));
        d = ea.encodeInto(b, d);
        var c = d.read;
        m += d.written;
        c < b.length &&
          (r(a, l.subarray(0, m)),
          (l = new Uint8Array(2048)),
          (m = ea.encodeInto(b.slice(c), l).written));
        2048 === m && (r(a, l), (l = new Uint8Array(2048)), (m = 0));
      }
  } else
    0 !== b.byteLength &&
      (2048 < b.byteLength
        ? (0 < m &&
            (r(a, l.subarray(0, m)), (l = new Uint8Array(2048)), (m = 0)),
          r(a, b))
        : ((d = l.length - m),
          d < b.byteLength &&
            (0 === d
              ? r(a, l)
              : (l.set(b.subarray(0, d), m),
                (m += d),
                r(a, l),
                (b = b.subarray(d))),
            (l = new Uint8Array(2048)),
            (m = 0)),
          l.set(b, m),
          (m += b.byteLength),
          2048 === m && (r(a, l), (l = new Uint8Array(2048)), (m = 0))));
  return p;
}
var ea = new ba.TextEncoder(),
  v = JSON.stringify;
function fa(a, b, d) {
  a = v(d, a.toJSON);
  return b.toString(16) + ":" + a + "\n";
}
function ha(a, b, d) {
  a = v(d);
  return b.toString(16) + ":" + a + "\n";
}
var w = Symbol.for("react.client.reference"),
  ia = Symbol.for("react.server.reference"),
  na = { prefetchDNS: ja, preconnect: ka, preload: la, preinit: ma };
function ja(a, b) {
  if ("string" === typeof a) {
    var d = x();
    if (d) {
      var c = d.hints,
        e = "D" + a;
      c.has(e) || (c.add(e), b ? y(d, "D", [a, b]) : y(d, "D", a), B(d));
    }
  }
}
function ka(a, b) {
  if ("string" === typeof a) {
    var d = x();
    if (d) {
      var c = d.hints,
        e =
          null == b || "string" !== typeof b.crossOrigin
            ? null
            : "use-credentials" === b.crossOrigin
            ? "use-credentials"
            : "";
      e = "C" + (null === e ? "null" : e) + "|" + a;
      c.has(e) || (c.add(e), b ? y(d, "C", [a, b]) : y(d, "C", a), B(d));
    }
  }
}
function la(a, b) {
  if ("string" === typeof a) {
    var d = x();
    if (d) {
      var c = d.hints,
        e = "L" + a;
      c.has(e) || (c.add(e), y(d, "L", [a, b]), B(d));
    }
  }
}
function ma(a, b) {
  if ("string" === typeof a) {
    var d = x();
    if (d) {
      var c = d.hints,
        e = "I" + a;
      c.has(e) || (c.add(e), y(d, "I", [a, b]), B(d));
    }
  }
}
var pa = da.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Dispatcher,
  qa = new aa.AsyncLocalStorage(),
  C = Symbol.for("react.element"),
  ra = Symbol.for("react.fragment"),
  sa = Symbol.for("react.provider"),
  ta = Symbol.for("react.server_context"),
  ua = Symbol.for("react.forward_ref"),
  va = Symbol.for("react.suspense"),
  wa = Symbol.for("react.suspense_list"),
  xa = Symbol.for("react.memo"),
  D = Symbol.for("react.lazy"),
  ya = Symbol.for("react.default_value"),
  za = Symbol.for("react.memo_cache_sentinel"),
  Aa = Symbol.iterator,
  E = null;
function F(a, b) {
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
      F(a, d);
      b.context._currentValue = b.value;
    }
  }
}
function Ba(a) {
  a.context._currentValue = a.parentValue;
  a = a.parent;
  null !== a && Ba(a);
}
function Ca(a) {
  var b = a.parent;
  null !== b && Ca(b);
  a.context._currentValue = a.value;
}
function Da(a, b) {
  a.context._currentValue = a.parentValue;
  a = a.parent;
  if (null === a)
    throw Error(
      "The depth must equal at least at zero before reaching the root. This is a bug in React."
    );
  a.depth === b.depth ? F(a, b) : Da(a, b);
}
function Ea(a, b) {
  var d = b.parent;
  if (null === d)
    throw Error(
      "The depth must equal at least at zero before reaching the root. This is a bug in React."
    );
  a.depth === d.depth ? F(a, d) : Ea(a, d);
  b.context._currentValue = b.value;
}
function Fa(a) {
  var b = E;
  b !== a &&
    (null === b
      ? Ca(a)
      : null === a
      ? Ba(b)
      : b.depth === a.depth
      ? F(b, a)
      : b.depth > a.depth
      ? Da(b, a)
      : Ea(b, a),
    (E = a));
}
function Ga(a, b) {
  var d = a._currentValue;
  a._currentValue = b;
  var c = E;
  return (E = a =
    {
      parent: c,
      depth: null === c ? 0 : c.depth + 1,
      context: a,
      parentValue: d,
      value: b,
    });
}
var Ha = Error(
  "Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`"
);
function Ia() {}
function Ja(a, b, d) {
  d = a[d];
  void 0 === d ? a.push(b) : d !== b && (b.then(Ia, Ia), (b = d));
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
      G = b;
      throw Ha;
  }
}
var G = null;
function Ka() {
  if (null === G)
    throw Error(
      "Expected a suspended thenable. This is a bug in React. Please file an issue."
    );
  var a = G;
  G = null;
  return a;
}
var H = null,
  I = 0,
  J = null;
function La() {
  var a = J;
  J = null;
  return a;
}
function Ma(a) {
  return a._currentValue;
}
var Qa = {
  useMemo: function (a) {
    return a();
  },
  useCallback: function (a) {
    return a;
  },
  useDebugValue: function () {},
  useDeferredValue: K,
  useTransition: K,
  readContext: Ma,
  useContext: Ma,
  useReducer: K,
  useRef: K,
  useState: K,
  useInsertionEffect: K,
  useLayoutEffect: K,
  useImperativeHandle: K,
  useEffect: K,
  useId: Na,
  useMutableSource: K,
  useSyncExternalStore: K,
  useCacheRefresh: function () {
    return Oa;
  },
  useMemoCache: function (a) {
    for (var b = Array(a), d = 0; d < a; d++) b[d] = za;
    return b;
  },
  use: Pa,
};
function K() {
  throw Error("This Hook is not supported in Server Components.");
}
function Oa() {
  throw Error("Refreshing the cache is not supported in Server Components.");
}
function Na() {
  if (null === H)
    throw Error("useId can only be used while React is rendering");
  var a = H.identifierCount++;
  return ":" + H.identifierPrefix + "S" + a.toString(32) + ":";
}
function Pa(a) {
  if ((null !== a && "object" === typeof a) || "function" === typeof a) {
    if ("function" === typeof a.then) {
      var b = I;
      I += 1;
      null === J && (J = []);
      return Ja(J, a, b);
    }
    if (a.$$typeof === ta) return a._currentValue;
  }
  throw Error("An unsupported type was passed to use(): " + String(a));
}
function Ra() {
  return new AbortController().signal;
}
function Sa() {
  var a = x();
  return a ? a.cache : new Map();
}
var Ta = {
    getCacheSignal: function () {
      var a = Sa(),
        b = a.get(Ra);
      void 0 === b && ((b = Ra()), a.set(Ra, b));
      return b;
    },
    getCacheForType: function (a) {
      var b = Sa(),
        d = b.get(a);
      void 0 === d && ((d = a()), b.set(a, d));
      return d;
    },
  },
  Ua = Array.isArray;
function Va(a) {
  return Object.prototype.toString
    .call(a)
    .replace(/^\[object (.*)\]$/, function (b, d) {
      return d;
    });
}
function Wa(a) {
  switch (typeof a) {
    case "string":
      return JSON.stringify(10 >= a.length ? a : a.slice(0, 10) + "...");
    case "object":
      if (Ua(a)) return "[...]";
      a = Va(a);
      return "Object" === a ? "{...}" : a;
    case "function":
      return "function";
    default:
      return String(a);
  }
}
function L(a) {
  if ("string" === typeof a) return a;
  switch (a) {
    case va:
      return "Suspense";
    case wa:
      return "SuspenseList";
  }
  if ("object" === typeof a)
    switch (a.$$typeof) {
      case ua:
        return L(a.render);
      case xa:
        return L(a.type);
      case D:
        var b = a._payload;
        a = a._init;
        try {
          return L(a(b));
        } catch (d) {}
    }
  return "";
}
function M(a, b) {
  var d = Va(a);
  if ("Object" !== d && "Array" !== d) return d;
  d = -1;
  var c = 0;
  if (Ua(a)) {
    var e = "[";
    for (var f = 0; f < a.length; f++) {
      0 < f && (e += ", ");
      var g = a[f];
      g = "object" === typeof g && null !== g ? M(g) : Wa(g);
      "" + f === b
        ? ((d = e.length), (c = g.length), (e += g))
        : (e = 10 > g.length && 40 > e.length + g.length ? e + g : e + "...");
    }
    e += "]";
  } else if (a.$$typeof === C) e = "<" + L(a.type) + "/>";
  else {
    e = "{";
    f = Object.keys(a);
    for (g = 0; g < f.length; g++) {
      0 < g && (e += ", ");
      var h = f[g],
        k = JSON.stringify(h);
      e += ('"' + h + '"' === k ? h : k) + ": ";
      k = a[h];
      k = "object" === typeof k && null !== k ? M(k) : Wa(k);
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
var Xa = ca.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Ya = Xa.ContextRegistry,
  Za = Xa.ReactCurrentDispatcher,
  $a = Xa.ReactCurrentCache;
function ab(a) {
  console.error(a);
}
function bb(a, b, d, c, e) {
  if (null !== $a.current && $a.current !== Ta)
    throw Error("Currently React only supports one RSC renderer at a time.");
  pa.current = na;
  $a.current = Ta;
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
      onError: void 0 === d ? ab : d,
      toJSON: function (q, u) {
        return cb(k, this, q, u);
      },
    };
  k.pendingChunks++;
  b = db(c);
  a = eb(k, a, b, f);
  g.push(a);
  return k;
}
var N = null;
function x() {
  if (N) return N;
  var a = qa.getStore();
  return a ? a : null;
}
var fb = {};
function gb(a, b) {
  a.pendingChunks++;
  var d = eb(a, null, E, a.abortableTasks);
  switch (b.status) {
    case "fulfilled":
      return (d.model = b.value), hb(a, d), d.id;
    case "rejected":
      var c = O(a, b.reason);
      P(a, d.id, c);
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
      hb(a, d);
    },
    function (e) {
      d.status = 4;
      e = O(a, e);
      P(a, d.id, e);
      null !== a.destination && Q(a, a.destination);
    }
  );
  return d.id;
}
function ib(a) {
  if ("fulfilled" === a.status) return a.value;
  if ("rejected" === a.status) throw a.reason;
  throw a;
}
function jb(a) {
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
  return { $$typeof: D, _payload: a, _init: ib };
}
function R(a, b, d, c, e, f) {
  if (null !== c && void 0 !== c)
    throw Error(
      "Refs cannot be used in Server Components, nor passed to Client Components."
    );
  if ("function" === typeof b) {
    if (b.$$typeof === w) return [C, b, d, e];
    I = 0;
    J = f;
    e = b(e);
    return "object" === typeof e && null !== e && "function" === typeof e.then
      ? "fulfilled" === e.status
        ? e.value
        : jb(e)
      : e;
  }
  if ("string" === typeof b) return [C, b, d, e];
  if ("symbol" === typeof b) return b === ra ? e.children : [C, b, d, e];
  if (null != b && "object" === typeof b) {
    if (b.$$typeof === w) return [C, b, d, e];
    switch (b.$$typeof) {
      case D:
        var g = b._init;
        b = g(b._payload);
        return R(a, b, d, c, e, f);
      case ua:
        return (a = b.render), (I = 0), (J = f), a(e, void 0);
      case xa:
        return R(a, b.type, d, c, e, f);
      case sa:
        return (
          Ga(b._context, e.value),
          [C, b, d, { value: e.value, children: e.children, __pop: fb }]
        );
    }
  }
  throw Error("Unsupported Server Component type: " + Wa(b));
}
function hb(a, b) {
  var d = a.pingedTasks;
  d.push(b);
  1 === d.length &&
    ((a.flushScheduled = null !== a.destination),
    setImmediate(function () {
      return kb(a);
    }));
}
function eb(a, b, d, c) {
  var e = {
    id: a.nextChunkId++,
    status: 0,
    model: b,
    context: d,
    ping: function () {
      return hb(a, e);
    },
    thenableState: null,
  };
  c.add(e);
  return e;
}
function lb(a, b, d, c) {
  var e = c.$$async ? c.$$id + "#async" : c.$$id,
    f = a.writtenClientReferences,
    g = f.get(e);
  if (void 0 !== g)
    return b[0] === C && "1" === d
      ? "$L" + g.toString(16)
      : "$" + g.toString(16);
  try {
    var h = a.bundlerConfig,
      k = c.$$id;
    g = "";
    var q = h[k];
    if (q) g = q.name;
    else {
      var u = k.lastIndexOf("#");
      -1 !== u && ((g = k.slice(u + 1)), (q = h[k.slice(0, u)]));
      if (!q)
        throw Error(
          'Could not find the module "' +
            k +
            '" in the React Client Manifest. This is probably a bug in the React Server Components bundler.'
        );
    }
    var n = { id: q.id, chunks: q.chunks, name: g, async: !!c.$$async };
    a.pendingChunks++;
    var z = a.nextChunkId++,
      oa = v(n);
    var A = z.toString(16) + ":I" + oa + "\n";
    a.completedImportChunks.push(A);
    f.set(e, z);
    return b[0] === C && "1" === d
      ? "$L" + z.toString(16)
      : "$" + z.toString(16);
  } catch (zb) {
    return (
      a.pendingChunks++,
      (b = a.nextChunkId++),
      (d = O(a, zb)),
      P(a, b, d),
      "$" + b.toString(16)
    );
  }
}
function cb(a, b, d, c) {
  switch (c) {
    case C:
      return "$";
  }
  for (
    ;
    "object" === typeof c &&
    null !== c &&
    (c.$$typeof === C || c.$$typeof === D);

  )
    try {
      switch (c.$$typeof) {
        case C:
          var e = c;
          c = R(a, e.type, e.key, e.ref, e.props, null);
          break;
        case D:
          var f = c._init;
          c = f(c._payload);
      }
    } catch (g) {
      d = g === Ha ? Ka() : g;
      if ("object" === typeof d && null !== d && "function" === typeof d.then)
        return (
          a.pendingChunks++,
          (a = eb(a, c, E, a.abortableTasks)),
          (c = a.ping),
          d.then(c, c),
          (a.thenableState = La()),
          "$L" + a.id.toString(16)
        );
      a.pendingChunks++;
      c = a.nextChunkId++;
      d = O(a, d);
      P(a, c, d);
      return "$L" + c.toString(16);
    }
  if (null === c) return null;
  if ("object" === typeof c) {
    if (c.$$typeof === w) return lb(a, b, d, c);
    if ("function" === typeof c.then) return "$@" + gb(a, c).toString(16);
    if (c.$$typeof === sa)
      return (
        (c = c._context._globalName),
        (b = a.writtenProviders),
        (d = b.get(d)),
        void 0 === d &&
          (a.pendingChunks++,
          (d = a.nextChunkId++),
          b.set(c, d),
          (c = ha(a, d, "$P" + c)),
          a.completedJSONChunks.push(c)),
        "$" + d.toString(16)
      );
    if (c === fb) {
      a = E;
      if (null === a)
        throw Error(
          "Tried to pop a Context at the root of the app. This is a bug in React."
        );
      c = a.parentValue;
      a.context._currentValue = c === ya ? a.context._defaultValue : c;
      E = a.parent;
      return;
    }
    return !Ua(c) &&
      (null === c || "object" !== typeof c
        ? (a = null)
        : ((a = (Aa && c[Aa]) || c["@@iterator"]),
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
    if (c.$$typeof === w) return lb(a, b, d, c);
    if (c.$$typeof === ia)
      return (
        (d = a.writtenServerReferences),
        (b = d.get(c)),
        void 0 !== b
          ? (a = "$F" + b.toString(16))
          : ((b = c.$$bound),
            (e = { id: c.$$id, bound: b ? Promise.resolve(b) : null }),
            a.pendingChunks++,
            (b = a.nextChunkId++),
            (e = fa(a, b, e)),
            a.completedJSONChunks.push(e),
            d.set(c, b),
            (a = "$F" + b.toString(16))),
        a
      );
    if (/^on[A-Z]/.test(d))
      throw Error(
        "Event handlers cannot be passed to Client Component props." +
          M(b, d) +
          "\nIf you need interactivity, consider converting part of this to a Client Component."
      );
    throw Error(
      'Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".' +
        M(b, d)
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
          M(b, d)
      );
    a.pendingChunks++;
    d = a.nextChunkId++;
    b = ha(a, d, "$S" + f);
    a.completedImportChunks.push(b);
    e.set(c, d);
    return "$" + d.toString(16);
  }
  if ("bigint" === typeof c) return "$n" + c.toString(10);
  throw Error(
    "Type " +
      typeof c +
      " is not supported in Client Component props." +
      M(b, d)
  );
}
function O(a, b) {
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
function mb(a, b) {
  null !== a.destination
    ? ((a.status = 2), a.destination.destroy(b))
    : ((a.status = 1), (a.fatalError = b));
}
function P(a, b, d) {
  d = { digest: d };
  b = b.toString(16) + ":E" + v(d) + "\n";
  a.completedErrorChunks.push(b);
}
function y(a, b, d) {
  var c = a.nextChunkId++;
  d = v(d);
  b = "H" + b;
  c = c.toString(16) + ":" + b;
  a.completedHintChunks.push(c + d + "\n");
}
function kb(a) {
  var b = Za.current;
  Za.current = Qa;
  var d = N;
  H = N = a;
  try {
    var c = a.pingedTasks;
    a.pingedTasks = [];
    for (var e = 0; e < c.length; e++) {
      var f = c[e];
      var g = a;
      if (0 === f.status) {
        Fa(f.context);
        try {
          var h = f.model;
          if ("object" === typeof h && null !== h && h.$$typeof === C) {
            var k = h,
              q = f.thenableState;
            f.model = h;
            h = R(g, k.type, k.key, k.ref, k.props, q);
            for (
              f.thenableState = null;
              "object" === typeof h && null !== h && h.$$typeof === C;

            )
              (k = h),
                (f.model = h),
                (h = R(g, k.type, k.key, k.ref, k.props, null));
          }
          var u = fa(g, f.id, h);
          g.completedJSONChunks.push(u);
          g.abortableTasks.delete(f);
          f.status = 1;
        } catch (A) {
          var n = A === Ha ? Ka() : A;
          if (
            "object" === typeof n &&
            null !== n &&
            "function" === typeof n.then
          ) {
            var z = f.ping;
            n.then(z, z);
            f.thenableState = La();
          } else {
            g.abortableTasks.delete(f);
            f.status = 4;
            var oa = O(g, n);
            P(g, f.id, oa);
          }
        }
      }
    }
    null !== a.destination && Q(a, a.destination);
  } catch (A) {
    O(a, A), mb(a, A);
  } finally {
    (Za.current = b), (H = null), (N = d);
  }
}
function Q(a, b) {
  l = new Uint8Array(2048);
  m = 0;
  p = !0;
  try {
    for (var d = a.completedImportChunks, c = 0; c < d.length; c++)
      if ((a.pendingChunks--, !t(b, d[c]))) {
        a.destination = null;
        c++;
        break;
      }
    d.splice(0, c);
    var e = a.completedHintChunks;
    for (c = 0; c < e.length; c++)
      if (!t(b, e[c])) {
        a.destination = null;
        c++;
        break;
      }
    e.splice(0, c);
    var f = a.completedJSONChunks;
    for (c = 0; c < f.length; c++)
      if ((a.pendingChunks--, !t(b, f[c]))) {
        a.destination = null;
        c++;
        break;
      }
    f.splice(0, c);
    var g = a.completedErrorChunks;
    for (c = 0; c < g.length; c++)
      if ((a.pendingChunks--, !t(b, g[c]))) {
        a.destination = null;
        c++;
        break;
      }
    g.splice(0, c);
  } finally {
    (a.flushScheduled = !1),
      l && 0 < m && b.write(l.subarray(0, m)),
      (l = null),
      (m = 0),
      (p = !0);
  }
  "function" === typeof b.flush && b.flush();
  0 === a.pendingChunks && b.end();
}
function nb(a) {
  a.flushScheduled = null !== a.destination;
  setImmediate(function () {
    return qa.run(a, kb, a);
  });
}
function B(a) {
  if (
    !1 === a.flushScheduled &&
    0 === a.pingedTasks.length &&
    null !== a.destination
  ) {
    var b = a.destination;
    a.flushScheduled = !0;
    setImmediate(function () {
      return Q(a, b);
    });
  }
}
function ob(a, b) {
  if (1 === a.status) (a.status = 2), b.destroy(a.fatalError);
  else if (2 !== a.status && null === a.destination) {
    a.destination = b;
    try {
      Q(a, b);
    } catch (d) {
      O(a, d), mb(a, d);
    }
  }
}
function pb(a, b) {
  try {
    var d = a.abortableTasks;
    if (0 < d.size) {
      var c = O(
        a,
        void 0 === b
          ? Error("The render was aborted by the server without a reason.")
          : b
      );
      a.pendingChunks++;
      var e = a.nextChunkId++;
      P(a, e, c);
      d.forEach(function (f) {
        f.status = 3;
        var g = "$" + e.toString(16);
        f = ha(a, f.id, g);
        a.completedErrorChunks.push(f);
      });
      d.clear();
    }
    null !== a.destination && Q(a, a.destination);
  } catch (f) {
    O(a, f), mb(a, f);
  }
}
function db(a) {
  if (a) {
    var b = E;
    Fa(null);
    for (var d = 0; d < a.length; d++) {
      var c = a[d],
        e = c[0];
      c = c[1];
      Ya[e] || (Ya[e] = ca.createServerContext(e, ya));
      Ga(Ya[e], c);
    }
    a = E;
    Fa(b);
    return a;
  }
  return null;
}
function qb(a, b) {
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
var S = new Map(),
  rb = new Map();
function sb() {}
function tb(a) {
  for (var b = a.chunks, d = [], c = 0; c < b.length; c++) {
    var e = b[c],
      f = S.get(e);
    if (void 0 === f) {
      f = __webpack_chunk_load__(e);
      d.push(f);
      var g = S.set.bind(S, e, null);
      f.then(g, sb);
      S.set(e, f);
    } else null !== f && d.push(f);
  }
  if (a.async) {
    if ((b = rb.get(a.id))) return "fulfilled" === b.status ? null : b;
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
    rb.set(a.id, h);
    return h;
  }
  return 0 < d.length ? Promise.all(d) : null;
}
function T(a) {
  if (a.async) {
    var b = rb.get(a.id);
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
function U(a, b, d, c) {
  this.status = a;
  this.value = b;
  this.reason = d;
  this._response = c;
}
U.prototype = Object.create(Promise.prototype);
U.prototype.then = function (a, b) {
  switch (this.status) {
    case "resolved_model":
      V(this);
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
function W(a, b) {
  for (var d = 0; d < a.length; d++) (0, a[d])(b);
}
function ub(a, b) {
  if ("pending" === a.status || "blocked" === a.status) {
    var d = a.reason;
    a.status = "rejected";
    a.reason = b;
    null !== d && W(d, b);
  }
}
function vb(a, b, d, c, e, f) {
  var g = qb(a._bundlerConfig, b);
  a = tb(g);
  if (d)
    d = Promise.all([d, a]).then(function (h) {
      h = h[0];
      var k = T(g);
      return k.bind.apply(k, [null].concat(h));
    });
  else if (a)
    d = Promise.resolve(a).then(function () {
      return T(g);
    });
  else return T(g);
  d.then(wb(c, e, f), xb(c));
  return null;
}
var X = null,
  Y = null;
function V(a) {
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
function yb(a, b) {
  a._chunks.forEach(function (d) {
    "pending" === d.status && ub(d, b);
  });
}
function Z(a, b) {
  var d = a._chunks,
    c = d.get(b);
  c ||
    ((c = a._formData.get(a._prefix + b)),
    (c =
      null != c
        ? new U("resolved_model", c, null, a)
        : new U("pending", null, null, a)),
    d.set(b, c));
  return c;
}
function wb(a, b, d) {
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
      null !== e && W(e, c.value));
  };
}
function xb(a) {
  return function (b) {
    return ub(a, b);
  };
}
function Ab(a, b, d, c) {
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
        "resolved_model" === c.status && V(c);
        if ("fulfilled" !== c.status) throw c.reason;
        c = c.value;
        return vb(a, c.id, c.bound, X, b, d);
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
            V(a);
        }
        switch (a.status) {
          case "fulfilled":
            return a.value;
          case "pending":
          case "blocked":
            return (c = X), a.then(wb(c, b, d), xb(c)), null;
          default:
            throw a.reason;
        }
    }
  return c;
}
function Bb(a, b) {
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
        return "string" === typeof g ? Ab(e, this, f, g) : g;
      },
    };
  return e;
}
function Cb(a, b, d) {
  a._formData.append(b, d);
  var c = a._prefix;
  if (
    b.startsWith(c) &&
    ((a = a._chunks),
    (b = +b.slice(c.length)),
    (b = a.get(b)) &&
      "pending" === b.status &&
      ((c = b.value),
      (a = b.reason),
      (b.status = "resolved_model"),
      (b.value = d),
      null !== c))
  )
    switch ((V(b), b.status)) {
      case "fulfilled":
        W(c, b.value);
        break;
      case "pending":
      case "blocked":
        b.value = c;
        b.reason = a;
        break;
      case "rejected":
        a && W(a, b.reason);
    }
}
function Db(a) {
  yb(a, Error("Connection closed."));
}
function Eb(a, b, d) {
  var c = qb(a, b);
  a = tb(c);
  return d
    ? Promise.all([d, a]).then(function (e) {
        e = e[0];
        var f = T(c);
        return f.bind.apply(f, [null].concat(e));
      })
    : a
    ? Promise.resolve(a).then(function () {
        return T(c);
      })
    : Promise.resolve(T(c));
}
function Fb(a, b) {
  return function () {
    return ob(b, a);
  };
}
exports.decodeAction = function (a, b) {
  var d = new FormData(),
    c = null;
  a.forEach(function (e, f) {
    if (f.startsWith("$ACTION_"))
      if (f.startsWith("$ACTION_REF_")) {
        e = "$ACTION_" + f.slice(12) + ":";
        e = Bb(b, e, a);
        Db(e);
        e = Z(e, 0);
        e.then(function () {});
        if ("fulfilled" !== e.status) throw e.reason;
        e = e.value;
        c = Eb(b, e.id, e.bound);
      } else
        f.startsWith("$ACTION_ID_") &&
          ((e = f.slice(11)), (c = Eb(b, e, null)));
    else d.append(f, e);
  });
  return null === c
    ? null
    : c.then(function (e) {
        return e.bind(null, d);
      });
};
exports.decodeReply = function (a, b) {
  if ("string" === typeof a) {
    var d = new FormData();
    d.append("0", a);
    a = d;
  }
  a = Bb(b, "", a);
  Db(a);
  return Z(a, 0);
};
exports.decodeReplyFromBusboy = function (a, b) {
  var d = Bb(b, ""),
    c = 0,
    e = [];
  a.on("field", function (f, g) {
    0 < c ? e.push(f, g) : Cb(d, f, g);
  });
  a.on("file", function (f, g, h) {
    var k = h.filename,
      q = h.mimeType;
    if ("base64" === h.encoding.toLowerCase())
      throw Error(
        "React doesn't accept base64 encoded file uploads because we don't expect form data passed from a browser to ever encode data that way. If that's the wrong assumption, we can easily fix it."
      );
    c++;
    var u = [];
    g.on("data", function (n) {
      u.push(n);
    });
    g.on("end", function () {
      var n = new Blob(u, { type: q });
      d._formData.append(f, n, k);
      c--;
      if (0 === c) {
        for (n = 0; n < e.length; n += 2) Cb(d, e[n], e[n + 1]);
        e.length = 0;
      }
    });
  });
  a.on("finish", function () {
    Db(d);
  });
  a.on("error", function (f) {
    yb(d, f);
  });
  return Z(d, 0);
};
exports.renderToPipeableStream = function (a, b, d) {
  var c = bb(
      a,
      b,
      d ? d.onError : void 0,
      d ? d.context : void 0,
      d ? d.identifierPrefix : void 0
    ),
    e = !1;
  nb(c);
  return {
    pipe: function (f) {
      if (e)
        throw Error(
          "React currently only supports piping to one writable stream."
        );
      e = !0;
      ob(c, f);
      f.on("drain", Fb(f, c));
      return f;
    },
    abort: function (f) {
      pb(c, f);
    },
  };
};
