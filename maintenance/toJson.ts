import {Db, UserSchema, KarmaSchema} from '../src/db';
import {save} from '../src/fs';

(async function () {
  const db = new Db();
  await db.connect();
  const usersCollection = await db.users();
  const karmaCollection = await db.karma();

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
  await save(usersResult, 'data/users-new.json');
  await db.close();
})()
  .then(() => console.log('done!'))
  .catch(reason => console.log(reason));
