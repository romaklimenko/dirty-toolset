import * as Iterators from '../src/iterators';
import {save} from '../src/fs';
import * as prompt from 'async-prompt';

require('dotenv').config();

interface KarmaRecord {
  changed: number;
  date: Date;
  voter: string;
  vote: number;
}

const prettyVote = (vote: number) => (vote > 0 ? `+${vote}` : `${vote}`);

(async function () {
  const userName = process.argv[2] ?? (await prompt('username: '));

  const karma: KarmaRecord[] = [];
  for await (const vote of Iterators.karma(userName)) {
    console.log(prettyVote(vote.vote), 'в карму от', vote.user.login);

    karma.push({
      changed: vote.changed,
      date: new Date(vote.changed * 1000),
      voter: vote.user.login,
      vote: vote.vote,
    });
  }

  karma.sort((a, b) => (a.changed > b.changed ? -1 : 1));
  await save(karma, `${process.env.DATA}/${userName}-karma.json`);
})().catch(reason => console.error(reason));
