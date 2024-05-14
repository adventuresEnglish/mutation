"use client";

import { togglePostLikeStatus } from "@/actions/posts";
import { formatDate } from "@/lib/format";
import { useOptimistic } from "react";
import LikeButton from "./like-icon";

function Post({ post, action }) {
  return (
    <article className="post">
      <div className="post-image">
        <img
          src={post.image}
          alt={post.title}
        />
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title}</h2>
            <p>
              Shared by {post.userFirstName} on{" "}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </p>
          </div>
          <div>
            <form
              action={action.bind(null, post.id)}
              className={post.isLiked ? "liked" : ""}>
              <LikeButton />
            </form>
          </div>
        </header>
        d<p>{post.content}</p>
      </div>
    </article>
  );
}

export default function Posts({ posts }) {
  const [optimisticPosts, updatedOptimisticPosts] = useOptimistic(
    posts,
    (prevPosts, updatedPostId) => {
      const updatedPostIndex = prevPosts.findIndex(
        (post) => post.id === updatedPostId
      );
      if (updatedPostIndex === -1) {
        return prevPosts;
      }
      console.log("prevPost =", prevPosts[updatedPostIndex]);
      console.log("updatedPost =", { ...prevPosts[updatedPostIndex] });

      const updatedPost = prevPosts[updatedPostIndex];
      //const updatedPost = { ...prevPosts[updatedPostIndex] };
      updatedPost.likes = updatedPost.likes + (updatedPost.isLiked ? -1 : 1);
      // I feel like here is where there would need to be a check whether the specific user has already liked the post or not because I assume if we view this same post on another user's account, the like status would be the same regardless as to whether the current user has liked the post or not
      updatedPost.isLiked = !updatedPost.isLiked;
      const newPosts = [...prevPosts];
      newPosts[updatedPostIndex] = updatedPost;
      return newPosts;
    }
  );

  if (!posts || posts.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }

  async function updatePost(postId) {
    updatedOptimisticPosts(postId);
    await togglePostLikeStatus(postId);
  }

  return (
    <ul className="posts">
      {optimisticPosts.map((post) => (
        <li key={post.id}>
          <Post
            post={post}
            action={updatePost}
          />
        </li>
      ))}
    </ul>
  );
}
