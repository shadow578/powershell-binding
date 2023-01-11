import { matchUnion } from '@shadow578/type-guardian';

/**
 * all valid parameter value types for powershell command
 */
export type ParameterValue = string | number | boolean | object;

/**
 * a record of input parameter names and values
 */
export type ParameterRecord = Record<string, ParameterValue>;

/**
 * type guard for {@link ParameterValue}
 */
const isParameterValue = matchUnion('string', 'number', 'boolean', 'object');

/**
 * check if a parameter map only contains values for supported types.
 * if a value is found that is not valid, a error is thrown detailing the offending key and value type.
 *
 * @param parameters the parameters to validate
 */
export function assertParametersValid(parameters: Record<string, unknown>): asserts parameters is ParameterRecord {
  for (const key in parameters) {
    const value = parameters[key];

    // skip undefined and null values
    if (value === undefined || value === null) {
      continue;
    }

    // check if value is a array
    if (Array.isArray(value)) {
      // is a array, ensure that all array entries are a allowed type
      value.forEach((entry, index) => {
        if (!isParameterValue(entry)) {
          throw new TypeError(`array parameter entry ${key}[${index}] was of invalid type '${typeof entry}'`);
        }
      });
    } else {
      // not a array, check if value is allowed type
      if (!isParameterValue(value)) {
        throw new TypeError(`parameter ${key} was of invalid type '${typeof value}'`);
      }
    }
  }
}
