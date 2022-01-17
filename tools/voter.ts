import * as prompt from 'async-prompt';
import * as Iterators from '../src/iterators';
import { save } from '../src/fs';

require('dotenv').config();

interface Record {
  id: number;
  created: number;
  voted?: number;
  vote?: number;
}

(async function () {
  const fromUserName = process.argv[2] ?? (await prompt('from username: '));
  const toUserName = process.argv[3] ?? (await prompt('to username: '));

  const records: Record[] = [];

  for await (const comment of Iterators.comments(toUserName)) {
    const record: Record = {
      id: comment.id,
      created: comment.created,
    };

    for await (const vote of Iterators.commentVotes(comment.id)) {
      if (vote.user.login.toLowerCase() === fromUserName.toLowerCase()) {
        record.voted = vote.changed;
        record.vote = vote.vote;
      }
    }

    records.push(record);
    try {
      console.log(
        'comment', comment.id,
        'created', new Date(record.created * 1000).toISOString(),
        'voted', record.voted ? new Date(record.voted * 1000).toISOString() : undefined,
        'vote', record.vote,
        'diff in days', record.voted ? Math.floor((record.voted - record.created) / 86400) : undefined,
      );
    } catch (error) {
      console.error(error);
    }
  }

  for await (const post of Iterators.posts(toUserName)) {
    const record: Record = {
      id: post.id,
      created: post.created,
    };

    for await (const vote of Iterators.postVotes(post.id)) {
      if (vote.user.login.toLowerCase() === fromUserName.toLowerCase()) {
        record.voted = vote.changed;
        record.vote = vote.vote;
      }
    }

    records.push(record);
    try {
      console.log(
        'comment', post.id,
        'created', new Date(record.created * 1000).toISOString(),
        'voted', record.voted ? new Date(record.voted * 1000).toISOString() : undefined,
        'vote', record.vote,
        'diff in days', record.voted ? Math.floor((record.voted - record.created) / 86400) : undefined,
      );
    } catch (error) {
      console.error(error);
    }
  }

  records.sort((a, b) => a.created - b.created);

  save(records, `${process.env.DATA}/${fromUserName}-to-${toUserName}.json`);

})().catch(reason => console.error(reason));
