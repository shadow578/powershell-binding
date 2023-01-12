/* eslint-disable @typescript-eslint/no-unused-vars */
import { PowerShellCall, psCall } from '../../binding/PowerShellCall';
import { PowerShellBinding } from '../../binding/PowerShellBinding';
import { matchArray, matchObject } from '@shadow578/type-guardian';
import { isVoid, isString, isNumber, isStringArray } from '@shadow578/type-guardian/lib/TypeGuards';

interface Person {
  FirstName: string;
  LastName: string;
  Age: number;
  Friends: string[];
}

const isPerson = matchObject<Person>({
  FirstName: 'string',
  LastName: 'string',
  Age: 'number',
  Friends: matchArray('string'),
});

class ExampleBinding extends PowerShellBinding {
  /**
   * no parameters, no return value
   */
  @PowerShellCall('$x = 0', isVoid)
  nothing() {
    return psCall<void>();
  }

  /**
   * no parameters,
   * @returns "Hello, World!"
   */
  @PowerShellCall('Write-Output "Hello, World!"', isString)
  getHelloWorld() {
    return psCall<string>();
  }

  /**
   * @param name the name to greet
   * @returns "Hello, $name"
   */
  @PowerShellCall('Write-Output "Hello, $name"', isString)
  greet(name: string) {
    return psCall<string>();
  }

  /**
   * @param a the first number
   * @param b the second number
   * @returns result of a / b
   */
  @PowerShellCall('Write-Output ($a / $b)', isNumber)
  divide(a: number, b: number) {
    return psCall<number>();
  }

  /**
   * echos the input as-is.
   * Note: the input is typed as string or number, but
   * the return type is only allowed to be a string.
   * this is done intentionally to easily test the type guard.
   * In production, you should not do this!
   *
   * @param input the input to echo
   * @returns the input, with same type
   */
  @PowerShellCall('Write-Output $params.input', isString, { expandParameters: false })
  echo(input: string | number) {
    return psCall<string>();
  }

  /**
   * @returns array [ first, second, third, fourth ]
   */
  @PowerShellCall('Write-Output @($first, $second, $third, $fourth)', isStringArray)
  getArray(first: string, second: string, third: string, fourth: string) {
    return psCall<string[]>();
  }

  /**
   * @returns object: { FirstName: "Peter", LastName: "Parker", Age: 24, Friends: [ "Tony", "Aunt May", "Uncle Ben" ] }
   */
  @PowerShellCall(
    'Write-Output (@{ FirstName = "Peter"; LastName = "Parker"; Age = 24; Friends = @( "Tony", "Aunt May", "Uncle Ben" ) })',
    isPerson,
    { serializationDepth: 10 },
  )
  getPeter() {
    return psCall<Person>();
  }

  /**
   * @returns "person.FirstName $person.LastName"
   */
  @PowerShellCall('Write-Output "$($person.FirstName) $($person.LastName)"', isString)
  getPersonFullName(person: Person) {
    return psCall<string>();
  }

  /**
   * always throws a exception with the message "test exception"
   */
  @PowerShellCall('throw "test exception"', isVoid)
  throwExeption() {
    return psCall<void>();
  }

  /**
   * always throws a exception with the message "test exception".
   * serialization depth is set to 100
   */
  @PowerShellCall('throw "test exception"', isVoid, { serializationDepth: 100 })
  throwExeptionDeep() {
    return psCall<void>();
  }
}

let binding: ExampleBinding;
beforeAll(() => {
  binding = new ExampleBinding();
});

afterAll(() => {
  binding.shell.dispose();
});

describe('@PowerShellCall', () => {
  describe('executes powershell', () => {
    test('no parameters, no return value', async () => {
      await expect(binding.nothing()).resolves.toBe(undefined);
    });

    test('no parameters, return value', async () => {
      await expect(binding.getHelloWorld()).resolves.toBe('Hello, World!');
    });

    test('parameters, return value', async () => {
      await expect(binding.greet('Peter')).resolves.toBe('Hello, Peter');
    });

    test('multiple parameters, return value', async () => {
      await expect(binding.divide(10, 2)).resolves.toBe(5);
    });

    test('return array', async () => {
      await expect(binding.getArray('Hello', 'World', '!', 'This is a test')).resolves.toEqual([
        'Hello',
        'World',
        '!',
        'This is a test',
      ]);
    });

    test('return object', async () => {
      await expect(binding.getPeter()).resolves.toEqual({
        FirstName: 'Peter',
        LastName: 'Parker',
        Age: 24,
        Friends: ['Tony', 'Aunt May', 'Uncle Ben'],
      });
    });

    test('input object', async () => {
      await expect(
        binding.getPersonFullName({
          FirstName: 'Peter',
          LastName: 'Parker',
          Age: 24,
          Friends: [],
        }),
      ).resolves.toBe('Peter Parker');
    });
  });

  describe('type guard', () => {
    test('valid return type accepted', async () => {
      await expect(binding.echo('Test')).resolves.toBe('Test');
    });

    test('invalid return type rejected', async () => {
      await expect(binding.echo(10)).rejects.toThrowError(TypeError);
    });
  });

  describe('handles errors', () => {
    test('re-throws powershell exception', async () => {
      await expect(binding.divide(10, 0)).rejects.toThrowError(/RuntimeException/);
    });

    test('re-throws custom exception', async () => {
      await expect(binding.throwExeption()).rejects.toThrowError(/test exception/);
    });

    test('serialization depth does not affect expeption re-throw', async () => {
      await expect(binding.throwExeptionDeep()).rejects.toThrowError(/test exception/);
    });
  });
});
