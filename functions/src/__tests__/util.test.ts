import { describe, test, expect } from '@jest/globals';
import { getFields } from '../util';

describe('getFields', () => {
  test('empty string', () => {
    expect(getFields({ fields: '' })).toEqual([]);
  });

  test('string with commas', () => {
    expect(getFields({ fields: 'field1,field2' })).toEqual([
      'field1',
      'field2',
    ]);
  });

  test('string with commas and spaces', () => {
    expect(getFields({ fields: 'field1, field2 , field3,field4' })).toEqual([
      'field1',
      'field2',
      'field3',
      'field4',
    ]);
  });
});
