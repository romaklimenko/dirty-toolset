import { UserSchema, KarmaSchema, UserErrorResponse } from "../src/types";
import { dirty } from "../src/rest";
import { karma } from "../src/iterators";
import { MongoClient } from "mongodb";

const fromId: number = parseInt(process.argv[2], 10) || 1;
const toId: number = parseInt(process.argv[3], 10) || Number.MAX_SAFE_INTEGER;

(async function (fromId: number, toId: number) {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect()

  const db = client.db("dirty");
  const users = db.collection<UserSchema>("users1");
  const karmas = db.collection<KarmaSchema>("karma1");

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

  await client.close();
})(fromId, toId).catch(reason => console.log(reason));
