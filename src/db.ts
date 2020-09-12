import {MongoClient} from 'mongodb';
import {KarmaSchema, UserDiffSchema, UserSchema} from './types';

export class Db {
  private client: MongoClient;

  constructor() {
    this.client = new MongoClient('mongodb://localhost:27017');
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
    await collection.createIndexes([{key: {'dude.login': 1}, unique: true}]);
    return collection;
  }

  async karma() {
    const collection = this.db().collection<KarmaSchema>('karma');
    await collection.createIndexes([
      {key: {from: 1, to: 1, changed: 1, vote: 1}, unique: true},
      {key: {to: 1, checked: 1, deleted: 1}},
      {key: {date: 1}},
    ]);
    return collection;
  }

  async diffs() {
    const collection = this.db().collection<UserDiffSchema>('diffs');
    return collection;
  }
}
