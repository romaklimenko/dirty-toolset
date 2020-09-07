import {promises} from 'fs';
import {TextEncoder} from 'util';

export async function save(object: {}, path: string) {
  await promises.writeFile(
    path,
    new TextEncoder().encode(JSON.stringify(object, null, 1))
  );
}
