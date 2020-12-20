import { get } from './api';
import { NotesResponse } from './types';


export async function note(fromUserName, toUserName) {
    const response = await get(`user_notes/?user_login=${toUserName}&author_login=${fromUserName}`);
    const notes = await response.json() as NotesResponse;
    if (notes.item_count > 0) {
        return notes.user_notes[0];
    }
    return null;
}
