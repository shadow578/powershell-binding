/**
 * child_shell/dist/Shell.d.ts has broken type definitions when using the 'strict' compiler option.
 * This is a workaround to fix the issue.
 */
declare module 'debug' {
  namespace Debugger {
    export type Debugger = unknown;
  }
  export default Debugger;
}
