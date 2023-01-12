import { matchObject, matchArray } from '@shadow578/type-guardian';
import { base64Decode, base64Encode } from '../../util';
import { isPowerShellException } from '../PowerShellException';
import { ParameterRecord } from './Parameters';
import { Shim, ShimOptions, ShimParseResult } from './Shim';
import { isString } from '@shadow578/type-guardian/lib/TypeGuards';

/**
 * output format of the default shim
 */
interface ShimOutput {
  success: boolean;
  data: unknown[];
}

/**
 * type guard for {@link ShimOutput}
 */
const isShimOutput = matchObject<ShimOutput>({
  success: 'boolean',
  data: matchArray('any'),
});

export class DefaultShim implements Shim {
  get requiresStdout() {
    return true;
  }

  get requiresStderr() {
    return false;
  }

  prepare(id: string, command: string, parameters: ParameterRecord, options: ShimOptions): string {
    // convert the json to a utf-8 encoded base64 string
    // doing the transfer in base64 ensures that we don't run into issues
    // in case wierd characters are used in the parameter values
    const paramsBase64String = base64Encode(JSON.stringify(parameters));

    // build the shim
    //prettier-ignore
    return `function __shim() {
        .{
            function __target() {
                ${command}
            }
            try {
                $params = ([System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("${paramsBase64String}")) | ConvertFrom-Json)
                ${
                  // parameter expansion
                  options.expandParameters
                    ? '$params.PSObject.Properties | ForEach-Object { Set-Variable -Name $_.Name -Value $_.Value }'
                    : ''
                }
                $__capture = @{
                    "success" = $true
                    "data"    = @(__target)
                }
            }
            catch {
                $__capture = @{
                    "success" = $false
                    "data"    = @(@{
                      "Exception" = ($_.Exception.Message)
                      "FullyQualifiedErrorId" = ($_.FullyQualifiedErrorId)
                      "InvocationInfo" = ("$($_.InvocationInfo.Line) (at $($_.InvocationInfo.ScriptLineNumber),$($_.InvocationInfo.OffsetInLine) )")
                    })
                }
            }
        } | Out-Null
        Write-Output "{{${id}=$(([System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((ConvertTo-Json $__capture -Depth (${ Math.min(options.resultSerializationDepth + 1, 100) }) -Compress)))))}}"
    }; __shim`;
  }

  parseResult(id: string, stdout?: string, _stderr?: string): ShimParseResult {
    if (!isString(stdout)) {
      throw new TypeError('stdout was not defined');
    }

    // find the result data in the output stream
    const resultMatch = stdout.match(new RegExp(`{{(?:${id})=([A-Za-z0-9+/-_]*={0,3})}}`));
    if (!resultMatch) {
      throw new Error('could not find result data in output stream');
    }

    // base64-decode and parse the result
    const outputJson = base64Decode(resultMatch[1]);
    const output = JSON.parse(outputJson);

    // check result
    if (!isShimOutput(output)) {
      throw new TypeError('could not decode shim output');
    }

    // transform output
    if (output.success) {
      return {
        data: output.data,
      };
    } else {
      if (!isPowerShellException(output.data[0])) {
        throw new TypeError('could not decode exception from shim output');
      }

      return {
        error: output.data[0],
      };
    }
  }
}
