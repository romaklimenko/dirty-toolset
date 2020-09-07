/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-namespace */
import fetch, {Response, RequestInit} from 'node-fetch';

require('dotenv').config();

export function get(url: string): Promise<Response> {
  const init: RequestInit = {
    method: 'GET',
    headers: {
      'X-Futuware-UID': process.env.UID as string,
      'X-Futuware-SID': process.env.SID as string,
    },
  };
  return fetch(encodeURI(`https://d3.ru/api/${url}`), init);
}
