import * as httpMocks from "node-mocks-http";
import { UrlController } from "./url.controller";

describe("UrlController", () => {
  let controller: UrlController;

  const exampleUrl = "https://cataas.com/cat/says/hello";

  async function sendUrlCreationRequest(url): Promise<{ url: string }> {
    const request = httpMocks.createRequest();
    const response = httpMocks.createResponse();

    request.url = "/link";
    request.method = "POST";
    request.body = {
      originalLink: url,
    };

    await controller.createShortUrl(request, response);

    return response._getData();
  }

  beforeAll(() => {
    jest.mock("redis", () => ({
      RedisClient: { prototype: {} },
      createClient: jest.fn(),
    }));
  });

  beforeEach(async () => {
    controller = await UrlController.build();
  });

  it("Should create a short URL", async () => {
    const urlMatcher = expect.stringMatching(
      /^http\:\/\/localhost\:3000\/[a-zA-Z0-9\-]{5,}$/
    );

    const response = await sendUrlCreationRequest(exampleUrl);

    expect(response).toHaveProperty("url", urlMatcher);
  });

  it("Should create a the same key for the same url", async () => {
    const firstResponse = await sendUrlCreationRequest(exampleUrl);
    const firstUrl = firstResponse.url;

    const secondResponse = await sendUrlCreationRequest(exampleUrl);
    const secondUrl = secondResponse.url;

    expect(firstUrl).toBe(secondUrl);
  });

  it("Should redirect a short URL to the original URL", async () => {
    const request = httpMocks.createRequest();
    const response = httpMocks.createResponse();

    const urlCreationResponse = await sendUrlCreationRequest(exampleUrl);
    request.url = urlCreationResponse.url;

    const slug = urlCreationResponse.url.split("/").pop() as string;
    request.params = { slug };

    await controller.redirectToOriginalUrl(request, response);

    expect(response._getRedirectUrl()).toBe(exampleUrl);
  });

  it("Should redirect a short URL to the original URL regardless of the letter case", async () => {
    const request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    const urlCreationResponse = await sendUrlCreationRequest(exampleUrl);
    const shortUrl = urlCreationResponse.url;
    const slug = shortUrl.split("/").pop() as string;

    request.url = `https://localhost:3000/${slug.toLowerCase()}`;
    request.params = { slug: slug.toLowerCase() };

    await controller.redirectToOriginalUrl(request, response);

    expect(response._getRedirectUrl()).toBe(exampleUrl);

    response = httpMocks.createResponse();
    request.url = `https://localhost:3000/${slug.toUpperCase()}`;
    request.params = { slug: slug.toUpperCase() };
    await controller.redirectToOriginalUrl(request, response);

    expect(response._getRedirectUrl()).toBe(exampleUrl);
  });
});
