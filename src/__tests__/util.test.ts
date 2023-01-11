/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { base64Encode, base64Decode, getRandomString, getFunctionParameterNames } from '../util';

describe('base64', () => {
  test('encode', () => {
    expect(base64Encode('This is a test')).toBe('VGhpcyBpcyBhIHRlc3Q=');
  });

  test('decode', () => {
    expect(base64Decode('VGhpcyBpcyBhIHRlc3Q=')).toBe('This is a test');
  });

  test('encode and decode', () => {
    expect(base64Decode(base64Encode('This is a test'))).toBe('This is a test');
  });
});

describe('getRandomString', () => {
  test('has expected length', () => {
    expect(getRandomString(10).length).toBe(10);
    expect(getRandomString(11).length).toBe(10);
    expect(getRandomString(12).length).toBe(12);
  });

  test('is alphanumerical', () => {
    expect(getRandomString(10)).toMatch(/[A-Za-z0-9]+/);
  });
});

describe('getFunctionParameterNames', () => {
  describe('synchronous', () => {
    test('arrow function', () => {
      const dummy = (key: string, value: string) => {};
      expect(getFunctionParameterNames(dummy)).toEqual(['key', 'value']);
    });

    test('function', () => {
      function dummy(key: string, value: string) {}
      expect(getFunctionParameterNames(dummy)).toEqual(['key', 'value']);
    });

    test('class method', () => {
      class Dummy {
        dummy(key: string, value: string) {}
      }

      expect(getFunctionParameterNames(new Dummy().dummy)).toEqual(['key', 'value']);
    });
  });

  describe('async', () => {
    test('arrow function', () => {
      const dummy = async (key: string, value: string) => {};
      expect(getFunctionParameterNames(dummy)).toEqual(['key', 'value']);
    });

    test('function', () => {
      async function dummy(key: string, value: string) {}
      expect(getFunctionParameterNames(dummy)).toEqual(['key', 'value']);
    });

    test('class method', () => {
      class Dummy {
        async dummy(key: string, value: string) {}
      }

      expect(getFunctionParameterNames(new Dummy().dummy)).toEqual(['key', 'value']);
    });
  });
});
