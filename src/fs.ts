export async function saveJSON(object: {}, path: string) {
  await Deno.writeFile(
    path,
    new TextEncoder().encode(JSON.stringify(object, null, 1)),
  );
}
