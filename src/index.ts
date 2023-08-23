import express from "express";
import { UrlController } from "./url/url.controller";
import bodyParser from "body-parser";

async function main() {
  const server = express();

  // Middlewares
  server.use(bodyParser.json());

  const urlController = await UrlController.build();

  server.get("/link", (req, res) => {
    console.log(`${req.method} ${req.url}`);
    res.setHeader("Content-Type", "text/plain");
    res.send("I should return a 405 error");
  });

  server.post("/link", urlController.createShortUrl);

  server.get("/:slug", urlController.redirectToOriginalUrl);

  server.use(async (req, res) => {
    console.log(`${req.method} ${req.url}`);
    res.setHeader("Content-Type", "text/plain");
    res.send("I should return a 404 error");
  });

  server.listen(3000, () => {
    console.log("Server listening on port 3000");
  });
}

main();
