/* eslint-disable @typescript-eslint/no-unused-vars */
import { isString } from '@shadow578/type-guardian/lib/TypeGuards';
import { PowerShellCall, PS, psCall, PowerShellBinding, DefaultShim, Shim } from '../index';

/**
 * example powershell bindings
 */
class MyBinding extends PowerShellBinding {
  /**
   * greets a person
   *
   * @param name the name of the person to greet
   * @returns a greeting for the person
   */
  @PowerShellCall('Write-Output "Hello, $name!"', isString)
  greet(name: string) {
    return psCall<string>();
  }

  /**
   * get the powershell version running in the binding
   *
   * @returns the powershell version
   */
  @PS('Write-Output $PSVersionTable.PSVersion.ToString()', isString)
  getPowerShellVersion() {
    return psCall<string>();
  }
}

let binding: MyBinding;
beforeAll(() => {
  binding = new MyBinding();
});

afterAll(() => {
  binding.shell.dispose();
});

describe('examples in README', () => {
  test('should greet the world', async () => {
    await expect(binding.greet('World')).resolves.toBe('Hello, World!');
  });

  test('should get the powershell version', async () => {
    await expect(binding.getPowerShellVersion()).resolves.toBeDefined();
  });
});
