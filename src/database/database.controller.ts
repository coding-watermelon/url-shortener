import { createClient, RedisClientType } from "redis";

export class DatabaseController {
  redisClient: RedisClientType;

  constructor() {
    this.redisClient = createClient();
    this.redisClient.on("error", (err) =>
      console.log("Redis Client Error", err)
    );
  }

  async connect() {
    await this.redisClient.connect();
  }

  public static async build() {
    let databaseController = new DatabaseController();
    databaseController.connect();
    return databaseController;
  }

  async setUrlForKey(key: string, url: string) {
    await this.redisClient.set(key.toLowerCase(), url);
    await this.redisClient.set(`url:${url}`, key.toLowerCase());
    return;
  }

  async getUrlForKey(key: string): Promise<string | null> {
    return this.redisClient.get(key.toLowerCase());
  }

  async findUrl(url: string): Promise<string | null> {
    return await this.redisClient.get(`url:${url}`);
  }
}
