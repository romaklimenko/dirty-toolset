import {saveText} from '../src/fs';
import {VoteRecord} from '../src/types';
import * as fs from 'fs';

const resolve = require('path').resolve;

require('dotenv').config();

interface Batch {
  count: number;
  sum: number;
  diffInDays: {
    mean: number;
    median: number;
  };
  votes: VoteRecord[];
}

interface Buffer {
  [key: string]: VoteRecord[];
}

scan();

function scan() {
  const userName = process.argv[2];
  const timeLimit: number = parseInt(process.argv[3]) || 60;

  if (!userName) {
    console.error('No username specified.');
    return;
  }

  const votes = JSON.parse(
    fs.readFileSync(
      resolve(`${process.env.DATA}/${userName}-votes.json`),
      'utf8'
    )
  ) as VoteRecord[];

  votes.sort((a, b) => (a.changed > b.changed ? 1 : -1));

  const batches: Batch[] = [];
  const buffer: Buffer = {};

  for (const vote of votes) {
    const bufferedBatch = getBufferedBatch(vote.voter, buffer);

    if (
      bufferedBatch.length > 0 &&
      vote.changed - bufferedBatch[bufferedBatch.length - 1].changed > timeLimit
    ) {
      pushBatch(bufferedBatch, batches);
    }
    bufferedBatch.push(vote);
  }

  Object.keys(buffer)
    .map(key => buffer[key])
    .forEach((votes: VoteRecord[]) => pushBatch(votes, batches));

  batches.sort((a, b) => (a.votes[0].changed > b.votes[0].changed ? 1 : -1));

  let output = '';

  for (const batch of batches) {
    output += `${batchToString(batch, true)}`;
  }

  output += `batches: ${batches.length}`;

  saveText(output, `${process.env.DATA}/${userName}-votes-in-batches.txt`);

  console.log('batches:', batches.length);
}

function pushBatch(votes: VoteRecord[], batches: Batch[]) {
  if (votes.length >= 10) {
    const votesSum = sum(votes, (d: VoteRecord) => d.vote);
    const diffInDaysMean = Math.floor(
      mean(votes, (d: VoteRecord) => d.diffInDays)
    );
    const diffInDaysMedian = Math.floor(
      median(votes, (d: VoteRecord) => d.diffInDays)
    );

    const finalBatch: Batch = {
      count: votes.length,
      sum: votesSum,
      diffInDays: {
        mean: diffInDaysMean,
        median: diffInDaysMedian,
      },
      votes: [...votes],
    };
    batches.push(finalBatch);
    console.log(batchToString(finalBatch));
  }
  while (votes.length) {
    votes.pop();
  }
}

function batchToString(batch: Batch, verbose = false) {
  const avgDelayInSec = Math.round(
    (batch.votes[batch.votes.length - 1].changed - batch.votes[0].changed) /
      batch.votes.length
  );
  let result = `${batch.votes[0].voter}, count: ${batch.count}, sum: ${batch.sum}, mean: ${batch.diffInDays.mean}d, median: ${batch.diffInDays.median}d, pace: ${avgDelayInSec}s/vote`;

  if (verbose) {
    result += '\n';
    let changed = batch.votes[0].changed;
    for (const vote of batch.votes) {
      const delayBetweenVotesInSeconds = pad(vote.changed - changed, 2, '0');
      const voteDateTime = vote.voted.substring(0, 19).replace('T', ' ');
      const voteValue = plusify(vote.vote);
      const delayBetweenActivityAndVoteInDays = pad(vote.diffInDays, 4, ' ');
      const url = vote.url;
      result += `+${delayBetweenVotesInSeconds}s ${voteDateTime} ${voteValue} ${delayBetweenActivityAndVoteInDays}d ${url}\n`;
      changed = vote.changed;
    }
    result += '\n';
  }

  return result;
}

function getBufferedBatch(key: string, buffer: Buffer) {
  if (!(key in buffer)) {
    buffer[key] = [];
  }
  return buffer[key];
}

function sum<T>(array: T[], getter: (t: T) => number) {
  return array.map(getter).reduce((a: number, b: number) => a + b);
}

function mean<T>(array: T[], getter: (t: T) => number) {
  return sum(array, getter) / array.length;
}

function median<T>(array: T[], getter: (t: T) => number) {
  const copy = array.map(getter).sort();
  return copy[Math.floor(copy.length / 2)];
}

function plusify(n: number) {
  return `${n > 0 ? '+' : ''}${n}`;
}

function pad(num: number, size: number, sym: string) {
  let s = num.toString();
  while (s.length < size) {
    s = sym + s;
  }
  return s;
}
