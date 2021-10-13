export type Gender = 'male' | 'female';

export interface Domain {
  id: number;
  prefix: string;
  readers_count: string;
  title: string;
  url: string;
}

export interface User {
  active: boolean;
  deleted: boolean;
  gender: Gender;
  id: number;
  is_golden: boolean;
  karma: number;
  login: string;
}

export interface CommentPost {
  id: number;
  url_slug: string;
}

export interface Comment {
  body: string;
  created: number;
  domain: Domain;
  id: number;
  post: CommentPost;
  rating: number;
  user: User;
}

export interface Post {
  changed: number;
  comments_count: number;
  created: number;
  data: {}; // TODO(romaklimenko): post types
  domain: Domain;
  favourites_count: number;
  golden: boolean;
  id: number;
  rating: number;
  tags: string[];
  title: string;
  url_slug: string;
  user: User;
}

export interface Vote {
  vote: number;
  changed: number;
  user: User;
}

export interface CommentsResponse extends PagedResponse {
  comments: Comment[];
}

export interface PostCommentsResponse {
  comments: Comment[];
}

export interface PostsResponse extends PagedResponse {
  posts: Post[];
}

export interface DomainsResponse extends PagedResponse {
  domains: Domain[];
}

export interface VotesResponse extends PagedResponse {
  upvotes: Vote[];
  downvotes: Vote[];
}

export interface UserResponse {
  status: 'OK' | 'ERR';
  subscribers_count: number;
  dude: {
    city: {
      id: number;
      name: string;
    };
    country: {
      id: number;
      name: string;
    };
    deleted: number;
    gender: string;
    subscribers_count: number;
    karma: number;
    login: string;
    active: number;
    id: number;
  };
  comments_count: number;
  posts_count: number;
}

export interface ResponseError {
  code: string;
}

export interface UserErrorResponse {
  status: 'ERR';
  errors: ResponseError[];
}

export interface PagedResponse {
  item_count: number;
  page_count: number;
  page: number;
  per_page: number;
}

export interface VoteRecord {
  title?: string;
  body?: string;
  changed: number;
  created: string;
  voted: string;
  diff: number;
  diffInDays: number;
  domain: string;
  type: 'comment' | 'post';
  url: string;
  vote: number;
  voter: string;
}

export interface VoterRecord {
  voter: string;
  downvotes: number;
  downvotesCount: number;
  upvotes: number;
  upvotesCount: number;
  sum: number;
}

export interface NotesResponse extends PagedResponse {
  user_notes: NoteResponse[];
}

export interface NoteResponse {
  body: string;
  id: number;
  created: number;
}
