import { PowerShellException } from '../PowerShellException';
import { ParameterRecord } from './Parameters';

/**
 * additional options for creating a shim
 */
export interface ShimOptions {
  /**
   * should parameters be expanded into global variables?
   */
  expandParameters: boolean;

  /**
   * how deep the result object(s) should be serialized.
   * the depth only applies to data created by the shimmed command.
   */
  resultSerializationDepth: number;
}

/**
 * result data parsed from the shim output
 */
export interface ShimParseResult {
  /**
   * the data captured from the executed powershell command
   */
  data?: unknown;

  /**
   * any exceptions thrown in powershell during command execution
   */
  error?: PowerShellException;
}

/**
 * base shim interface
 */
export interface Shim {
  /**
   * wrap a powershell command into a shim
   *
   * @param id the unique id for this command.
   *           may only contain alphanumerical values ([A-Za-z0-9])
   *           and must be between 5 and 25 characters long.
   * @param command the powershell command to be executed. may be multiple lines
   * @param parameters a list of parameters that should be made available to the command
   * @param options additional options for the shim
   * @returns a string (may be multi-line) that contains the shimmed command.
   *          the string is ready to be executed in powershell
   */
  prepare(id: string, command: string, parameters: ParameterRecord, options: ShimOptions): string;

  /**
   * parse the result data or errors from the output streams after
   * a command prepared by this shim finished execution.
   *
   * @param id the unique id for this command.
   *           may only contain alphanumerical values ([A-Za-z0-9])
   *           and must be between 5 and 25 characters long.
   * @param stdout the full contents of the stdout stream for the powershell process.
   *               only set if {@link requiresStdout} is true, otherwise undefined
   * @param stderr the full contents of the stderr stream for the powershell process.
   *               only set if {@link requiresStderr} is true, otherwise undefined
   * @returns the parsed result data, or errors thrown in powershell
   */
  parseResult(id: string, stdout?: string, stderr?: string): ShimParseResult;

  /**
   * does this shim require the stdout stream to be captured?
   */
  get requiresStdout(): boolean;

  /**
   * does this shim require the stderr stream to be captured?
   */
  get requiresStderr(): boolean;
}
