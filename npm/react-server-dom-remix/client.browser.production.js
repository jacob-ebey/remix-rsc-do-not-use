/**
 * @license React
 * react-server-dom-webpack-client.browser.production.min.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import m from "react-dom";
import p from "react";

var q = { stream: !0 };
function r(a, b) {
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
var t = new Map(),
  u = new Map();
function w() {}
function x(a) {
  for (var b = a.chunks, c = [], d = 0; d < b.length; d++) {
    var e = b[d],
      f = t.get(e);
    if (void 0 === f) {
      f = __webpack_chunk_load__(e);
      c.push(f);
      var k = t.set.bind(t, e, null);
      f.then(k, w);
      t.set(e, f);
    } else null !== f && c.push(f);
  }
  if (a.async) {
    if ((b = u.get(a.id))) return "fulfilled" === b.status ? null : b;
    var h = Promise.all(c).then(function () {
      return __webpack_require__(a.id);
    });
    h.then(
      function (l) {
        h.status = "fulfilled";
        h.value = l;
      },
      function (l) {
        h.status = "rejected";
        h.reason = l;
      }
    );
    u.set(a.id, h);
    return h;
  }
  return 0 < c.length ? Promise.all(c) : null;
}
var y = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Dispatcher,
  z = Symbol.for("react.element"),
  A = Symbol.for("react.lazy"),
  B = Symbol.for("react.default_value"),
  C = Symbol.iterator;
function D(a) {
  if (null === a || "object" !== typeof a) return null;
  a = (C && a[C]) || a["@@iterator"];
  return "function" === typeof a ? a : null;
}
var E = Array.isArray,
  F = new WeakMap();
function aa(a) {
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
function G(a, b, c, d) {
  function e(l, g) {
    if (null === g) return null;
    if ("object" === typeof g) {
      if ("function" === typeof g.then) {
        null === h && (h = new FormData());
        k++;
        var I = f++;
        g.then(
          function (n) {
            n = JSON.stringify(n, e);
            var v = h;
            v.append(b + I, n);
            k--;
            0 === k && c(v);
          },
          function (n) {
            d(n);
          }
        );
        return "$@" + I.toString(16);
      }
      if (g instanceof FormData) {
        null === h && (h = new FormData());
        var ba = h;
        l = f++;
        var ca = b + l + "_";
        g.forEach(function (n, v) {
          ba.append(ca + v, n);
        });
        return "$K" + l.toString(16);
      }
      return !E(g) && D(g) ? Array.from(g) : g;
    }
    if ("string" === typeof g) {
      if ("Z" === g[g.length - 1] && this[l] instanceof Date) return "$D" + g;
      g = "$" === g[0] ? "$" + g : g;
      return g;
    }
    if ("boolean" === typeof g) return g;
    if ("number" === typeof g) return aa(g);
    if ("undefined" === typeof g) return "$undefined";
    if ("function" === typeof g) {
      g = F.get(g);
      if (void 0 !== g)
        return (
          (g = JSON.stringify(g, e)),
          null === h && (h = new FormData()),
          (l = f++),
          h.set(b + l, g),
          "$F" + l.toString(16)
        );
      throw Error(
        "Client Functions cannot be passed directly to Server Functions. Only Functions passed from the Server can be passed back again."
      );
    }
    if ("symbol" === typeof g) {
      l = g.description;
      if (Symbol.for(l) !== g)
        throw Error(
          "Only global symbols received from Symbol.for(...) can be passed to Server Functions. The symbol Symbol.for(" +
            (g.description + ") cannot be found among global symbols.")
        );
      return "$S" + l;
    }
    if ("bigint" === typeof g) return "$n" + g.toString(10);
    throw Error(
      "Type " +
        typeof g +
        " is not supported as an argument to a Server Function."
    );
  }
  var f = 1,
    k = 0,
    h = null;
  a = JSON.stringify(a, e);
  null === h ? c(a) : (h.set(b + "0", a), 0 === k && c(h));
}
var H = new WeakMap();
function da(a) {
  var b,
    c,
    d = new Promise(function (e, f) {
      b = e;
      c = f;
    });
  G(
    a,
    "",
    function (e) {
      if ("string" === typeof e) {
        var f = new FormData();
        f.append("0", e);
        e = f;
      }
      d.status = "fulfilled";
      d.value = e;
      b(e);
    },
    function (e) {
      d.status = "rejected";
      d.reason = e;
      c(e);
    }
  );
  return d;
}
function J(a) {
  var b = F.get(this);
  if (!b)
    throw Error(
      "Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React."
    );
  var c = null;
  if (null !== b.bound) {
    c = H.get(b);
    c || ((c = da(b)), H.set(b, c));
    if ("rejected" === c.status) throw c.reason;
    if ("fulfilled" !== c.status) throw c;
    b = c.value;
    var d = new FormData();
    b.forEach(function (e, f) {
      d.append("$ACTION_" + a + ":" + f, e);
    });
    c = d;
    b = "$ACTION_REF_" + a;
  } else b = "$ACTION_ID_" + b.id;
  return { name: b, method: "POST", encType: "multipart/form-data", data: c };
}
var K = p.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ContextRegistry;
function L(a, b, c, d) {
  this.status = a;
  this.value = b;
  this.reason = c;
  this._response = d;
}
L.prototype = Object.create(Promise.prototype);
L.prototype.then = function (a, b) {
  switch (this.status) {
    case "resolved_model":
      M(this);
      break;
    case "resolved_module":
      N(this);
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
function ea(a) {
  switch (a.status) {
    case "resolved_model":
      M(a);
      break;
    case "resolved_module":
      N(a);
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
function O(a, b) {
  for (var c = 0; c < a.length; c++) (0, a[c])(b);
}
function P(a, b, c) {
  switch (a.status) {
    case "fulfilled":
      O(b, a.value);
      break;
    case "pending":
    case "blocked":
      a.value = b;
      a.reason = c;
      break;
    case "rejected":
      c && O(c, a.reason);
  }
}
function Q(a, b) {
  if ("pending" === a.status || "blocked" === a.status) {
    var c = a.reason;
    a.status = "rejected";
    a.reason = b;
    null !== c && O(c, b);
  }
}
function R(a, b) {
  if ("pending" === a.status || "blocked" === a.status) {
    var c = a.value,
      d = a.reason;
    a.status = "resolved_module";
    a.value = b;
    null !== c && (N(a), P(a, c, d));
  }
}
var S = null,
  T = null;
function M(a) {
  var b = S,
    c = T;
  S = a;
  T = null;
  try {
    var d = JSON.parse(a.value, a._response._fromJSON);
    null !== T && 0 < T.deps
      ? ((T.value = d),
        (a.status = "blocked"),
        (a.value = null),
        (a.reason = null))
      : ((a.status = "fulfilled"), (a.value = d));
  } catch (e) {
    (a.status = "rejected"), (a.reason = e);
  } finally {
    (S = b), (T = c);
  }
}
function N(a) {
  try {
    var b = a.value;
    if (b.async) {
      var c = u.get(b.id);
      if ("fulfilled" === c.status) var d = c.value;
      else throw c.reason;
    } else d = __webpack_require__(b.id);
    var e =
      "*" === b.name
        ? d
        : "" === b.name
        ? d.__esModule
          ? d.default
          : d
        : d[b.name];
    a.status = "fulfilled";
    a.value = e;
  } catch (f) {
    (a.status = "rejected"), (a.reason = f);
  }
}
function U(a, b) {
  a._chunks.forEach(function (c) {
    "pending" === c.status && Q(c, b);
  });
}
function V(a, b) {
  var c = a._chunks,
    d = c.get(b);
  d || ((d = new L("pending", null, null, a)), c.set(b, d));
  return d;
}
function fa(a, b, c) {
  if (T) {
    var d = T;
    d.deps++;
  } else d = T = { deps: 1, value: null };
  return function (e) {
    b[c] = e;
    d.deps--;
    0 === d.deps &&
      "blocked" === a.status &&
      ((e = a.value),
      (a.status = "fulfilled"),
      (a.value = d.value),
      null !== e && O(e, d.value));
  };
}
function ha(a) {
  return function (b) {
    return Q(a, b);
  };
}
function ia(a, b) {
  function c() {
    var e = Array.prototype.slice.call(arguments),
      f = b.bound;
    return f
      ? "fulfilled" === f.status
        ? d(b.id, f.value.concat(e))
        : Promise.resolve(f).then(function (k) {
            return d(b.id, k.concat(e));
          })
      : d(b.id, e);
  }
  var d = a._callServer;
  c.$$FORM_ACTION = J;
  F.set(c, b);
  return c;
}
function ja(a, b, c, d) {
  if ("$" === d[0]) {
    if ("$" === d) return z;
    switch (d[1]) {
      case "$":
        return d.slice(1);
      case "L":
        return (
          (b = parseInt(d.slice(2), 16)),
          (a = V(a, b)),
          { $$typeof: A, _payload: a, _init: ea }
        );
      case "@":
        return (b = parseInt(d.slice(2), 16)), V(a, b);
      case "S":
        return Symbol.for(d.slice(2));
      case "P":
        return (
          (a = d.slice(2)),
          K[a] || (K[a] = p.createServerContext(a, B)),
          K[a].Provider
        );
      case "F":
        b = parseInt(d.slice(2), 16);
        b = V(a, b);
        switch (b.status) {
          case "resolved_model":
            M(b);
        }
        switch (b.status) {
          case "fulfilled":
            return ia(a, b.value);
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
        a = V(a, d);
        switch (a.status) {
          case "resolved_model":
            M(a);
            break;
          case "resolved_module":
            N(a);
        }
        switch (a.status) {
          case "fulfilled":
            return a.value;
          case "pending":
          case "blocked":
            return (d = S), a.then(fa(d, b, c), ha(d)), null;
          default:
            throw a.reason;
        }
    }
  }
  return d;
}
function ka() {
  throw Error(
    'Trying to call a function from "use server" but the callServer option was not implemented in your router runtime.'
  );
}
function la(a, b, c) {
  var d = a._chunks,
    e = d.get(b);
  c = JSON.parse(c, a._fromJSON);
  var f = r(a._bundlerConfig, c);
  if ((c = x(f))) {
    if (e) {
      var k = e;
      k.status = "blocked";
    } else (k = new L("blocked", null, null, a)), d.set(b, k);
    c.then(
      function () {
        return R(k, f);
      },
      function (h) {
        return Q(k, h);
      }
    );
  } else e ? R(e, f) : d.set(b, new L("resolved_module", f, null, a));
}
function W(a) {
  U(a, Error("Connection closed."));
}
function X(a, b) {
  if ("" !== b) {
    var c = b.indexOf(":", 0),
      d = parseInt(b.slice(0, c), 16);
    switch (b[c + 1]) {
      case "I":
        la(a, d, b.slice(c + 2));
        break;
      case "H":
        d = b[c + 2];
        b = b.slice(c + 3);
        a = JSON.parse(b, a._fromJSON);
        if ((b = y.current)) {
          if ("string" === typeof a) c = a;
          else {
            c = a[0];
            var e = a[1];
          }
          switch (d) {
            case "D":
              b.prefetchDNS(c, e);
              break;
            case "C":
              b.preconnect(c, e);
              break;
            case "L":
              b.preload(c, e);
              break;
            case "I":
              b.preinit(c, e);
          }
        }
        break;
      case "E":
        b = JSON.parse(b.slice(c + 2)).digest;
        e = Error(
          "An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error."
        );
        e.stack = "Error: " + e.message;
        e.digest = b;
        b = a._chunks;
        (c = b.get(d)) ? Q(c, e) : b.set(d, new L("rejected", null, e, a));
        break;
      default:
        (e = b.slice(c + 1)),
          (c = a._chunks),
          (b = c.get(d))
            ? "pending" === b.status &&
              ((a = b.value),
              (d = b.reason),
              (b.status = "resolved_model"),
              (b.value = e),
              null !== a && (M(b), P(b, a, d)))
            : c.set(d, new L("resolved_model", e, null, a));
    }
  }
}
function ma(a) {
  return function (b, c) {
    return "string" === typeof c
      ? ja(a, this, b, c)
      : "object" === typeof c && null !== c
      ? ((b =
          c[0] === z
            ? {
                $$typeof: z,
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
function Y(a) {
  a = a && a.callServer ? a.callServer : void 0;
  var b = new TextDecoder(),
    c = new Map();
  a = {
    _bundlerConfig: null,
    _callServer: void 0 !== a ? a : ka,
    _chunks: c,
    _partialRow: "",
    _stringDecoder: b,
  };
  a._fromJSON = ma(a);
  return a;
}
function Z(a, b) {
  function c(f) {
    var k = f.value;
    if (f.done) W(a);
    else {
      f = k;
      k = a._stringDecoder;
      for (var h = f.indexOf(10); -1 < h; ) {
        var l = a._partialRow;
        var g = f.subarray(0, h);
        g = k.decode(g);
        X(a, l + g);
        a._partialRow = "";
        f = f.subarray(h + 1);
        h = f.indexOf(10);
      }
      a._partialRow += k.decode(f, q);
      return e.read().then(c).catch(d);
    }
  }
  function d(f) {
    U(a, f);
  }
  var e = b.getReader();
  e.read().then(c).catch(d);
}
export const createFromFetch = function (a, b) {
  var c = Y(b);
  a.then(
    function (d) {
      Z(c, d.body);
    },
    function (d) {
      U(c, d);
    }
  );
  return V(c, 0);
};
export const createFromReadableStream = function (a, b) {
  b = Y(b);
  Z(b, a);
  return V(b, 0);
};
export const createFromXHR = function (a, b) {
  function c() {
    for (var k = a.responseText, h = f, l = k.indexOf("\n", h); -1 < l; )
      (h = e._partialRow + k.slice(h, l)),
        X(e, h),
        (e._partialRow = ""),
        (h = l + 1),
        (l = k.indexOf("\n", h));
    e._partialRow += k.slice(h);
    f = k.length;
  }
  function d() {
    U(e, new TypeError("Network error"));
  }
  var e = Y(b),
    f = 0;
  a.addEventListener("progress", c);
  a.addEventListener("load", function () {
    c();
    W(e);
  });
  a.addEventListener("error", d);
  a.addEventListener("abort", d);
  a.addEventListener("timeout", d);
  return V(e, 0);
};
export const createServerReference = function (a, b) {
  function c() {
    var d = Array.prototype.slice.call(arguments);
    return b(a, d);
  }
  c.$$FORM_ACTION = J;
  F.set(c, { id: a, bound: null });
  return c;
};
export const encodeReply = function (a) {
  return new Promise(function (b, c) {
    G(a, "", b, c);
  });
};
