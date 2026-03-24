import { describe, expect, test } from '@jest/globals';
import { getFields, isCollectionGroupPath } from '../src/util';

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

describe('isCollectionGroupPath', () => {
  describe('should return false for specific collection paths', () => {
    test('top-level collection', () => {
      expect(isCollectionGroupPath('posts')).toBe(false);
    });

    test('specific subcollection path', () => {
      expect(isCollectionGroupPath('organizations/acme/members')).toBe(false);
    });

    test('deeply nested specific path', () => {
      expect(isCollectionGroupPath('companies/acme/departments/engineering/employees')).toBe(false);
    });
  });

  describe('should return true for collection group patterns with wildcards', () => {
    test('simple wildcard pattern', () => {
      expect(isCollectionGroupPath('users/{userId}/posts')).toBe(true);
    });

    test('wildcard with different naming', () => {
      expect(isCollectionGroupPath('users/{uid}/comments')).toBe(true);
    });

    test('multiple wildcards', () => {
      expect(isCollectionGroupPath('organizations/{orgId}/teams/{teamId}/members')).toBe(true);
    });

    test('wildcard at start', () => {
      expect(isCollectionGroupPath('{parentId}/subcollection')).toBe(true);
    });
  });
});
