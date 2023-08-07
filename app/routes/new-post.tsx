import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";

import { announcePost, createPost, syndicatePost } from "~/models/post.server";
import { requireUser, requireUserId } from "~/services/auth.server";
import { getCategory, getCategoryList } from "~/models/category.server";
import type { Category } from "~/models/category.server";
import PostForm from "~/components/post-form";
import type { PostFormErrors } from "~/components/post-form";
import { getPostLink } from "~/components/post-link";
import { getFeedList } from "~/models/feed.server";
import type { Feed } from "~/models/feed.server";

type LoaderData = {
  categoryList: Category[];
  feedList: Feed[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const categoryList = await getCategoryList({
    userId,
    includeRestricted: false,
  });
  const feedList = await getFeedList({
    userId,
    includeRestricted: false,
  });
  return json<LoaderData>({ categoryList, feedList });
};

type ActionData = {
  errors?: PostFormErrors;
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const content = formData.get("content");
  const categoryId = formData.get("categoryId");
  const published =
    formData.get("published") === "true" ||
    formData.get("published") === "announce";
  const announce = formData.get("published") === "announce";
  const feedIds = formData.get("feedId") ? formData.getAll("feedId") : null;

  if (typeof categoryId !== "string" || categoryId.length === 0) {
    return json<ActionData>(
      { errors: { categoryId: "Category is required" } },
      { status: 400 },
    );
  }

  if (typeof title !== "string" || title.length === 0) {
    return json<ActionData>(
      { errors: { title: "Title is required" } },
      { status: 400 },
    );
  }

  if (typeof content !== "string" || content.length === 0) {
    return json<ActionData>(
      { errors: { content: "Content is required" } },
      { status: 400 },
    );
  }

  if (feedIds !== null) {
    const allowedFeedIds = (
      await getFeedList({
        userId: user.id,
        includeRestricted: false,
      })
    ).map((f) => f.id);
    const invalid = feedIds.find((f) => allowedFeedIds.indexOf(f) === -1);
    if (invalid) {
      return json<ActionData>(
        { errors: { feedId: "Invalid feed" } },
        { status: 400 },
      );
    }
  }

  const category = await getCategory({ id: categoryId });
  if (!category || (category.restricted && !user.canPostRestricted)) {
    return json<ActionData>(
      { errors: { categoryId: "Invalid category" } },
      { status: 400 },
    );
  }
  const meta = [];
  category.metaConfig.forEach(({ name, required }) => {
    const content = formData.get(`meta[${name}]`);
    if (required && !content) {
      return json<ActionData>(
        { errors: { meta: { name: `${name} is required` } } },
        { status: 400 },
      );
    }
    meta.push({
      name,
      content,
    });
  });

  const post = await createPost({
    userId: user.id,
    title,
    content,
    categoryId,
    published,
    meta,
    feedIds,
  });

  if (announce) {
    await announcePost(post);
  }

  await syndicatePost(post);

  return redirect(getPostLink(post));
};

export default function NewPostPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PostForm
      categoryList={loaderData.categoryList}
      feedList={loaderData.feedList}
      errors={actionData?.errors}
    />
  );
}
