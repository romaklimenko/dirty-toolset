import * as Asserts from "https://deno.land/std@0.65.0/testing/asserts.ts";
import * as Iterators from "../../src/iterators.ts";

const username = "interesno";

Deno.test("posts(username) should return all posts", async () => {
  // Arrange
  let count = 0;
  // Act
  for await (const post of Iterators.posts(username)) {
    count++;
    // Assert
    Asserts.assert(post.id);
  }
  // Assert
  Asserts.assertEquals(count, 42);
});

Deno.test("comments(username) should return all comments", async () => {
  // Arrange
  let count = 0;
  // Act
  for await (const comment of Iterators.comments(username)) {
    count++;
    // Assert
    Asserts.assert(comment.id);
  }
  // Assert
  Asserts.assertEquals(count, 22);
});

Deno.test("karma(username) should return karma votes", async () => {
  // Arrange
  let count = 0;
  // Act
  for await (const vote of Iterators.karma(username)) {
    count++;
    // Assert
    Asserts.assert(vote.vote);
  }
});
