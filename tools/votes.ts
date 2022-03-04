import * as Iterators from '../src/iterators';
import {save} from '../src/fs';
import {Post, Vote, VoteRecord, VoterRecord} from '../src/types';
import * as prompt from 'async-prompt';
import fetch from 'node-fetch';

require('dotenv').config();

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

const postIds = new Set();

async function savePostWithComments(postId: number, userName: string) {
  if (postIds.has(postId)) {
    return;
  }

  postIds.add(postId);

  try {
    const post = (await (
      await fetch(`https://d3.ru/api/posts/${postId}`)
    ).json()) as Post;
    const comments = (
      await (await fetch(`https://d3.ru/api/posts/${postId}/comments`)).json()
    )['comments'].map(
      // eslint-disable-next-line
      (c: any) => {
        c.user = c.user.login;
        c.url = `https://d3.ru/${postId}/#${c.id}`;

        delete c.can_ban;
        delete c.can_delete;
        delete c.can_edit;
        delete c.can_moderate;
        delete c.can_remove_comment_threads;
        delete c.country_code;
        delete c.country_code;
        delete c.date_order;
        delete c.deleted;
        delete c.hidden_rating_time_to_show;
        delete c.rating_order;
        delete c.unread;
        delete c.user_vote;
        delete c.vote_weight;

        c.datetime = new Date(c.created * 1000).toISOString();

        return c;
      }
    );

    comments.sort((a, b) => {
      return a.created > b.created ? 1 : -1;
    });

    // eslint-disable-next-line
    const result: any = {...post, comments: comments};
    result.user = post.user.login;
    result.domain = post.domain.prefix;

    delete result._links;
    delete result.advertisment;
    delete result.can_change_render_type;
    delete result.can_comment;
    delete result.can_comment;
    delete result.can_edit;
    delete result.can_moderate;
    delete result.can_unpublish;
    delete result.country_code;
    delete result.country_code;
    delete result.estimate;
    delete result.has_subscribed;
    delete result.hidden_rating_time_to_show;
    delete result.in_favourites;
    delete result.in_interests;
    delete result.unread_comments_count;
    delete result.user_vote;
    delete result.user_vote;
    delete result.views_count;
    delete result.vote_weight;

    if (result.data.type === 'stream') {
      result.data.contributors.forEach(c => {
        delete c.karma;
        delete c.is_golden;
      });
      result.data.events.forEach(e => (e.user = e.user.login));
    }

    save(
      result,
      `${process.env.DATA}/${userName}/${new Date(post.created * 1000)
        .toISOString()
        .substring(0, 19)
        .replace(/-/g, '.')
        .replace(/:/g, '.')}@${post.domain.prefix}(id${post.id}).json`
    );
  } catch (error) {
    console.error(postId, error);
  }
}

(async function () {
  const userName = process.argv[2] ?? (await prompt('username: '));

  for await (const comment of Iterators.comments(userName)) {
    // await savePostWithComments(comment.post.id, userName);
    // comments
    for await (const vote of Iterators.commentVotes(comment.id)) {
      const record: VoteRecord = {
        body: comment.body.substring(0, 80),
        changed: vote.changed,
        created: new Date(comment.created * 1000).toISOString(),
        voted: new Date(vote.changed * 1000).toISOString(),
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
        record.voted,
        prettyVote(vote.vote),
        'в комментарий от',
        vote.user.login
      );

      votes.push(record);

      addVoteToObject(vote);
    }
  }

  for await (const post of Iterators.posts(userName)) {
    // await savePostWithComments(post.id, userName);
    // posts
    for await (const vote of Iterators.postVotes(post.id)) {
      const record: VoteRecord = {
        title: post.title,
        changed: vote.changed,
        created: new Date(post.created * 1000).toISOString(),
        voted: new Date(vote.changed * 1000).toISOString(),
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
        record.voted,
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
})().catch(reason => console.error(reason));
