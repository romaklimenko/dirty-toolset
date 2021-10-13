import * as prompt from 'async-prompt';
import {Db} from '../src/db';
import {note} from '../src/notes';

require('dotenv').config();

function epochToDate(epoch: number) {
  return new Date(epoch * 1000).toISOString().substring(0, 10);
}

(async function () {
  const from = parseInt(process.argv[2] ?? (await prompt('from: ')));
  const to = parseInt(process.argv[3] ?? (await prompt('to: ')));

  const db = new Db();
  await db.connect();
  const users = await db.users();
  const notes = await db.notes();

  for await (const user of users.find({'dude.id': {$gte: from, $lte: to}})) {
    console.log(user.dude.id, user.dude.login);
    const n = await note(user.dude.login, process.env.USERNAME);
    if (n) {
      console.log(`\t${n.body}`);
      try {
        await notes.insertOne({
          author: user.dude.login,
          body: n.body,
          created: n.created,
          date: epochToDate(n.created),
          id: n.id,
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  await db.close();
})().catch(console.error);
