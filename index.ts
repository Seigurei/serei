import { listen, rGet, rPost } from "./src/server";

rGet("/", (_req, res) => res.send({ message: "Welcome to the Bun server!" }));
rPost("/data", (_req, res) => res.send({ message: "Data received!" }));

listen(3006, () => console.log("Server is running on http://localhost:3006"));
