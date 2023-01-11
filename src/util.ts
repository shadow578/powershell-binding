import { randomBytes } from 'crypto';

/**
 * convert a string to a utf-8 encoded base64 string
 *
 * @param source the source string to encode
 * @returns the base64 encoded string
 */
export function base64Encode(source: string): string {
  return Buffer.from(new TextEncoder().encode(source)).toString('base64');
}

/**
 * convert a utf-8 encoded base64 string to a string
 *
 * @param source the source base64 string to decode
 * @returns the decoded string
 */
export function base64Decode(source: string): string {
  return new TextDecoder('utf8').decode(Buffer.from(source, 'base64'));
}

/**
 * create a new random string.
 * the string will only contain alphanumerical characters ([A-Za-z0-9])
 *
 * @param length the length of the string.
 *               if not even, the length is shortened by one character
 * @returns a random string
 */
export function getRandomString(length: number): string {
  return randomBytes(length / 2).toString('hex');
}

/**
 * get the parameter names of a function or method
 *
 * @param fn the function to get the parameter names of
 * @returns a array containing the parameter names of the function, in order
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function getFunctionParameterNames(fn: Function): string[] {
  // convert method body to a string, reduce to a single line
  const methodDefinition = fn.toString().replace(/\r?\n/g, '');

  // prepare regex with method name embedded
  const regex = new RegExp(`^(?:async\\s)?(?:function\\s)?(?:${fn.name})?\\s*\\(([\\w\\s,_]*)\\)\\s*{`);

  // get the parameter list of the method
  const parameterListMatch = methodDefinition.match(regex);
  if (!parameterListMatch || parameterListMatch.length != 2) {
    throw new Error('failed to parse method parameter list');
  }

  // split parameter list on commas and trim the resulting parameter names
  return parameterListMatch[1]
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p);
}
