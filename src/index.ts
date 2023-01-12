// PowerShellBinding.ts
import { IPowerShellBinding, PowerShellBinding, PowerShellBindingOptions } from './binding/PowerShellBinding';
export { IPowerShellBinding, PowerShellBinding, PowerShellBindingOptions };

// PowerShellCall.ts
import { PowerShellCall, PowerShellCallOptions, psCall } from './binding/PowerShellCall';
export { PowerShellCall, PowerShellCallOptions as PowerShellDecoratorOptions, psCall };

// PowerShellError.ts
import { PowerShellError } from './powershell/PowerShellError';
export { PowerShellError };

// PowerShellException.ts
import { PowerShellException, isPowerShellException } from './powershell/PowerShellException';
export { PowerShellException, isPowerShellException };

// Shim.ts
import { Shim, ShimOptions, ShimParseResult } from './powershell/shim/Shim';
export { Shim, ShimOptions, ShimParseResult };

// Parameters.ts
import { ParameterValue, ParameterRecord, assertParametersValid } from './powershell/shim/Parameters';
export { ParameterValue, ParameterRecord, assertParametersValid };

// DefaultShim.ts
import { DefaultShim } from './powershell/shim/DefaultShim';
export { DefaultShim };

/**
 * shorthand for {@link PowerShellCall}
 */
export const PS = PowerShellCall;
