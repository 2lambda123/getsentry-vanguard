import React from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";

import { createPost } from "~/models/post.server";
import { requireUserId } from "~/session.server";
import { getCategory, getCategoryList } from "~/models/category.server";
import type { Category } from "~/models/category.server";
import PostForm, { PostFormErrors } from "~/components/post-form";
import { getPostLink } from "~/components/post-link";

type LoaderData = {
  categoryList: Category[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const categoryList = await getCategoryList({
    userId,
    includeRestricted: false,
  });
  return json<LoaderData>({ categoryList });
};

type ActionData = {
  errors?: PostFormErrors;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const content = formData.get("content");
  const categoryId = formData.get("categoryId");
  const published = formData.get("published");

  if (typeof categoryId !== "string" || categoryId.length === 0) {
    return json<ActionData>(
      { errors: { categoryId: "Category is required" } },
      { status: 400 }
    );
  }

  if (typeof title !== "string" || title.length === 0) {
    return json<ActionData>(
      { errors: { title: "Title is required" } },
      { status: 400 }
    );
  }

  if (typeof content !== "string" || content.length === 0) {
    return json<ActionData>(
      { errors: { content: "Content is required" } },
      { status: 400 }
    );
  }

  const post = await createPost({
    title,
    content,
    categoryId,
    userId,
    published: !!published,
  });

  const category = await getCategory({ id: categoryId });

  return redirect(getPostLink(post));
};

export default function NewPostPage() {
  const loaderData = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;

  return (
    <PostForm
      categoryList={loaderData.categoryList}
      errors={actionData?.errors}
    />
  );
}
