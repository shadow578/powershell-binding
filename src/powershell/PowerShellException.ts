import { matchObject } from '@shadow578/type-guardian';

/**
 * PowerShell Exception information
 */
export interface PowerShellException {
  Exception: string;
  FullyQualifiedErrorId: string;
  InvocationInfo: string;
}

/**
 * type guard for {@link PowerShellException}
 */
export const isPowerShellException = matchObject<PowerShellException>({
  Exception: 'string',
  FullyQualifiedErrorId: 'string',
  InvocationInfo: 'string',
});
