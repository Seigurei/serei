import { serve } from "bun";
import type { Handler, HttpMethod, Routes } from "./types";

const routes: Routes = new Map();

// Utility function to add route
const addRoute = (method: HttpMethod, path: string, handler: Handler): void => {
  if (!routes.has(method)) {
    routes.set(method, new Map());
  }
  routes.get(method)?.set(path, handler);
};

/**
 * A wrapper for HTTP methods to register routes.
 */
export const route = {
  get: (path: string, handler: Handler): void => addRoute("GET", path, handler),
  post: (path: string, handler: Handler): void =>
    addRoute("POST", path, handler),
  put: (path: string, handler: Handler): void => addRoute("PUT", path, handler),
  patch: (path: string, handler: Handler): void =>
    addRoute("PATCH", path, handler),
  delete: (path: string, handler: Handler): void =>
    addRoute("DELETE", path, handler),
};

export const listen = (port: number, callback?: () => void): void => {
  serve({
    port,
    fetch: (req: Request): Response => {
      const method = req.method.toUpperCase() as HttpMethod;
      const url = new URL(req.url);
      const path = url.pathname;

      const methodRoutes = routes.get(method);
      console.log({ methodRoutes });
      if (methodRoutes && methodRoutes.has(path)) {
        const handler = methodRoutes.get(path);
        if (handler) {
          return handler(req, {
            send: (body: string | object): Response => {
              return new Response(
                typeof body === "object" ? JSON.stringify(body) : body,
                { headers: { "Content-Type": "application/json" } }
              );
            },
            status: (code: number): Response =>
              new Response(null, { status: code }),
          });
        }
      }

      // Default 404
      return new Response("Not Found", { status: 404 });
    },
  });

  if (callback) callback();
};
