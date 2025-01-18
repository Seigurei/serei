export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Handler = (
  req: Request,
  res: {
    send: (body: string | object) => Response;
    status: (code: number) => Response;
  },
) => Response | Promise<Response>;

export type Middleware = (
  req: Request,
  res: {
    send: (body: string | object) => Response;
    status: (code: number) => Response;
  },
) => boolean | Promise<boolean>;

export type RouteHandler = {
  handler: Handler;
  middlewares: Middleware[];
};

export type Routes = Map<HttpMethod, Map<string, RouteHandler>>;
