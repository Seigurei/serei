import { listen, route, useMiddleware } from "./src/server";
import type { Middleware } from "./src/types";

// First Global Middleware
useMiddleware(async (req, res) => {
  console.log(`Global Middleware 1: ${req.method} ${req.url}`);
  return true;
});

// Second Global Middleware
useMiddleware(async (req, res) => {
  const startTime = Date.now();
  const result = true;
  console.log(`Global Middleware 2: Processing request...`);

  const endTime = Date.now();
  console.log(`Request processed in ${endTime - startTime}ms`);
  return result;
});

// Route-Specific Middleware
const authMiddleware: Middleware = async (req, res) => {
  const auth = req.headers.get("Authorization");
  if (!auth) {
    res.send({ error: "Unauthorized" });
    return false;
  }
  return true;
};

route.get("/hello", (_, res) => res.send({ message: "Hello, World!" }));
route.post("/echo", authMiddleware, async (req, res) => {
  const body = await req.json();
  return res.send({ received: body });
});

listen(3000, () => console.log("Server running on http://localhost:3000"));
