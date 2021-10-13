import {MongoClient, ObjectId} from 'mongodb';
import {Gender, NoteResponse, UserResponse} from './types';

export class Db {
  private client: MongoClient;

  constructor() {
    this.client = new MongoClient(process.env.MONGO as string);
  }

  private db() {
    return this.client.db('dirty');
  }

  async connect() {
    await this.client.connect();
  }

  async close() {
    await this.client.close();
  }

  async users() {
    const collection = this.db().collection<UserSchema>('users');
    await collection.createIndexes([
      {key: {'dude.login': 1}, unique: true},
      {key: {'dude.id': 1}, unique: true},
    ]);
    return collection;
  }

  async karma() {
    const collection = this.db().collection<KarmaSchema>('karma');
    await collection.createIndexes([
      {key: {'dude.id': 1}},
      {key: {changed: 1}},
      {key: {date: 1}},
      {key: {deleted: 1}},
      {key: {from: 1, to: 1, changed: 1, vote: 1}},
      {key: {fromId: 1, changed: 1}},
      {key: {fromId: 1, toId: 1, changed: 1, vote: 1}, unique: true},
      {key: {to: 1, checked: 1, deleted: 1}},
      {key: {toId: 1, checked: 1, deleted: 1}},
    ]);
    return collection;
  }

  async notes() {
    const collection = this.db().collection<NoteSchema>('notes');
    await collection.createIndexes([
      {key: {author: 1, body: 1, id: 1, created: 1}, unique: true},
    ]);
    return collection;
  }

  async diffs() {
    const collection = this.db().collection<UserDiffSchema>('diffs');
    return collection;
  }
}

export interface MongoDocument {
  _id?: ObjectId;
}

export interface UserSchema extends UserResponse {
  _id: string;
}

export interface KarmaSchema extends MongoDocument {
  from: string;
  fromId: number;
  to: string;
  toId: number;
  changed: number;
  date: string;
  vote: number;
}

export interface UserDiffSchema {
  _id: number;
  old_login: string | null;
  new_login: string | null;
  login_changed: boolean;
  old_gender: Gender | null;
  new_gender: Gender | null;
  gender_changed: boolean;
  old_city: string | null;
  new_city: string | null;
  city_changed: boolean;
  old_country: string | null;
  new_country: string | null;
  country_changed: boolean;
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

export interface NoteSchema extends MongoDocument, NoteResponse {
  author: string;
  date: string;
}
