import { env } from "../src/env.ts";

export namespace dirty {
  export namespace API {
    export function get(url: string): Promise<Response> {
      const init: RequestInit = {
        method: "GET",
        headers: {
          "X-Futuware-UID": env("UID"),
          "X-Futuware-SID": env("SID"),
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
