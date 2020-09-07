import * as Iterators from '../src/iterators';
import {save} from '../src/fs';
import {Vote} from '../src/types';

require('dotenv').config();

const userName = process.argv[2];

interface VoteRecord {
  title?: string;
  body?: string;
  changed: number;
  date: string;
  diff: number;
  diffInDays: number;
  domain: string;
  type: 'comment' | 'post';
  url: string;
  vote: number;
  voter: string;
}

interface KarmaRecord {
  changed: number;
  date: Date;
  voter: string;
  vote: number;
}

interface VoterRecord {
  voter: string;
  downvotes: number;
  downvotesCount: number;
  upvotes: number;
  upvotesCount: number;
  sum: number;
}

const karma: KarmaRecord[] = [];
const votes: VoteRecord[] = [];
const voters: {[key: string]: VoterRecord} = {};

const prettyVote = (vote: number) => (vote > 0 ? `+${vote}` : `${vote}`);

function addVoteToObject(vote: Vote) {
  function insert() {
    voters[vote.user.login] = {
      voter: vote.user.login,
      downvotes: vote.vote < 0 ? vote.vote : 0,
      downvotesCount: vote.vote < 0 ? 1 : 0,
      upvotes: vote.vote > 0 ? vote.vote : 0,
      upvotesCount: vote.vote > 0 ? 1 : 0,
      sum: vote.vote,
    };
  }

  function update() {
    if (vote.vote < 0) {
      voters[vote.user.login].downvotes += vote.vote;
      voters[vote.user.login].downvotesCount += 1;
    } else {
      voters[vote.user.login].upvotes += vote.vote;
      voters[vote.user.login].upvotesCount += 1;
    }
    voters[vote.user.login].sum += vote.vote;
  }

  voters[vote.user.login] ? update() : insert();
}

(async function () {
  for await (const comment of Iterators.comments(userName)) {
    // comments
    for await (const vote of Iterators.commentVotes(comment.id)) {
      const record: VoteRecord = {
        body: comment.body.substring(0, 80),
        changed: vote.changed,
        date: new Date(vote.changed * 1000).toISOString(),
        diff: vote.changed - comment.created,
        diffInDays: Math.floor((vote.changed - comment.created) / 86400),
        domain: comment.domain.prefix,
        type: 'comment',
        url: `https://${
          comment.domain.id === 1 ? '' : `${comment.domain.prefix}.`
        }d3.ru/${comment.post.url_slug}-${comment.post.id}/#${comment.id}`,
        vote: vote.vote,
        voter: vote.user.login,
      };

      console.log(
        record.date,
        prettyVote(vote.vote),
        'в комментарий от',
        vote.user.login
      );

      votes.push(record);

      addVoteToObject(vote);
    }
  }

  for await (const post of Iterators.posts(userName)) {
    // posts
    for await (const vote of Iterators.postVotes(post.id)) {
      const record: VoteRecord = {
        title: post.title,
        changed: vote.changed,
        date: new Date(vote.changed * 1000).toISOString(),
        diff: vote.changed - post.created,
        diffInDays: Math.floor((vote.changed - post.created) / 86400),
        domain: post.domain.prefix,
        type: 'post',
        url: `https://${
          post.domain.id === 1 ? '' : `${post.domain.prefix}.`
        }d3.ru/${post.url_slug}-${post.id}`,
        vote: vote.vote,
        voter: vote.user.login,
      };

      console.log(
        record.date,
        prettyVote(vote.vote),
        'в пост от',
        vote.user.login
      );

      votes.push(record);

      addVoteToObject(vote);
    }
  }

  votes.sort((a, b) => (a.changed > b.changed ? -1 : 1));
  await save(votes, `${process.env.DATA}/${userName}-votes.json`);
  await save(
    votes.filter(v => v.diffInDays > 2),
    `${process.env.DATA}/${userName}-delayed-votes.json`
  );

  // voters
  const votersArray = Object.keys(voters)
    .map(key => voters[key])
    .sort((a, b) => (a.sum > b.sum ? -1 : 1));
  await save(votersArray, `${process.env.DATA}/${userName}-voters.json`);

  // karma
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
