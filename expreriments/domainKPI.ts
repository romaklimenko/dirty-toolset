import * as Iterators from '../src/iterators';
import {save} from '../src/fs';
import * as prompt from 'async-prompt';

require('dotenv').config();

interface DomainKpiRecord {
  authors: Set<string>;
  authorCount: number;
  postCount: number;
  postVoters: Set<string>;
  postVotersCount: number;
  commentCount: number;
  commenterCount: number;
  commenters: Set<string>;
  goldenCount: number;
}

interface DomainKpiRecords {
  [key: string]: DomainKpiRecord;
}

function epochToDate(epoch: number) {
  return new Date(epoch * 1000).toISOString().substring(0, 10);
}

function getRecord(records: DomainKpiRecords, epoch: number): DomainKpiRecord {
  const date = epochToDate(epoch);

  if (records[date]) {
    return records[date];
  } else {
    records[date] = {
      authors: new Set<string>(),
      authorCount: 0,
      postCount: 0,
      postVoters: new Set<string>(),
      postVotersCount: 0,
      commentCount: 0,
      commenterCount: 0,
      commenters: new Set<string>(),
      goldenCount: 0,
    };
    return records[date];
  }
}

(async function () {
  const prefix = process.argv[2] ?? (await prompt('domain prefix: '));
  const from = parseInt(process.argv[3] ?? (await prompt('from: ')));
  const to = parseInt(process.argv[4] ?? (await prompt('to: ')));

  const records: DomainKpiRecords = {};

  for await (const post of Iterators.domainPosts(prefix, from, to)) {
    console.log(`${epochToDate(post.created)} ${post.title}`);
    const postRecord = getRecord(records, post.created);
    if (post.golden) {
      postRecord.goldenCount += 1;
    }
    postRecord.authors.add(post.user.login);
    postRecord.authorCount = postRecord.authors.size;
    postRecord.postCount++;

    for await (const postVote of Iterators.postVotes(post.id)) {
      const postVoteRecord = getRecord(records, postVote.changed);
      postVoteRecord.postVoters.add(postVote.user.login);
      postVoteRecord.postVotersCount = postVoteRecord.postVoters.size;
    }

    for await (const comment of Iterators.postComments(post.id)) {
      const commentRecord = getRecord(records, comment.created);
      commentRecord.commenters.add(comment.user.login);
      commentRecord.commenterCount = commentRecord.commenters.size;
      commentRecord.commentCount++;
    }
  }

  await save(
    Object.keys(records)
      .sort((a, b) => (a > b ? 1 : -1))
      .map(k => {
        const record = records[k];
        return {
          date: k,
          // authors: Array.from(record.authors).sort(),
          authorCount: record.authorCount,
          postCount: record.postCount,
          // postVoters: Array.from(record.postVoters).sort(),
          postVotersCount: record.postVotersCount,
          commentCount: record.commentCount,
          commentersCount: record.commenterCount,
          // commenters: Array.from(record.commenters).sort(),
          goldenCount: record.goldenCount,
        };
      }),
    // eslint-disable-next-line prettier/prettier
    `${process.env.DATA}/${prefix} from ${epochToDate(from)} to ${epochToDate(to)}.json`
  );
})().catch(reason => console.error(reason));
