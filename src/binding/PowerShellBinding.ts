import { PowerShell, PowerShellOptions } from 'node-powershell';
import { DefaultShim } from '../powershell/shim/DefaultShim';
import { Shim } from '../powershell/shim/Shim';

/**
 * base interface for all powershell binding classes
 */
export interface IPowerShellBinding {
  /**
   * get the powershell instance of this binding
   */
  get shell(): PowerShell;

  /**
   * get the shim instance to use for commands in this binding
   */
  get shim(): Shim;
}

/**
 * options for {@link PowerShellBinding}
 */
export interface PowerShellBindingOptions extends PowerShellOptions {
  /**
   * pre-initialized shell instance to use for the binding.
   * if defined, all other options are ignored
   */
  instance?: PowerShell;
}

/**
 * default powershell binding class implementation
 */
export abstract class PowerShellBinding implements IPowerShellBinding {
  private readonly _shell: PowerShell;
  private readonly _shim = new DefaultShim();

  constructor(options: PowerShellBindingOptions = {}) {
    if (options.instance) {
      this._shell = options.instance;
    } else {
      this._shell = new PowerShell(options);
    }
  }

  get shell() {
    return this._shell;
  }

  get shim() {
    return this._shim;
  }
}
