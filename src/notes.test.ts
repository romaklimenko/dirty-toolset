/* global describe */
/* global test */
/* global expect */

import { note } from './notes';

const toUserName = 'botan';

describe('notes', () => {
    describe('integration', () => {
        test('should get a note', async () => {
            // Arrange
            const fromUserName = 'romaklimenko';
            // Act
            const noteFromUser = await note(fromUserName, toUserName);
            // Assert
            expect(noteFromUser).toBe('ботан');
        });

        test('should not get a note', async () => {
            // Arrange
            const fromUserName = 'interesno';
            // Act
            const noteFromUser = await note(fromUserName, toUserName);
            // Assert
            expect(noteFromUser).toBeNull();
        });
    });
});