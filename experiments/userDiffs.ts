/*
  {
    "id": 36977,
    "login": "romaklimenko",
    "gender": "male",
    "karma": 368,
    "posts_count": 382,
    "comments_count": 7042,
    "subscribers_count": 39,
    "active": 1,
    "deleted": 0
  },
*/

import {Gender} from '../src/types';
import {Db} from '../src/db';

import * as fs from 'fs';
const resolve = require('path').resolve;

interface UserRecord {
  id: number;
  login: string;
  gender: Gender;
  city: {
    name: string;
  };
  country: {
    name: string;
  };
  karma: number;
  posts_count: number;
  comments_count: number;
  subscribers_count: number;
  active: number;
  deleted: number;
}

const oldUsers = JSON.parse(
  fs.readFileSync(resolve('data/users.json'), 'utf8')
) as UserRecord[];

const newUsers = JSON.parse(
  fs.readFileSync(resolve('data/users-new.json'), 'utf8')
) as UserRecord[];

console.log('hej');
console.log(oldUsers.length);
console.log(newUsers.length);

(async function () {
  const db = new Db();
  await db.connect();
  const diffs = await db.diffs();

  await diffs.deleteMany({});

  for (const oldUser of oldUsers) {
    console.log('old', oldUser.login, oldUser.id);
    await diffs.insertOne({
      _id: oldUser.id,
      old_login: oldUser.login,
      new_login: null,
      login_changed: false,
      old_gender: oldUser.gender,
      new_gender: null,
      gender_changed: false,
      old_city: oldUser.city?.name,
      new_city: null,
      city_changed: false,
      old_country: oldUser.country?.name,
      new_country: null,
      country_changed: false,
      old_karma: oldUser.karma,
      new_karma: null,
      diff_karma: 0,
      old_posts_count: oldUser.posts_count,
      new_posts_count: null,
      diff_posts_count: 0,
      old_comments_count: oldUser.comments_count,
      new_comments_count: null,
      diff_comments_count: 0,
      old_subscribers_count: oldUser.subscribers_count,
      new_subscribers_count: null,
      diff_subscribers_count: 0,
      old_active: oldUser.active,
      new_active: null,
      active_changed: false,
    });
  }

  for (const newUser of newUsers) {
    console.log('new', newUser.login, newUser.id);
    const user = await diffs.findOne({_id: newUser.id});
    if (user) {
      diffs.updateOne(
        {_id: newUser.id},
        {
          $set: {
            new_login: newUser.login,
            login_changed: user.old_login !== newUser.login,
            new_gender: newUser.gender,
            gender_changed: user.old_gender !== newUser.gender,
            new_karma: newUser.karma,
            diff_karma:
              newUser.karma - (user.old_karma === null ? 0 : user.old_karma),
            new_posts_count: newUser.posts_count,
            diff_posts_count:
              newUser.posts_count -
              (user.old_posts_count === null ? 0 : user.old_posts_count),
            new_comments_count: newUser.comments_count,
            diff_comments_count:
              newUser.comments_count -
              (user.old_comments_count === null ? 0 : user.old_comments_count),
            new_subscribers_count: newUser.subscribers_count,
            diff_subscribers_count:
              newUser.subscribers_count -
              (user.old_subscribers_count === null
                ? 0
                : user.old_subscribers_count),
            new_active: newUser.active,
            active_changed: user.old_active !== newUser.active,
          },
        }
      );
    } else {
      await diffs.insertOne({
        _id: newUser.id,
        old_login: null,
        new_login: newUser.login,
        login_changed: true,
        old_gender: null,
        new_gender: newUser.gender,
        gender_changed: true,
        old_city: null,
        new_city: newUser.city?.name,
        city_changed: true,
        old_country: null,
        new_country: newUser.country?.name,
        country_changed: true,
        old_karma: null,
        new_karma: newUser.karma,
        diff_karma: newUser.karma,
        old_posts_count: null,
        new_posts_count: newUser.posts_count,
        diff_posts_count: newUser.posts_count,
        old_comments_count: null,
        new_comments_count: newUser.comments_count,
        diff_comments_count: newUser.comments_count,
        old_subscribers_count: null,
        new_subscribers_count: newUser.subscribers_count,
        diff_subscribers_count: newUser.subscribers_count,
        old_active: null,
        new_active: newUser.active,
        active_changed: true,
      });
    }
  }
  await db.close();
})()
  .then(() => console.log('done!'))
  .catch(reason => console.log(reason));

// Добавлены:
// db.diffs.find({ old_login: null }).sort({ _id: 1 }).toArray()

// Удалены:
// db.diffs.find({ new_login: null }).sort({ _id: 1 }).toArray()

// Изменили пол:
// db.diffs.find({ gender_changed: true, old_gender: { $ne: null } }).sort({ _id: 1 }).toArray()

// Потеряли больше всего кармы:
// db.diffs.find({}, { new_login: true, diff_karma: true, _id: false }).sort({ diff_karma: 1 }).limit(10).toArray()

// Приобрели больше всего кармы:
// db.diffs.find({}, { new_login: true, diff_karma: true, _id: false }).sort({ diff_karma: -1 }).limit(10).toArray()

// Самые положительные голосовальщики в кармы в этом году:
// db.karma.aggregate([
//   { $match: { changed: { $gte: 1609459200 } } },
//   { $group: { _id: '$from', sum: { $sum: '$vote' } } },
//   { $sort: { sum: -1 } },
//   { $limit: 10 }
// ]).toArray()

// Самые отрицательные голосователи в кармы в этом году:
// db.karma.aggregate([
//   { $match: { changed: { $gte: 1609459200 } } },
//   { $group: { _id: '$from', sum: { $sum: '$vote' } } },
//   { $sort: { sum: 1 } },
//   { $limit: 10 }
// ]).toArray()

// Приобрели подписчиков:
// db.diffs.find({}, { new_login: 1, diff_subscribers_count: 1, _id: false }).sort({ diff_subscribers_count: -1 }).limit(10).toArray()

// Потеряли подписчиков:
// db.diffs.find({}, { new_login: 1, diff_subscribers_count: 1, _id: false }).sort({ diff_subscribers_count: 1 }).limit(10).toArray()

// Написали больше всего комментариев:
// db.diffs.find({}, { new_login: 1, diff_comments_count: 1, _id: false }).sort({ diff_comments_count: -1 }).limit(10).toArray()

// Написали больше всего постов:
// db.diffs.find({}, { new_login: 1, diff_posts_count: 1, _id: false }).sort({ diff_posts_count: -1 }).limit(10).toArray()
