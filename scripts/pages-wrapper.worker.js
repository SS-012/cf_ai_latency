export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve Next static assets from the OpenNext assets directory
    if (url.pathname.startsWith("/_next/")) {
      return env.ASSETS.fetch(new URL(`/assets${url.pathname}`, url));
    }

    // Delegate all other handling to the generated OpenNext worker
    const mod = await import("./worker.js");
    return mod.default.fetch(request, env, ctx);
  }
};


