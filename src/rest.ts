import { UserResponse, UserErrorResponse } from "./types";

const fetch = require("node-fetch");
const FormData = require("form-data");

require("dotenv").config();

export namespace dirty {
  export namespace API {
    export function get(url: string): Promise<Response> {
      const init: RequestInit = {
        method: "GET",
        headers: {
          "X-Futuware-UID": process.env.UID,
          "X-Futuware-SID": process.env.SID,
        },
      };
      return fetch(encodeURI(`https://d3.ru/api/${url}`), init);
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
          "X-Futuware-UID": process.env.UID,
          "X-Futuware-SID": process.env.SID,
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
