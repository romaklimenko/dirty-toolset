import "https://deno.land/x/dotenv/load.ts";

export namespace dirty {
  export namespace API {
    export function get(url: string): Promise<Response> {
      const init: RequestInit = {
        method: "GET",
        headers: {
          "X-Futuware-UID": <string> Deno.env.get("UID"),
          "X-Futuware-SID": <string> Deno.env.get("SID"),
        },
      };
      return fetch(`https://d3.ru/api/${url}`, init);
    }
  }

  export namespace AJAX {
    //
  }

  export namespace Plain {
    //
  }
}
