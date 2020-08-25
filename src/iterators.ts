import {
  Comment,
  CommentsResponse,
  PagedResponse,
  Post,
  PostsResponse,
  Vote,
  VotesResponse,
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

export function comments(userName: string) {
  return pageIterator<CommentsResponse, Comment>({
    url: `users/${userName}/comments`,
    perPage: 42,
    get: dirty.API.get,
    getEntities: (response: CommentsResponse) => response.comments,
  });
}

export function posts(userName: string) {
  return pageIterator<PostsResponse, Post>({
    url: `users/${userName}/posts`,
    perPage: 42,
    get: dirty.API.get,
    getEntities: (response: PostsResponse) => response.posts,
  });
}

const getVotes = (response: VotesResponse) =>
  (response.upvotes || []).concat(response.downvotes || []);

export function karma(userName: string) {
  return pageIterator<VotesResponse, Vote>({
    url: `users/${userName}/votes`,
    perPage: 210,
    get: dirty.API.get,
    getEntities: getVotes,
  });
}

export function postVotes(id: number) {
  return pageIterator<VotesResponse, Vote>({
    url: `posts/${id}/votes`,
    perPage: 210,
    get: dirty.API.get,
    getEntities: getVotes,
  });
}

export function commentVotes(id: number) {
  return pageIterator<VotesResponse, Vote>({
    url: `comments/${id}/votes`,
    perPage: 210,
    get: dirty.API.get,
    getEntities: getVotes,
  });
}

// TODO: domains
// TODO: domainPosts
// TODO: postComments
