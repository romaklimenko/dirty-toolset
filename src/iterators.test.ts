/* global describe */
/* global test */
/* global expect */

import * as Iterators from './iterators';

const userName = 'interesno';
const postId = 2028861;
const commentId = 27792564;

describe('iterators', () => {
  describe('integration', () => {
    test('posts(userName) should return all posts', async () => {
      // Arrange
      let count = 0;
      // Act
      for await (const post of Iterators.posts(userName)) {
        count++;
        // Assert
        expect(post.id).not.toBeNaN();
      }
      expect(count).toBe(42);
    });

    test('comments(userName) should return all comments', async () => {
      // Arrange
      let count = 0;
      // Act
      for await (const comment of Iterators.comments(userName)) {
        count++;
        // Assert
        expect(comment.id).not.toBeNaN();
      }
      // Assert
      expect(count).toBe(22);
    });

    test('karma(userName) should return karma votes', async () => {
      for await (const vote of Iterators.karma(userName)) {
        expect(vote.vote).toBeDefined();
      }
    });

    test('postVotes(id) should return votes', async () => {
      for await (const vote of Iterators.postVotes(postId)) {
        expect(vote.vote).toBeDefined();
      }
    });

    test('commentVotes(id) should return votes', async () => {
      for await (const vote of Iterators.commentVotes(commentId)) {
        expect(vote.vote).toBeDefined();
      }
    });

    test('domains() should return domains', async () => {
      let count = 10;
      for await (const domain of Iterators.domains()) {
        if (--count < 0) {
          break;
        }
        expect(domain.id).toBeDefined();
        expect(domain.prefix).toBeDefined();
        expect(domain.readers_count).toBeDefined();
      }
    });

    test('domainPosts() should return posts', async () => {
      let count = 26;
      for await (const post of Iterators.domainPosts(
        'denmark',
        1599836426,
        1601637623
      )) {
        if (--count < 0) {
          break;
        }
        expect(post.id).toBeDefined();
        expect(post.title).toBeDefined();
      }
      expect(count).toBe(0);
    });

    test('postComments() should return comments', async () => {
      for await (const comment of Iterators.postComments(2048650)) {
        expect(comment.id).toBeDefined();
        expect(comment.body).toBeDefined();
      }
    });
  });
});
