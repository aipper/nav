(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // ../../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
  var __facade_middleware__ = [];
  function __facade_register__(...args) {
    __facade_middleware__.push(...args.flat());
  }
  __name(__facade_register__, "__facade_register__");
  function __facade_registerInternal__(...args) {
    __facade_middleware__.unshift(...args.flat());
  }
  __name(__facade_registerInternal__, "__facade_registerInternal__");
  function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
    const [head, ...tail] = middlewareChain;
    const middlewareCtx = {
      dispatch,
      next(newRequest, newEnv) {
        return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
      }
    };
    return head(request, env, ctx, middlewareCtx);
  }
  __name(__facade_invokeChain__, "__facade_invokeChain__");
  function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
    return __facade_invokeChain__(request, env, ctx, dispatch, [
      ...__facade_middleware__,
      finalMiddleware
    ]);
  }
  __name(__facade_invoke__, "__facade_invoke__");

  // ../../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/loader-sw.ts
  var __FACADE_EVENT_TARGET__;
  if (globalThis.MINIFLARE) {
    __FACADE_EVENT_TARGET__ = new (Object.getPrototypeOf(WorkerGlobalScope))();
  } else {
    __FACADE_EVENT_TARGET__ = new EventTarget();
  }
  function __facade_isSpecialEvent__(type) {
    return type === "fetch" || type === "scheduled";
  }
  __name(__facade_isSpecialEvent__, "__facade_isSpecialEvent__");
  var __facade__originalAddEventListener__ = globalThis.addEventListener;
  var __facade__originalRemoveEventListener__ = globalThis.removeEventListener;
  var __facade__originalDispatchEvent__ = globalThis.dispatchEvent;
  globalThis.addEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.addEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalAddEventListener__(type, listener, options);
    }
  };
  globalThis.removeEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.removeEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalRemoveEventListener__(type, listener, options);
    }
  };
  globalThis.dispatchEvent = function(event) {
    if (__facade_isSpecialEvent__(event.type)) {
      return __FACADE_EVENT_TARGET__.dispatchEvent(event);
    } else {
      return __facade__originalDispatchEvent__(event);
    }
  };
  globalThis.addMiddleware = __facade_register__;
  globalThis.addMiddlewareInternal = __facade_registerInternal__;
  var __facade_waitUntil__ = Symbol("__facade_waitUntil__");
  var __facade_response__ = Symbol("__facade_response__");
  var __facade_dispatched__ = Symbol("__facade_dispatched__");
  var __Facade_ExtendableEvent__ = class ___Facade_ExtendableEvent__ extends Event {
    static {
      __name(this, "__Facade_ExtendableEvent__");
    }
    [__facade_waitUntil__] = [];
    waitUntil(promise) {
      if (!(this instanceof ___Facade_ExtendableEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this[__facade_waitUntil__].push(promise);
    }
  };
  var __Facade_FetchEvent__ = class ___Facade_FetchEvent__ extends __Facade_ExtendableEvent__ {
    static {
      __name(this, "__Facade_FetchEvent__");
    }
    #request;
    #passThroughOnException;
    [__facade_response__];
    [__facade_dispatched__] = false;
    constructor(type, init) {
      super(type);
      this.#request = init.request;
      this.#passThroughOnException = init.passThroughOnException;
    }
    get request() {
      return this.#request;
    }
    respondWith(response) {
      if (!(this instanceof ___Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      if (this[__facade_response__] !== void 0) {
        throw new DOMException(
          "FetchEvent.respondWith() has already been called; it can only be called once.",
          "InvalidStateError"
        );
      }
      if (this[__facade_dispatched__]) {
        throw new DOMException(
          "Too late to call FetchEvent.respondWith(). It must be called synchronously in the event handler.",
          "InvalidStateError"
        );
      }
      this.stopImmediatePropagation();
      this[__facade_response__] = response;
    }
    passThroughOnException() {
      if (!(this instanceof ___Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#passThroughOnException();
    }
  };
  var __Facade_ScheduledEvent__ = class ___Facade_ScheduledEvent__ extends __Facade_ExtendableEvent__ {
    static {
      __name(this, "__Facade_ScheduledEvent__");
    }
    #scheduledTime;
    #cron;
    #noRetry;
    constructor(type, init) {
      super(type);
      this.#scheduledTime = init.scheduledTime;
      this.#cron = init.cron;
      this.#noRetry = init.noRetry;
    }
    get scheduledTime() {
      return this.#scheduledTime;
    }
    get cron() {
      return this.#cron;
    }
    noRetry() {
      if (!(this instanceof ___Facade_ScheduledEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#noRetry();
    }
  };
  __facade__originalAddEventListener__("fetch", (event) => {
    const ctx = {
      waitUntil: event.waitUntil.bind(event),
      passThroughOnException: event.passThroughOnException.bind(event)
    };
    const __facade_sw_dispatch__ = /* @__PURE__ */ __name(function(type, init) {
      if (type === "scheduled") {
        const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
          scheduledTime: Date.now(),
          cron: init.cron ?? "",
          noRetry() {
          }
        });
        __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
        event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      }
    }, "__facade_sw_dispatch__");
    const __facade_sw_fetch__ = /* @__PURE__ */ __name(function(request, _env, ctx2) {
      const facadeEvent = new __Facade_FetchEvent__("fetch", {
        request,
        passThroughOnException: ctx2.passThroughOnException
      });
      __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
      facadeEvent[__facade_dispatched__] = true;
      event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      const response = facadeEvent[__facade_response__];
      if (response === void 0) {
        throw new Error("No response!");
      }
      return response;
    }, "__facade_sw_fetch__");
    event.respondWith(
      __facade_invoke__(
        event.request,
        globalThis,
        ctx,
        __facade_sw_dispatch__,
        __facade_sw_fetch__
      )
    );
  });
  __facade__originalAddEventListener__("scheduled", (event) => {
    const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
      scheduledTime: event.scheduledTime,
      cron: event.cron,
      noRetry: event.noRetry.bind(event)
    });
    __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
    event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
  });

  // ../../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
  var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env);
    } finally {
      try {
        if (request.body !== null && !request.bodyUsed) {
          const reader = request.body.getReader();
          while (!(await reader.read()).done) {
          }
        }
      } catch (e) {
        console.error("Failed to drain the unused request body.", e);
      }
    }
  }, "drainBody");
  var middleware_ensure_req_body_drained_default = drainBody;

  // ../../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
  function reduceError(e) {
    return {
      name: e?.name,
      message: e?.message ?? String(e),
      stack: e?.stack,
      cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
    };
  }
  __name(reduceError, "reduceError");
  var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env);
    } catch (e) {
      const error = reduceError(e);
      return Response.json(error, {
        status: 500,
        headers: { "MF-Experimental-Error-Stack": "true" }
      });
    }
  }, "jsonError");
  var middleware_miniflare3_json_error_default = jsonError;

  // .wrangler/tmp/bundle-1q5pgI/middleware-insertion-facade.js
  __facade_registerInternal__([middleware_ensure_req_body_drained_default, middleware_miniflare3_json_error_default]);

  // worker.js
  var CONFIG = {
    github: {
      clientId: "",
      clientSecret: "",
      redirectUri: ""
    }
  };
  function loadConfig() {
    CONFIG.github.clientId = CF_GITHUB_CLIENT_ID || "";
    CONFIG.github.clientSecret = CF_GITHUB_CLIENT_SECRET || "";
    CONFIG.github.redirectUri = CF_GITHUB_REDIRECT_URI || "";
  }
  __name(loadConfig, "loadConfig");
  loadConfig();
  addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
  });
  async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    const user = authResult.user;
    if (path.startsWith("/kv/")) {
      return handleKVRequest(request, url, headers);
    } else if (path === "/auth/github") {
      return handleGitHubAuth(url, headers);
    } else if (path === "/auth/github/callback") {
      return handleGitHubCallback(url, headers);
    } else if (path === "/auth/me") {
      return new Response(JSON.stringify(user), {
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    return new Response("Not Found", {
      status: 404,
      headers: { ...headers, "Content-Type": "text/plain" }
    });
  }
  __name(handleRequest, "handleRequest");
  async function authenticate(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/auth/github" || path === "/auth/github/callback") {
      return { authenticated: true, user: null };
    }
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authenticated: false, error: "\u672A\u63D0\u4F9B\u6709\u6548\u4EE4\u724C" };
    }
    const token = authHeader.substring(7);
    try {
      const user = await PERSONAL_NAVIGATION.get(`user_${token}`);
      if (!user) {
        return { authenticated: false, error: "\u65E0\u6548\u7684\u4EE4\u724C" };
      }
      return { authenticated: true, user: JSON.parse(user) };
    } catch (error) {
      console.error("\u8BA4\u8BC1\u9519\u8BEF:", error);
      return { authenticated: false, error: "\u8BA4\u8BC1\u8FC7\u7A0B\u4E2D\u53D1\u751F\u9519\u8BEF" };
    }
  }
  __name(authenticate, "authenticate");
  async function handleKVRequest(request, url, headers) {
    const path = url.pathname;
    const key = url.searchParams.get("key");
    if (!key) {
      return new Response(JSON.stringify({ error: "\u7F3A\u5C11key\u53C2\u6570" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    try {
      if (path === "/kv/get" && request.method === "GET") {
        const value = await PERSONAL_NAVIGATION.get(key);
        return new Response(JSON.stringify({ value: value ? JSON.parse(value) : null }), {
          headers: { ...headers, "Content-Type": "application/json" }
        });
      } else if (path === "/kv/put" && request.method === "POST") {
        const data = await request.json();
        if (!data.value) {
          return new Response(JSON.stringify({ error: "\u7F3A\u5C11value\u5B57\u6BB5" }), {
            status: 400,
            headers: { ...headers, "Content-Type": "application/json" }
          });
        }
        await PERSONAL_NAVIGATION.put(key, JSON.stringify(data.value));
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...headers, "Content-Type": "application/json" }
        });
      } else if (path === "/kv/delete" && request.method === "DELETE") {
        await PERSONAL_NAVIGATION.delete(key);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...headers, "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ error: "\u4E0D\u652F\u6301\u7684\u65B9\u6CD5\u6216\u8DEF\u5F84" }), {
        status: 404,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("KV\u64CD\u4F5C\u9519\u8BEF:", error);
      return new Response(JSON.stringify({ error: "KV\u64CD\u4F5C\u5931\u8D25" }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
  }
  __name(handleKVRequest, "handleKVRequest");
  function handleGitHubAuth(url, headers) {
    const state = Math.random().toString(36).substring(2, 15);
    PERSONAL_NAVIGATION.put(`state_${state}`, "valid", { expirationTtl: 300 });
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CONFIG.github.clientId}&redirect_uri=${encodeURIComponent(CONFIG.github.redirectUri)}&state=${state}&scope=user`;
    return Response.redirect(githubAuthUrl, 302);
  }
  __name(handleGitHubAuth, "handleGitHubAuth");
  async function handleGitHubCallback(url, headers) {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
      return new Response(JSON.stringify({ error: "\u7F3A\u5C11code\u6216state\u53C2\u6570" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    const stateValid = await PERSONAL_NAVIGATION.get(`state_${state}`);
    if (!stateValid) {
      return new Response(JSON.stringify({ error: "\u65E0\u6548\u7684state" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    PERSONAL_NAVIGATION.delete(`state_${state}`);
    try {
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          client_id: CONFIG.github.clientId,
          client_secret: CONFIG.github.clientSecret,
          code,
          redirect_uri: CONFIG.github.redirectUri
        })
      });
      const tokenData = await tokenResponse.json();
      if (tokenData.error) {
        return new Response(JSON.stringify({ error: tokenData.error_description }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" }
        });
      }
      const accessToken = tokenData.access_token;
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      const user = await userResponse.json();
      const sessionToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
      await PERSONAL_NAVIGATION.put(`user_${sessionToken}`, JSON.stringify(user), { expirationTtl: 60 * 60 * 24 * 7 });
      const redirectUrl = new URL(CONFIG.github.redirectUri);
      redirectUrl.searchParams.set("token", sessionToken);
      return Response.redirect(redirectUrl.toString(), 302);
    } catch (error) {
      console.error("GitHub\u8BA4\u8BC1\u56DE\u8C03\u9519\u8BEF:", error);
      return new Response(JSON.stringify({ error: "\u8BA4\u8BC1\u8FC7\u7A0B\u4E2D\u53D1\u751F\u9519\u8BEF" }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
  }
  __name(handleGitHubCallback, "handleGitHubCallback");
})();
//# sourceMappingURL=worker.js.map
