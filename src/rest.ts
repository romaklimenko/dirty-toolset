import { env } from "../src/env.ts";
import { UserResponse, UserErrorResponse } from "./types.ts";

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
    export async function getUser(
      userId: number,
    ): Promise<UserResponse | UserErrorResponse> {
      const formdata = new FormData();
      formdata.append("id", userId.toString());

      const init: RequestInit = {
        method: "POST",
        headers: {
          "X-Futuware-UID": env("UID"),
          "X-Futuware-SID": env("SID"),
        },
        body: formdata,
      };
      const response = await fetch("https://d3.ru/ajax/user/get/", init);
      return response.json();
    }
  }

  export namespace Plain {
    //
  }
}
