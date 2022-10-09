import {Db, UserSchema, KarmaSchema} from '../src/db';
import {UserErrorResponse} from '../src/types';
import {getUser} from '../src/ajax';
import {karma} from '../src/iterators';
import * as retry from 'async-retry';

const fromId: number = parseInt(process.argv[2], 10) || 1;
const toId: number = parseInt(process.argv[3], 10) || Number.MAX_SAFE_INTEGER;

(async function (fromId: number, toId: number) {
  const db = new Db();
  await db.connect();
  const users = await db.users();
  const karmas = await db.karma();

  const maxErrors = 1000;
  let errortsLeft = maxErrors;

  for (let userId = fromId; userId < toId && errortsLeft > 0; userId++) {
    if (Math.random() < 0.10) {
      // с вероятностью 10% не пропускать недавно обновленных пользователей
    } else {
      const fetchedUser = await users.findOne({'dude.id': userId, fetched: { $exists: true }});
      if (fetchedUser && fetchedUser.fetched > (+new Date() / 1000 - 24 * 7 * 60 * 60)) {
        console.log(`User ID ${userId} is recently processed.`);
        errortsLeft = maxErrors;
        continue;
      }
    }

    const response = await retry(
      async () => await getUser(userId),
      {
        retries: 5,
        // minTimeout: 60 * 1000,
        maxTimeout: 60 * 1000,
        onRetry: (error, attemptNumber) => console.error('retry:', new Date(), error, attemptNumber)
      }
    );

    if (response.status === 'OK') {
      errortsLeft = maxErrors;
      console.log(userId, response.dude.login);
      if (response.dude.login === '') {
        continue;
      }
      for await (const vote of karma(response.dude.login)) {
        // этот документ мы запишем
        const doc: KarmaSchema = {
          from: vote.user.login,
          fromId: vote.user.id,
          to: response.dude.login,
          toId: response.dude.id,
          vote: vote.vote,
          changed: vote.changed,
          date: new Date(vote.changed * 1000).toISOString().substr(0, 10),
        };

        try {
          // если голос уже записан,
          await karmas.updateOne(
            {
              fromId: doc.fromId,
              toId: doc.toId,
              changed: doc.changed,
              vote: doc.vote,
            },
            {$set: doc}, // перезапишем с новым checked
            {upsert: true} // или запишем новый голос
          );
        } catch (error) {
          console.log(error);
        }
      }

      const doc: UserSchema = {
        _id: response.dude.login,
        status: response.status,
        subscribers_count: response.subscribers_count,
        dude: {
          city: response.dude.city,
          country: response.dude.country,
          deleted: response.dude.deleted,
          gender: response.dude.gender,
          subscribers_count: response.dude.subscribers_count,
          karma: response.dude.karma,
          login: response.dude.login,
          active: response.dude.active,
          id: response.dude.id,
        },
        comments_count: response.comments_count,
        posts_count: response.posts_count,
        fetched: Math.floor(+new Date() / 1000)
      };
      await users.replaceOne({ _id: doc._id }, doc, { upsert: true });
    } else {
      console.log(
        userId,
        (response as UserErrorResponse).errors,
        --errortsLeft,
        'errors left'
      );
    }
  }

  await db.close();
})(fromId, toId).catch(reason => console.log(reason));
