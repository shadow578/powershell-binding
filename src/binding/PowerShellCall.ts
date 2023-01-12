import { TypeGuard } from '@shadow578/type-guardian';
import { isAny } from '@shadow578/type-guardian/lib/TypeGuards';
import { PowerShellError } from '../powershell/PowerShellError';
import { assertParametersValid, ParameterRecord } from '../powershell/shim/Parameters';
import { Shim } from '../powershell/shim/Shim';
import { getFunctionParameterNames, getRandomString } from '../util';
import { IPowerShellBinding } from './PowerShellBinding';

/**
 * additional options for {@link PowerShellDecorator}
 */
export interface PowerShellDecoratorOptions {
  /**
   * expand parameters to be available directly.
   * if enabled, '$params.MyParameter' can be replaced with '$MyParameter'.
   *
   * default value: true
   */
  expandParameters: boolean;

  /**
   * how deep the output object will be serialized.
   * note that higher values may impact performance.
   *
   * default value: 2
   */
  serializationDepth: number;

  /**
   * override for the shim used with this command.
   * if not defined, the shim provided by the binding class is used.
   *
   * default value: undefined
   */
  shim?: Shim;
}

/**
 * default values for {@link PowerShellDecoratorOptions}
 */
const DEFAULT_OPTIONS: PowerShellDecoratorOptions = {
  expandParameters: true,
  serializationDepth: 2,
};

/**
 * shorthand for {@link PowerShellCall}
 */
//TODO: this shorthand should be moved elsewhere
export const PS = PowerShellCall;

/**
 * helper function to make typescript shut up about missing function implementation
 */
export function psCall<T>(): Promise<T> {
  throw new Error('powershell call should have been replaced by decorator');
}

/**
 * decorator for powershell binding functions
 *
 * @param command the powershell command to be executed by this binding function
 * @param typeGuard type guard to validate the result data parsed from powershell
 * @param options additional options for the binding
 * @example
 * class ExampleBinding extends PowerShellBinding {
 *     \@PowerShell('Write-Output "Hello, $name"', isString)
 *     greet(name: string): Promise<string> {
 *         // dummy implementation
 *         return <Promise<string>>{}
 *     }
 * }
 */
export function PowerShellCall<T = void>(
  command: string,
  typeGuard: TypeGuard<T> = isAny,
  options: Partial<PowerShellDecoratorOptions> = {},
) {
  // merge default values into provided options
  const fullOptions: PowerShellDecoratorOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // build the decorator
  return (
    _target: IPowerShellBinding,
    _methodName: string,
    descriptor: TypedPropertyDescriptor<(...params: never[]) => Promise<T>>,
  ) => {
    // get parameter name list of original method
    const originalMethod = descriptor.value;
    if (originalMethod === undefined) {
      throw new TypeError('method descriptor value was undefined');
    }
    const parameterNames = getFunctionParameterNames(originalMethod);

    // re-defined the method
    descriptor.value = async function (this: IPowerShellBinding, ...parameterValues: unknown[]): Promise<T> {
      const executionId = getRandomString(20);
      const shim = fullOptions.shim || this.shim;

      // prepare parameter records
      const parameters = makeParameterRecord(parameterNames, parameterValues);

      // shim and execute the command
      // note: powershell will not execute multi-line commands immediately, so a
      // newline has to be inserted after the command
      const shimmedCommand = shim.prepare(executionId, command, parameters, {
        expandParameters: fullOptions.expandParameters,
        resultSerializationDepth: fullOptions.serializationDepth,
      });
      const invocationResult = await this.shell.invoke(shimmedCommand + '\n');

      // parse the result data
      const result = shim.parseResult(
        executionId,
        shim.requiresStdout ? invocationResult.stdout?.toString() : undefined,
        shim.requiresStderr ? invocationResult.stderr?.toString() : undefined,
      );

      // re-throw error thrown in poweshell
      if (result.error !== undefined) {
        throw new PowerShellError(result.error);
      }

      // attempt to validate the result data as-is
      if (typeGuard(result.data)) {
        return result.data;
      }

      // if the result data is a array, attempt to
      // validate the elements in result data one-by-one
      if (Array.isArray(result.data)) {
        for (const element of result.data) {
          if (typeGuard(element)) {
            return element;
          }
        }
      }

      // validation failed for all possible values
      throw new TypeError('validation of result data failed');
    };
  };
}

/**
 * convert a method's raw parameter list to a record from parameter name to parameter value
 *
 * @param parameterNames the parameter name list. see {@link getFunctionParameterNames}
 * @param parameterValues the parameter value list
 * @returns a record from the method parameter name to the parameter value
 */
function makeParameterRecord(parameterNames: string[], parameterValues: unknown[]): ParameterRecord {
  // ensure parameter names and parameter values have same length
  if (parameterNames.length !== parameterValues.length) {
    throw new RangeError('parameter values length is unequal to expected parameter names length');
  }

  // create a map from parameter name to parameter value
  const parameters: Record<string, unknown> = {};
  parameterNames.forEach((name, i) => {
    parameters[name] = parameterValues[i];
  });

  assertParametersValid(parameters);
  return parameters;
}
