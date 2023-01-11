import { PowerShellException } from './PowerShellException';

export class PowerShellError extends Error {
  constructor(public readonly cause?: PowerShellException) {
    super(cause?.FullyQualifiedErrorId);
  }
}
