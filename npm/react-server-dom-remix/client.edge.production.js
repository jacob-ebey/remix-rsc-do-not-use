/**
 * @license React
 * react-server-dom-webpack-client.edge.production.min.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import q from "react-dom";
import t from "react";
var u = { stream: !0 };
function v(a, b) {
  if (a) {
    var c = a[b.id];
    if ((a = c[b.name])) c = a.name;
    else {
      a = c["*"];
      if (!a)
        throw Error(
          'Could not find the module "' +
            b.id +
            '" in the React SSR Manifest. This is probably a bug in the React Server Components bundler.'
        );
      c = b.name;
    }
    return { id: a.id, chunks: a.chunks, name: c, async: !!b.async };
  }
  return b;
}
var w = new Map(),
  y = new Map();
function z() {}
function A(a) {
  for (var b = a.chunks, c = [], d = 0; d < b.length; d++) {
    var f = b[d],
      g = w.get(f);
    if (void 0 === g) {
      g = __webpack_chunk_load__(f);
      c.push(g);
      var n = w.set.bind(w, f, null);
      g.then(n, z);
      w.set(f, g);
    } else null !== g && c.push(g);
  }
  if (a.async) {
    if ((b = y.get(a.id))) return "fulfilled" === b.status ? null : b;
    var l = Promise.all(c).then(function () {
      return __webpack_require__(a.id);
    });
    l.then(
      function (h) {
        l.status = "fulfilled";
        l.value = h;
      },
      function (h) {
        l.status = "rejected";
        l.reason = h;
      }
    );
    y.set(a.id, l);
    return l;
  }
  return 0 < c.length ? Promise.all(c) : null;
}
var B = q.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Dispatcher,
  C = Symbol.for("react.element"),
  D = Symbol.for("react.lazy"),
  E = Symbol.for("react.default_value"),
  F = Symbol.iterator;
function G(a) {
  if (null === a || "object" !== typeof a) return null;
  a = (F && a[F]) || a["@@iterator"];
  return "function" === typeof a ? a : null;
}
var H = Array.isArray,
  I = new WeakMap();
function J(a) {
  return Number.isFinite(a)
    ? 0 === a && -Infinity === 1 / a
      ? "$-0"
      : a
    : Infinity === a
    ? "$Infinity"
    : -Infinity === a
    ? "$-Infinity"
    : "$NaN";
}
function aa(a, b, c, d) {
  function f(h, e) {
    if (null === e) return null;
    if ("object" === typeof e) {
      if ("function" === typeof e.then) {
        null === l && (l = new FormData());
        n++;
        var k = g++;
        e.then(
          function (r) {
            r = JSON.stringify(r, f);
            var x = l;
            x.append(b + k, r);
            n--;
            0 === n && c(x);
          },
          function (r) {
            d(r);
          }
        );
        return "$@" + k.toString(16);
      }
      if (e instanceof FormData) {
        null === l && (l = new FormData());
        var m = l;
        h = g++;
        var p = b + h + "_";
        e.forEach(function (r, x) {
          m.append(p + x, r);
        });
        return "$K" + h.toString(16);
      }
      return !H(e) && G(e) ? Array.from(e) : e;
    }
    if ("string" === typeof e) {
      if ("Z" === e[e.length - 1] && this[h] instanceof Date) return "$D" + e;
      e = "$" === e[0] ? "$" + e : e;
      return e;
    }
    if ("boolean" === typeof e) return e;
    if ("number" === typeof e) return J(e);
    if ("undefined" === typeof e) return "$undefined";
    if ("function" === typeof e) {
      e = I.get(e);
      if (void 0 !== e)
        return (
          (e = JSON.stringify(e, f)),
          null === l && (l = new FormData()),
          (h = g++),
          l.set(b + h, e),
          "$F" + h.toString(16)
        );
      throw Error(
        "Client Functions cannot be passed directly to Server Functions. Only Functions passed from the Server can be passed back again."
      );
    }
    if ("symbol" === typeof e) {
      h = e.description;
      if (Symbol.for(h) !== e)
        throw Error(
          "Only global symbols received from Symbol.for(...) can be passed to Server Functions. The symbol Symbol.for(" +
            (e.description + ") cannot be found among global symbols.")
        );
      return "$S" + h;
    }
    if ("bigint" === typeof e) return "$n" + e.toString(10);
    throw Error(
      "Type " +
        typeof e +
        " is not supported as an argument to a Server Function."
    );
  }
  var g = 1,
    n = 0,
    l = null;
  a = JSON.stringify(a, f);
  null === l ? c(a) : (l.set(b + "0", a), 0 === n && c(l));
}
var K = new WeakMap();
function ba(a) {
  var b,
    c,
    d = new Promise(function (f, g) {
      b = f;
      c = g;
    });
  aa(
    a,
    "",
    function (f) {
      if ("string" === typeof f) {
        var g = new FormData();
        g.append("0", f);
        f = g;
      }
      d.status = "fulfilled";
      d.value = f;
      b(f);
    },
    function (f) {
      d.status = "rejected";
      d.reason = f;
      c(f);
    }
  );
  return d;
}
function ca(a) {
  var b = I.get(this);
  if (!b)
    throw Error(
      "Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React."
    );
  var c = null;
  if (null !== b.bound) {
    c = K.get(b);
    c || ((c = ba(b)), K.set(b, c));
    if ("rejected" === c.status) throw c.reason;
    if ("fulfilled" !== c.status) throw c;
    b = c.value;
    var d = new FormData();
    b.forEach(function (f, g) {
      d.append("$ACTION_" + a + ":" + g, f);
    });
    c = d;
    b = "$ACTION_REF_" + a;
  } else b = "$ACTION_ID_" + b.id;
  return { name: b, method: "POST", encType: "multipart/form-data", data: c };
}
var L = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ContextRegistry;
function M(a, b, c, d) {
  this.status = a;
  this.value = b;
  this.reason = c;
  this._response = d;
}
M.prototype = Object.create(Promise.prototype);
M.prototype.then = function (a, b) {
  switch (this.status) {
    case "resolved_model":
      N(this);
      break;
    case "resolved_module":
      O(this);
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
function da(a) {
  switch (a.status) {
    case "resolved_model":
      N(a);
      break;
    case "resolved_module":
      O(a);
  }
  switch (a.status) {
    case "fulfilled":
      return a.value;
    case "pending":
    case "blocked":
      throw a;
    default:
      throw a.reason;
  }
}
function P(a, b) {
  for (var c = 0; c < a.length; c++) (0, a[c])(b);
}
function Q(a, b, c) {
  switch (a.status) {
    case "fulfilled":
      P(b, a.value);
      break;
    case "pending":
    case "blocked":
      a.value = b;
      a.reason = c;
      break;
    case "rejected":
      c && P(c, a.reason);
  }
}
function R(a, b) {
  if ("pending" === a.status || "blocked" === a.status) {
    var c = a.reason;
    a.status = "rejected";
    a.reason = b;
    null !== c && P(c, b);
  }
}
function S(a, b) {
  if ("pending" === a.status || "blocked" === a.status) {
    var c = a.value,
      d = a.reason;
    a.status = "resolved_module";
    a.value = b;
    null !== c && (O(a), Q(a, c, d));
  }
}
var T = null,
  U = null;
function N(a) {
  var b = T,
    c = U;
  T = a;
  U = null;
  try {
    var d = JSON.parse(a.value, a._response._fromJSON);
    null !== U && 0 < U.deps
      ? ((U.value = d),
        (a.status = "blocked"),
        (a.value = null),
        (a.reason = null))
      : ((a.status = "fulfilled"), (a.value = d));
  } catch (f) {
    (a.status = "rejected"), (a.reason = f);
  } finally {
    (T = b), (U = c);
  }
}
function O(a) {
  try {
    var b = a.value;
    if (b.async) {
      var c = y.get(b.id);
      if ("fulfilled" === c.status) var d = c.value;
      else throw c.reason;
    } else d = __webpack_require__(b.id);
    var f =
      "*" === b.name
        ? d
        : "" === b.name
        ? d.__esModule
          ? d.default
          : d
        : d[b.name];
    a.status = "fulfilled";
    a.value = f;
  } catch (g) {
    (a.status = "rejected"), (a.reason = g);
  }
}
function V(a, b) {
  a._chunks.forEach(function (c) {
    "pending" === c.status && R(c, b);
  });
}
function W(a, b) {
  var c = a._chunks,
    d = c.get(b);
  d || ((d = new M("pending", null, null, a)), c.set(b, d));
  return d;
}
function ea(a, b, c) {
  if (U) {
    var d = U;
    d.deps++;
  } else d = U = { deps: 1, value: null };
  return function (f) {
    b[c] = f;
    d.deps--;
    0 === d.deps &&
      "blocked" === a.status &&
      ((f = a.value),
      (a.status = "fulfilled"),
      (a.value = d.value),
      null !== f && P(f, d.value));
  };
}
function fa(a) {
  return function (b) {
    return R(a, b);
  };
}
function ha(a, b) {
  function c() {
    var f = Array.prototype.slice.call(arguments),
      g = b.bound;
    return g
      ? "fulfilled" === g.status
        ? d(b.id, g.value.concat(f))
        : Promise.resolve(g).then(function (n) {
            return d(b.id, n.concat(f));
          })
      : d(b.id, f);
  }
  var d = a._callServer;
  c.$$FORM_ACTION = ca;
  I.set(c, b);
  return c;
}
function ia(a, b, c, d) {
  if ("$" === d[0]) {
    if ("$" === d) return C;
    switch (d[1]) {
      case "$":
        return d.slice(1);
      case "L":
        return (
          (b = parseInt(d.slice(2), 16)),
          (a = W(a, b)),
          { $$typeof: D, _payload: a, _init: da }
        );
      case "@":
        return (b = parseInt(d.slice(2), 16)), W(a, b);
      case "S":
        return Symbol.for(d.slice(2));
      case "P":
        return (
          (a = d.slice(2)),
          L[a] || (L[a] = t.createServerContext(a, E)),
          L[a].Provider
        );
      case "F":
        b = parseInt(d.slice(2), 16);
        b = W(a, b);
        switch (b.status) {
          case "resolved_model":
            N(b);
        }
        switch (b.status) {
          case "fulfilled":
            return ha(a, b.value);
          default:
            throw b.reason;
        }
      case "I":
        return Infinity;
      case "-":
        return "$-0" === d ? -0 : -Infinity;
      case "N":
        return NaN;
      case "u":
        return;
      case "D":
        return new Date(Date.parse(d.slice(2)));
      case "n":
        return BigInt(d.slice(2));
      default:
        d = parseInt(d.slice(1), 16);
        a = W(a, d);
        switch (a.status) {
          case "resolved_model":
            N(a);
            break;
          case "resolved_module":
            O(a);
        }
        switch (a.status) {
          case "fulfilled":
            return a.value;
          case "pending":
          case "blocked":
            return (d = T), a.then(ea(d, b, c), fa(d)), null;
          default:
            throw a.reason;
        }
    }
  }
  return d;
}
function ja() {
  throw Error(
    'Trying to call a function from "use server" but the callServer option was not implemented in your router runtime.'
  );
}
function ka(a, b, c) {
  var d = a._chunks,
    f = d.get(b);
  c = JSON.parse(c, a._fromJSON);
  var g = v(a._bundlerConfig, c);
  if ((c = A(g))) {
    if (f) {
      var n = f;
      n.status = "blocked";
    } else (n = new M("blocked", null, null, a)), d.set(b, n);
    c.then(
      function () {
        return S(n, g);
      },
      function (l) {
        return R(n, l);
      }
    );
  } else f ? S(f, g) : d.set(b, new M("resolved_module", g, null, a));
}
function la(a) {
  return function (b, c) {
    return "string" === typeof c
      ? ia(a, this, b, c)
      : "object" === typeof c && null !== c
      ? ((b =
          c[0] === C
            ? {
                $$typeof: C,
                type: c[1],
                key: c[2],
                ref: null,
                props: c[3],
                _owner: null,
              }
            : c),
        b)
      : c;
  };
}
function X(a, b) {
  var c = new TextDecoder(),
    d = new Map();
  a = {
    _bundlerConfig: a,
    _callServer: void 0 !== b ? b : ja,
    _chunks: d,
    _partialRow: "",
    _stringDecoder: c,
  };
  a._fromJSON = la(a);
  return a;
}
function Y() {
  throw Error(
    "Server Functions cannot be called during initial render. This would create a fetch waterfall. Try to use a Server Component to pass data to Client Components instead."
  );
}
function Z(a, b) {
  function c(g) {
    var n = g.value;
    if (g.done) V(a, Error("Connection closed."));
    else {
      g = n;
      n = a._stringDecoder;
      for (var l = g.indexOf(10); -1 < l; ) {
        var h = a._partialRow;
        var e = g.subarray(0, l);
        e = n.decode(e);
        var k = h + e;
        h = a;
        if ("" !== k) {
          var m = k.indexOf(":", 0);
          e = parseInt(k.slice(0, m), 16);
          switch (k[m + 1]) {
            case "I":
              ka(h, e, k.slice(m + 2));
              break;
            case "H":
              e = k[m + 2];
              k = k.slice(m + 3);
              h = JSON.parse(k, h._fromJSON);
              k = void 0;
              var p = B.current;
              if (p)
                switch (
                  ("string" === typeof h ? (m = h) : ((m = h[0]), (k = h[1])),
                  e)
                ) {
                  case "D":
                    p.prefetchDNS(m, k);
                    break;
                  case "C":
                    p.preconnect(m, k);
                    break;
                  case "L":
                    p.preload(m, k);
                    break;
                  case "I":
                    p.preinit(m, k);
                }
              break;
            case "E":
              m = JSON.parse(k.slice(m + 2)).digest;
              k = Error(
                "An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error."
              );
              k.stack = "Error: " + k.message;
              k.digest = m;
              m = h._chunks;
              (p = m.get(e))
                ? R(p, k)
                : m.set(e, new M("rejected", null, k, h));
              break;
            default:
              (k = k.slice(m + 1)),
                (m = h._chunks),
                (p = m.get(e))
                  ? ((h = p),
                    (e = k),
                    "pending" === h.status &&
                      ((k = h.value),
                      (m = h.reason),
                      (h.status = "resolved_model"),
                      (h.value = e),
                      null !== k && (N(h), Q(h, k, m))))
                  : m.set(e, new M("resolved_model", k, null, h));
          }
        }
        a._partialRow = "";
        g = g.subarray(l + 1);
        l = g.indexOf(10);
      }
      a._partialRow += n.decode(g, u);
      return f.read().then(c).catch(d);
    }
  }
  function d(g) {
    V(a, g);
  }
  var f = b.getReader();
  f.read().then(c).catch(d);
}
export const createFromFetch = function (a, b) {
  var c = X(b && b.moduleMap ? b.moduleMap : null, Y);
  a.then(
    function (d) {
      Z(c, d.body);
    },
    function (d) {
      V(c, d);
    }
  );
  return W(c, 0);
};
export const createFromReadableStream = function (a, b) {
  b = X(b && b.moduleMap ? b.moduleMap : null, Y);
  Z(b, a);
  return W(b, 0);
};
export const createServerReference = function () {
  return Y;
};
