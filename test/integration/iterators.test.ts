import * as Asserts from "https://deno.land/std@0.65.0/testing/asserts.ts";
import * as Iterators from "../../src/iterators.ts";

const userName = "interesno";
const postId = 2028861;
const commentId = 27792564;

Deno.test("posts(userName) should return all posts", async () => {
  // Arrange
  let count = 0;
  // Act
  for await (const post of Iterators.posts(userName)) {
    count++;
    // Assert
    Asserts.assert(post.id);
  }
  // Assert
  Asserts.assertEquals(count, 42);
});

Deno.test("comments(userName) should return all comments", async () => {
  // Arrange
  let count = 0;
  // Act
  for await (const comment of Iterators.comments(userName)) {
    count++;
    // Assert
    Asserts.assert(comment.id);
  }
  // Assert
  Asserts.assertEquals(count, 22);
});

Deno.test("karma(userName) should return karma votes", async () => {
  for await (const vote of Iterators.karma(userName)) {
    Asserts.assert(vote.vote);
  }
});

Deno.test("postVotes(id) should return votes", async () => {
  for await (const vote of Iterators.postVotes(postId)) {
    Asserts.assert(vote.vote);
  }
});

Deno.test("commentVotes(id) should return votes", async () => {
  for await (const vote of Iterators.commentVotes(commentId)) {
    Asserts.assert(vote.vote);
  }
});
