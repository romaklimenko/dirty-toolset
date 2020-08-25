export type Gender = "male" | "female";

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

export interface PostsResponse extends PagedResponse {
  posts: Post[];
}

export interface VotesResponse extends PagedResponse {
  upvotes: Vote[];
  downvotes: Vote[];
}

export interface PagedResponse {
  item_count: number;
  page_count: number;
  page: number;
  per_page: number;
}
