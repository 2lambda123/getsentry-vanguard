import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getPost, getReactionsForPosts } from "~/models/post.server";
import type { PostQueryType } from "~/models/post.server";
import type { User } from "~/models/user.server";
import { requireUser } from "~/session.server";
import { default as PostTemplate } from "~/components/post";
import moment from "moment";
import { DefinitionList } from "~/components/definition-list";
import * as Panel from "~/components/panel";
import Block from "~/components/block";
import EmojiRection from "~/components/emoji-reaction";

type LoaderData = {
  post: PostQueryType;
  reactions: any[];
  user: User;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  invariant(params.postId, "postId not found");

  const post = await getPost({ userId: user.id, id: params.postId });
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  const reactions = (
    await getReactionsForPosts({ userId: user.id, postList: [post] })
  )[post.id];

  return json<LoaderData>({ post, user, reactions });
};

const PostActions = ({
  post,
  reactions,
}: {
  post: PostQueryType;
  reactions: any[];
}) => {
  const bakedIn = ["❤️"];
  const allEmoji = [
    ...bakedIn,
    ...reactions
      .filter((r) => bakedIn.indexOf(r.emoji) === -1)
      .map((r) => r.emoji),
  ];

  return (
    <Block>
      {allEmoji.map((emoji) => {
        const reactionData = reactions.find((r) => r.emoji === emoji);
        return (
          <EmojiRection
            postId={post.id}
            count={reactionData?.total || 0}
            emoji={emoji}
            selected={reactionData?.user || false}
          />
        );
      })}
    </Block>
  );
};

// const PostAdmin = ({ post }: { post: PostQueryType }) => {
//   return (
//     <Panel.Panel>
//       <Panel.Title>Admin</Panel.Title>
//       <DefinitionList>
//         <dt>Created At</dt>
//         <dd>{moment(post.createdAt).format()}</dd>
//         <dt>Published At</dt>
//         <dd>{moment(post.publishedAt).format()}</dd>
//         <dt>Updated At</dt>
//         <dd>{moment(post.updatedAt).format()}</dd>
//       </DefinitionList>
//     </Panel.Panel>
//   );
// };

export default function PostDetailsPage() {
  const { post, user, reactions } = useLoaderData() as LoaderData;

  const canEdit = post.authorId === user.id || user.admin;

  return (
    <div>
      <PostTemplate post={post} canEdit={canEdit} />
      <PostActions post={post} reactions={reactions} />
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Post not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
