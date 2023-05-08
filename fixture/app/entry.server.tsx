import { createCookieSessionStorage, defineHandler } from "remix/server";
import * as runtime from "remix/server-runtime";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    httpOnly: true,
    path: "/",
    secrets: ["secret"],
    // secure: process.env.NODE_ENV === "production",
  },
});

export default defineHandler({
  runtime,
  async createRequestContext({ request }) {
    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );
    return {
      session,
      ogSession: await sessionStorage.commitSession(session),
    };
  },
  async commitRequestContext({ requestContext, response }) {
    const cookie = await sessionStorage.commitSession(requestContext.session);

    if (cookie !== requestContext.ogSession) {
      response.headers.append("Set-Cookie", cookie);
    }

    return response;
  },
});
