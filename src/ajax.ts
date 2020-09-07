import {UserResponse, UserErrorResponse} from './types';
import FormData = require('form-data');
import fetch, {RequestInit} from 'node-fetch';

export async function getUser(
  userId: number
): Promise<UserResponse | UserErrorResponse> {
  const formdata = new FormData();
  formdata.append('id', userId.toString());

  const init: RequestInit = {
    method: 'POST',
    headers: {
      'X-Futuware-UID': process.env.UID as string,
      'X-Futuware-SID': process.env.SID as string,
    },
    body: formdata,
  };
  const response = await fetch('https://d3.ru/ajax/user/get/', init);
  return response.json();
}
