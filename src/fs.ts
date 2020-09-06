import { promises } from "fs";

export async function saveJSON(object: {}, path: string) {
  await promises.writeFile(
    path,
    new TextEncoder().encode(JSON.stringify(object, null, 1)));
}
