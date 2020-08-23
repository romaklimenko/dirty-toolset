import {
  Comment,
  CommentsResponse,
  KarmaVote,
  KarmaResponse,
  PagedResponse,
  Post,
  PostsResponse,
} from "./types.ts";
import { dirty } from "./rest.ts";

type EntityGetter<TResponse, TEntity> = (response: TResponse) => TEntity[];

interface PageIteratorOptions<TResponse extends PagedResponse, TEntity> {
  url: string;
  perPage: number;
  get: (url: string) => Promise<Response>;
  getEntities: EntityGetter<TResponse, TEntity>;
}

function pageIterator<TResponse extends PagedResponse, TEntity>(
  options: PageIteratorOptions<TResponse, TEntity>,
): AsyncGenerator<TEntity> {
  return async function* (): AsyncGenerator<TEntity> {
    const entities: TEntity[] = [];
    let pageCount = 1;
    let page = 1;

    while (entities.length === 0 && page <= pageCount) {
      const response = await options.get(
        `${options.url}?per_page=${options.perPage}&page=${page++}`,
      );
      const json = <TResponse> await response.json();
      pageCount = json.page_count;
      entities.push(...options.getEntities(json));

      while (entities.length > 0) {
        yield < TEntity > entities.shift();
      }
    }
  }();
}

export function comments(username: string) {
  return pageIterator<CommentsResponse, Comment>({
    url: `users/${username}/comments`,
    perPage: 42,
    get: dirty.API.get,
    getEntities: (response: CommentsResponse) => response.comments,
  });
}

export function posts(username: string) {
  return pageIterator<PostsResponse, Post>({
    url: `users/${username}/posts`,
    perPage: 42,
    get: dirty.API.get,
    getEntities: (response: PostsResponse) => response.posts,
  });
}

export function karma(username: string) {
  return pageIterator<KarmaResponse, KarmaVote>({
    url: `users/${username}/votes`,
    perPage: 210,
    get: dirty.API.get,
    getEntities: (response: KarmaResponse) =>
      response.upvotes.concat(response.downvotes),
  });
}

// TODO: domains
// TODO: domainPosts

// TODO: postComments

// TODO: postVotes
// TODO: commentVotes
