import {
  Comment,
  CommentsResponse,
  Domain,
  DomainsResponse,
  PagedResponse,
  Post,
  PostCommentsResponse,
  PostsResponse,
  Vote,
  VotesResponse,
} from './types';
import {get} from './api';

type EntityGetter<TResponse, TEntity> = (response: TResponse) => TEntity[];

interface PageIteratorOptions<TResponse extends PagedResponse, TEntity> {
  url: string;
  perPage: number;
  entitiesGetter: EntityGetter<TResponse, TEntity>;
}

function pageIterator<TResponse extends PagedResponse, TEntity>(
  options: PageIteratorOptions<TResponse, TEntity>
) {
  const url = `${options.url}${options.url.indexOf('?') !== -1 ? '&' : '?'}`;

  return (async function* () {
    const entities: TEntity[] = [];
    let pageCount = 1;
    let page = 1;

    while (entities.length === 0 && page <= pageCount) {
      const response = await get(
        // eslint-disable-next-line prettier/prettier
        `${url}per_page=${options.perPage}&page=${page++}`
      );
      const json = (await response.json()) as TResponse;
      pageCount = json.page_count;
      entities.push(...options.entitiesGetter(json));

      while (entities.length > 0) {
        yield entities.shift() as TEntity;
      }
    }
  })();
}

export function comments(userName: string) {
  return pageIterator<CommentsResponse, Comment>({
    url: `users/${userName}/comments`,
    perPage: 42,
    entitiesGetter: (response: CommentsResponse) => response.comments,
  });
}

export function posts(userName: string) {
  return pageIterator<PostsResponse, Post>({
    url: `users/${userName}/posts`,
    perPage: 42,
    entitiesGetter: (response: PostsResponse) => response.posts,
  });
}

const getVotes = (response: VotesResponse) =>
  (response.upvotes || []).concat(response.downvotes || []);

export function karma(userName: string) {
  return pageIterator<VotesResponse, Vote>({
    url: `users/${userName}/votes`,
    perPage: 210,
    entitiesGetter: getVotes,
  });
}

export function postVotes(id: number) {
  return pageIterator<VotesResponse, Vote>({
    url: `posts/${id}/votes`,
    perPage: 210,
    entitiesGetter: getVotes,
  });
}

export function commentVotes(id: number) {
  return pageIterator<VotesResponse, Vote>({
    url: `comments/${id}/votes`,
    perPage: 210,
    entitiesGetter: getVotes,
  });
}

export function domains() {
  return pageIterator<DomainsResponse, Domain>({
    url: 'domains',
    perPage: 42,
    entitiesGetter: (response: DomainsResponse) => response.domains,
  });
}

export function domainPosts(prefix: string, from: number, to: number) {
  return pageIterator<PostsResponse, Post>({
    url: `posts2/?created__gte=${from}&created__lt=${to}&domain_prefix=${prefix}`,
    perPage: 42,
    entitiesGetter: (response: PostsResponse) => response.posts,
  });
}

export async function* postComments(id: number) {
  const response = await get(`posts/${id}/comments`);
  const json = (await response.json()) as PostCommentsResponse;
  for (const comment of json.comments) {
    yield comment as Comment;
  }
}
