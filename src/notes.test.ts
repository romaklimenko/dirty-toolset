/* global describe */
/* global test */
/* global expect */

import {note} from './notes';

const toUserName = 'r10o';

describe('notes', () => {
  describe('integration', () => {
    test('should get a note', async () => {
      // Arrange
      const fromUserName = 'botan';
      // Act
      const noteFromUser = await note(fromUserName, toUserName);
      // Assert
      expect(noteFromUser?.body).toBe('Привет!');
    });

    test('should not get a note', async () => {
      // Arrange
      const fromUserName = 'lopatkin';
      // Act
      const noteFromUser = await note(fromUserName, toUserName);
      // Assert
      expect(noteFromUser).toBeNull();
    });
  });
});
