import {ObjectId} from 'mongodb';

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

export interface UserResponse {
  status: 'OK' | 'ERR';
  subscribers_count: number;
  dude: {
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

export interface MongoDocument {
  _id?: ObjectId;
}

export interface UserSchema extends UserResponse {
  _id: string;
}

export interface KarmaSchema extends MongoDocument {
  from: string;
  to: string;
  changed: number;
  date: string;
  vote: number;
  checked: string;
  deleted: boolean;
}

export interface UserDiffSchema {
  _id: number;
  old_login: string | null;
  new_login: string | null;
  login_changed: boolean;
  old_gender: Gender | null;
  new_gender: Gender | null;
  gender_changed: boolean;
  old_karma: number | null;
  new_karma: number | null;
  diff_karma: number;
  old_posts_count: number | null;
  new_posts_count: number | null;
  diff_posts_count: number;
  old_comments_count: number | null;
  new_comments_count: number | null;
  diff_comments_count: number;
  old_subscribers_count: number | null;
  new_subscribers_count: number | null;
  diff_subscribers_count: number;
  old_active: number | null;
  new_active: number | null;
  active_changed: boolean;
}
