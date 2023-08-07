import { expectRequiresAdmin } from "~/lib/test/expects";
import * as Fixtures from "~/lib/test/fixtures";
import { buildRequest } from "~/lib/test/request";
import { prisma } from "~/services/db.server";

import { loader, action } from "./new";

const EMOJI = "🦰";

describe("GET /admin/categories/new", () => {
  it("requires admin", async () => {
    await expectRequiresAdmin(
      loader({
        request: await buildRequest(
          `http://localhost/admin/categories/new`,
          {
            method: "GET",
          },
          { user: DefaultFixtures.DEFAULT_USER },
        ),
        params: {},
        context: {},
      }),
    );
  });
});

describe("POST /admin/categories/new", () => {
  it("requires admin", async () => {
    await expectRequiresAdmin(
      action({
        request: await buildRequest(
          `http://localhost/admin/categories/new`,
          {
            method: "POST",
          },
          { user: DefaultFixtures.DEFAULT_USER },
        ),
        params: {},
        context: {},
      }),
    );
  });

  it("validates defaultEmojis", async () => {
    const user = await Fixtures.User({ admin: true });

    const formData = new FormData();
    formData.append("name", "test");
    formData.append("slug", "test");
    formData.append("colorHex", "#000000");
    formData.append("defaultEmojis", "abc");

    const response: Response = await action({
      request: await buildRequest(
        `http://localhost/admin/categories/new`,
        {
          method: "POST",
          body: formData,
        },
        { user },
      ),
      params: {},
      context: {},
    });

    expect(response.status).toBe(400);
    const rdata = await response.json();
    expect(rdata.errors.defaultEmojis).toBeDefined();
  });

  it("persists defaultEmojis", async () => {
    const user = await Fixtures.User({ admin: true });

    const formData = new FormData();
    formData.append("name", "test");
    formData.append("slug", "test");
    formData.append("colorHex", "#000000");
    formData.append("defaultEmojis", EMOJI);

    const response: Response = await action({
      request: await buildRequest(
        `http://localhost/admin/categories/new`,
        {
          method: "POST",
          body: formData,
        },
        { user },
      ),
      params: {},
      context: {},
    });

    expect(response.status).toBe(302);

    const newCat = await prisma.category.findUnique({
      where: {
        slug: "test",
      },
    });
    expect(newCat?.defaultEmojis).toEqual([EMOJI]);
  });
});
