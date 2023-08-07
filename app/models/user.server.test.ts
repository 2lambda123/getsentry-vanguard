import type { User } from "@prisma/client";
import { prisma } from "~/services/db.server";
import { getUserList, updateUser } from "~/models/user.server";
import * as Fixtures from "~/lib/test/fixtures";

describe("getUserList", () => {
  let user: User;

  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        email: "foo@example.com",
        name: "Bar",
      },
    });
  });

  describe("query", () => {
    test("matches email", async () => {
      let result = await getUserList({
        query: "foo",
      });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(user.id);
    });
    test("matches name", async () => {
      let result = await getUserList({
        query: "bar",
      });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(user.id);
    });
    test("doesnt match everything", async () => {
      let result = await getUserList({
        query: "baz",
      });
      expect(result.length).toBe(0);
    });
  });
});

describe("updateUser", () => {
  let user: User;

  beforeEach(async () => {
    user = await Fixtures.User();
  });

  it("can change name on self", async () => {
    let newUser = await updateUser({
      id: user.id,
      userId: user.id,
      name: "Fancy",
    });
    expect(newUser).toBeDefined();
    expect(newUser.name).toBe("Fancy");
  });

  it("can change picture on self", async () => {
    let newUser = await updateUser({
      id: user.id,
      userId: user.id,
      picture:
        "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
    });
    expect(newUser).toBeDefined();
    expect(newUser.picture).toBe(
      "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
    );
  });

  it("can change notifyReplies on self", async () => {
    let newUser = await updateUser({
      id: user.id,
      userId: user.id,
      notifyReplies: false,
    });
    expect(newUser).toBeDefined();
    expect(newUser.notifyReplies).toBe(false);
  });

  it("cannot change admin on self", async () => {
    let newUser = await updateUser({
      id: user.id,
      userId: user.id,
      admin: true,
    });
    expect(newUser).toBeDefined();
    expect(newUser.admin).toBe(false);
  });

  it("cannot change canPostRestricted on self", async () => {
    let newUser = await updateUser({
      id: user.id,
      userId: user.id,
      canPostRestricted: true,
    });
    expect(newUser).toBeDefined();
    expect(newUser.canPostRestricted).toBe(false);
  });
});
