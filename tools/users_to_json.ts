import {UserSchema, KarmaSchema} from '../src/types';
import {save} from '../src/fs';
import {MongoClient} from 'mongodb';

(async function () {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();

  const db = client.db('dirty');
  const usersCollection = db.collection<UserSchema>('users');
  const karmaCollection = db.collection<KarmaSchema>('karma');

  const users: UserSchema[] = await usersCollection
    .aggregate([{$sort: {'dude.id': -1}}])
    .toArray();

  const usersResult: unknown[] = [];

  async function cacheKarma(login: string) {
    const votes: KarmaSchema[] = await karmaCollection
      .aggregate([{$match: {from: login}}, {$sort: {changed: 1}}])
      .toArray();

    if (votes.length === 0) {
      return;
    }

    const result = votes.map((v: KarmaSchema) => {
      return {
        from: v.from,
        to: v.to,
        changed: v.changed,
        vote: v.vote,
        deleted: v.deleted,
      };
    });

    await save(result, `cache/${login.toLowerCase()}.json`);
  }

  for (const user of users) {
    console.log(user.dude.id, user.dude.login);
    usersResult.push({
      id: user.dude.id,
      login: user.dude.login,
      gender: user.dude.gender,
      karma: user.dude.karma,
      posts_count: user.posts_count,
      comments_count: user.comments_count,
      subscribers_count: user.subscribers_count,
      active: user.dude.active,
      deleted: user.dude.deleted,
    });
    await cacheKarma(user.dude.login);
  }

  await save(usersResult, 'data/users.json');
})().catch(reason => console.log(reason));
