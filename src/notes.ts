import { get } from './api';
import { PagedResponse } from './types';

interface Notes extends PagedResponse {
    user_notes: [
        {
            body: string;
            id: number;
            created: number;
        }
    ];
}

export async function note(fromUserName, toUserName) {
    const response = await get(`user_notes/?user_login=${toUserName}&author_login=${fromUserName}`);
    const notes = await response.json() as Notes;
    if (notes.item_count > 0) {
        return notes.user_notes[0].body;
    }
    return null;
}
