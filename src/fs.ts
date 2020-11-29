import {promises} from 'fs';
import {TextEncoder} from 'util';

export async function save(object: {}, path: string) {
  await promises.writeFile(
    path,
    new TextEncoder().encode(JSON.stringify(object, null, 1))
  );
}

export async function saveText(string: string, path: string) {
  await promises.writeFile(path, new TextEncoder().encode(string));
}
