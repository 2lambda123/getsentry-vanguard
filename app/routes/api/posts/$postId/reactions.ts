import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { requireUserId } from "~/services/session.server";
import { isEmoji } from "~/lib/emoji";
import { togglePostReaction } from "~/models/post-reactions.server";

type ActionData = {
  errors?: {
    emoji?: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, 405);
  }
  invariant(params.postId, "postId not found");

  const userId = await requireUserId(request);

  const { emoji } = await request.json();

  if (typeof emoji !== "string" || emoji.length === 0 || !isEmoji(emoji)) {
    return json<ActionData>(
      { errors: { emoji: "Emoji is required" } },
      { status: 400 }
    );
  }
  // TODO: validate emoji

  const delta = await togglePostReaction({
    postId: params.postId,
    userId,
    emoji,
  });

  return json({
    emoji,
    delta,
  });
};
