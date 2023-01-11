/* eslint-disable @typescript-eslint/no-empty-function */
import { assertParametersValid } from '../../../powershell/shim/Parameters';

describe('assertParametersValid', () => {
  test('accepts empty parameter record', () => {
    expect(() => assertParametersValid({})).not.toThrow();
  });

  test('accepts valid parameter record', () => {
    expect(() =>
      assertParametersValid({
        myString: 'is a string',
        myNumber: 12,
        myBoolean: false,
        myArray: ['a string', 12],
        myObject: {
          givenName: 'Peter',
          surName: 'Parker',
        },
      }),
    ).not.toThrow();
  });

  test('throws on invalid parameter record property', () => {
    expect(() =>
      assertParametersValid({
        callback: () => {},
      }),
    ).toThrow(TypeError);
  });

  test('throws on invalid parameter record, in array value', () => {
    expect(() =>
      assertParametersValid({
        myCallbacks: ['a', () => {}],
      }),
    ).toThrow(TypeError);
  });
});
