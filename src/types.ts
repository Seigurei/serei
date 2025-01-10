export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Handler = (
  req: Request,
  res: {
    send: (body: string | object) => Response;
    status: (code: number) => Response;
  }
) => Response;

export type Routes = Map<HttpMethod, Map<string, Handler>>;
