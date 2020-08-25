import "https://deno.land/x/dotenv/load.ts";

export function env(key: string): string {
  return <string> Deno.env.get(key);
}
