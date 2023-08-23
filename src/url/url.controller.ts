import { randomBytes } from "crypto";
import { DatabaseController } from "../database/database.controller";

export class UrlController {
  private db?: DatabaseController;

  async init() {
    this.db = await DatabaseController.build();
  }

  public static async build(): Promise<UrlController> {
    const urlController = new UrlController();
    urlController.init();
    return urlController;
  }

  async createShortUrl(req, res) {
    console.log(`${req.method} ${req.url}`);
    res.setHeader("Content-Type", "application/json");

    const url = req.body.originalLink;

    // Check for url to exist
    let keyForUrl = await this.db?.findUrl(url);
    if (keyForUrl == null) {
      keyForUrl = randomBytes(8).toString("hex");
    }
    await this.db?.setUrlForKey(keyForUrl, url);

    res.send({ url: "http://localhost:3000/" + keyForUrl });
  }

  async redirectToOriginalUrl(req, res) {
    console.log(`${req.method} ${req.url} ${req.params}`, req.params);

    const url = await this.db?.getUrlForKey(req.params.slug);

    res.redirect(url);
  }
}
