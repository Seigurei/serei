import { serve } from "bun";
import type { Handler, Middleware, HttpMethod, Routes } from "./types";

const routes: Routes = new Map();
const globalMiddlewares: Middleware[] = [];

/**
 * Utility function to add a route with middlewares.
 */
const addRoute = (
  method: HttpMethod,
  path: string,
  handler: Handler,
  middlewares: Middleware[] = [],
): void => {
  if (!routes.has(method)) {
    routes.set(method, new Map());
  }
  routes.get(method)?.set(path, { handler, middlewares });
};

/**
 * Register routes with HTTP methods and optional middlewares.
 */
export const route = {
  get: (path: string, ...handlers: (Handler | Middleware)[]): void => {
    const { middlewares, handler } = extractMiddlewaresAndHandler(handlers);
    addRoute("GET", path, handler, middlewares);
  },
  post: (path: string, ...handlers: (Handler | Middleware)[]): void => {
    const { middlewares, handler } = extractMiddlewaresAndHandler(handlers);
    addRoute("POST", path, handler, middlewares);
  },
  put: (path: string, ...handlers: (Handler | Middleware)[]): void => {
    const { middlewares, handler } = extractMiddlewaresAndHandler(handlers);
    addRoute("PUT", path, handler, middlewares);
  },
  patch: (path: string, ...handlers: (Handler | Middleware)[]): void => {
    const { middlewares, handler } = extractMiddlewaresAndHandler(handlers);
    addRoute("PATCH", path, handler, middlewares);
  },
  delete: (path: string, ...handlers: (Handler | Middleware)[]): void => {
    const { middlewares, handler } = extractMiddlewaresAndHandler(handlers);
    addRoute("DELETE", path, handler, middlewares);
  },
};

/**
 * Add a global middleware.
 */
export const useMiddleware = (middleware: Middleware): void => {
  globalMiddlewares.push(middleware);
};

/**
 * Apply an array of middleware functions.
 */
const applyMiddlewares = async (
  middlewares: Middleware[],
  req: Request,
  res: {
    send: (body: string | object) => Response;
    status: (code: number) => Response;
  },
): Promise<boolean> => {
  for (const middleware of middlewares) {
    const proceed = await middleware(req, res);
    if (proceed === false) {
      return false; // Stop the middleware chain
    }
  }
  return true;
};

/**
 * Extract middlewares and the final handler from a list of handlers.
 */
const extractMiddlewaresAndHandler = (
  handlers: (Handler | Middleware)[],
): { middlewares: Middleware[]; handler: Handler } => {
  const middlewares = handlers.slice(0, -1) as Middleware[];
  const handler = handlers[handlers.length - 1] as Handler;
  return { middlewares, handler };
};

/**
 * Start the server and listen on the specified port.
 */
export const listen = (port: number, callback?: () => void): void => {
  serve({
    port,
    fetch: async (req: Request): Promise<Response> => {
      const method = req.method.toUpperCase() as HttpMethod;
      const url = new URL(req.url);
      const path = url.pathname;

      const methodRoutes = routes.get(method);
      if (methodRoutes && methodRoutes.has(path)) {
        const { handler, middlewares } = methodRoutes.get(path)!;

        const responseHandler = {
          send: (body: string | object): Response => {
            return new Response(
              typeof body === "object" ? JSON.stringify(body) : body,
              { headers: { "Content-Type": "application/json" } },
            );
          },
          status: (code: number): Response =>
            new Response(null, { status: code }),
        };

        // Apply global middlewares
        const globalProceed = await applyMiddlewares(
          globalMiddlewares,
          req,
          responseHandler,
        );
        if (!globalProceed) {
          return new Response("Global middleware terminated the request", {
            status: 403,
          });
        }

        // Apply route-specific middlewares
        const routeProceed = await applyMiddlewares(
          middlewares,
          req,
          responseHandler,
        );
        if (!routeProceed) {
          return new Response("Route middleware terminated the request", {
            status: 403,
          });
        }

        return handler(req, responseHandler);
      }

      // Default 404
      return new Response("Not Found", { status: 404 });
    },
  });

  if (callback) callback();
};
