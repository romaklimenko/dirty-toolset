import {
  MongoClient,
} from "https://deno.land/x/mongo@v0.11.1/mod.ts";
import { UserSchema, KarmaSchema, UserErrorResponse } from "../src/types.ts";
import { dirty } from "../src/rest.ts";
import { karma } from "../src/iterators.ts";

const fromId: number = parseInt(Deno.args[0], 10) || 1;
const toId: number = parseInt(Deno.args[1], 10) || Number.MAX_SAFE_INTEGER;

const client = new MongoClient();
client.connectWithUri("mongodb://localhost:27017");

const db = client.database("dirty");
const users = db.collection<UserSchema>("users");
const karmas = db.collection<KarmaSchema>("karma");

const maxErrors = 1000;
let errortsLeft = maxErrors;

for (let userId = fromId; userId <= toId && errortsLeft > 0; userId++) {
  const response = await dirty.AJAX.getUser(userId);
  if (response.status === "OK") {
    errortsLeft = maxErrors;
    console.log(userId, response.dude.login);
    if (response.dude.login === "") {
      continue;
    }
    for await (let vote of karma(response.dude.login)) {
      try {
        const doc: KarmaSchema = {
          from: vote.user.login,
          to: response.dude.login,
          vote: vote.vote,
          changed: vote.changed,
          deleted: false,
        };

        await karmas.updateMany({
          from: { $eq: doc.from },
          to: { $eq: doc.to },
          vote: { $eq: doc.vote },
          changed: { $ne: doc.changed },
          deleted: { $eq: false },
        }, { $set: { deleted: true } });

        await karmas.insertOne(doc);
      } catch (error) {
        console.log(error);
      }
    }
    const doc: UserSchema = {
      status: response.status,
      subscribers_count: response.subscribers_count,
      dude: {
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
    };
    await users.insertOne(doc);
  } else {
    console.log(
      userId,
      (<UserErrorResponse> response).errors,
      --errortsLeft,
      "errors left",
    );
  }
}
