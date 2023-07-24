import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { requireAdmin } from "~/services/auth.server";
import { paginate } from "~/lib/paginator";
import type { PaginatedResult } from "~/lib/paginator";
import Paginated from "~/components/paginated";
import Table from "~/components/table";
import { getPostList } from "~/models/post.server";
import BooleanIcon from "~/components/boolean-icon";
import PostLink from "~/components/post-link";
import PageHeader from "~/components/page-header";
import TimeSince from "~/components/timeSince";

type LoaderData = {
  postListPaginated: Awaited<
    PaginatedResult<Awaited<ReturnType<typeof getPostList>>>
  >;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireAdmin(request);
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const postListPaginated = await paginate(
    getPostList,
    { userId: user.id },
    cursor
  );
  return json<LoaderData>({ postListPaginated });
};

export default function Index() {
  const { postListPaginated } = useLoaderData<typeof loader>();

  return (
    <div>
      <PageHeader>
        <h1>Posts</h1>
      </PageHeader>
      <Paginated
        data={postListPaginated}
        render={(result) => {
          return (
            <Table className="table-auto">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Published?</th>
                  <th>Publish Date</th>
                </tr>
              </thead>
              <tbody>
                {result.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <PostLink post={post}>{post.title}</PostLink>
                    </td>
                    <td>
                      <Link to={`/u/${post.author.email}`}>
                        {post.author.email}
                      </Link>
                    </td>
                    <td>
                      <BooleanIcon value={post.published} />
                    </td>
                    <td>
                      <TimeSince date={post.publishedAt || post.createdAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          );
        }}
      />
    </div>
  );
}
