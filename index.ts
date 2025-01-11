import { listen, route } from "./src/server";

route.get("/", (_req, res) =>
  res.send({ message: "Welcome to the Bun server!" })
);
route.post("/data", (_req, res) => res.send({ message: "Data received!" }));

listen(3006, () => console.log("Server is running on http://localhost:3006"));
