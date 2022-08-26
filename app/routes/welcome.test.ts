import { expectRequiresUser } from "~/lib/test/expects";
import { action, loader } from "./welcome";

describe("GET /welcome", () => {
  it("requires user", async () => {
    await expectRequiresUser(
      loader({
        request: new Request(`http://localhost/welcome`, {
          method: "GET",
        }),
        params: {},
        context: {},
      })
    );
  });
});

describe("POST /welcome", () => {
  it("requires user", async () => {
    await expectRequiresUser(
      action({
        request: new Request(`http://localhost/welcome`, {
          method: "POST",
        }),
        params: {},
        context: {},
      })
    );
  });
});
