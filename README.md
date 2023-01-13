# @shadow578/powershell-binding
Simple bindings for PowerShell in Node.js using class decorators.


## Installation
Install `@shadow578/powershell-binding` using npm:

```shell
npm install @shadow578/powershell-binding
```

## Usage
### Importing the Module
Import the `@shadow578/powershell-binding` module using the following code:

```typescript
import { PowerShellBinding, PowerShellCall } from "@shadow578/powershell-binding";
```


### Creating a Binding Class
To create a binding class, create a class extending `PowerShellBinding`:

```typescript
class MyBinding extends PowerShellBinding {
  // ...
}
```

#### Custom Shims
By default, the `PowerShellBinding` class uses the `DefaultShim` to convert input parameters and output objects to and from PowerShell. 
However, custom shims may be used by overriding the `shim` property of the `PowerShellBinding` class:

```typescript
class MyBinding extends PowerShellBinding {
  get shim(): Shim {
      return myShim;
  }
}
```

Custom shims must implement the `Shim` interface.
For more details on how to implement a custom shim, see the [DefaultShim implementation](/src/powershell/shim/DefaultShim.ts).



### Creating a Binding Method
To create a binding method, create a method in the binding class with the `@PowerShellCall` decorator:

```typescript
class MyBinding extends PowerShellBinding {
  @PowerShellCall('Write-Output "Hello, $name!"', isString)
  greet(name: string) {
    return psCall<string>();
  }
}
```

The `@PowerShellCall` decorator takes the following parameters:
| Name        | Description                                                 | Default |
| ----------- | ----------------------------------------------------------- | ------- |
| `command`   | The command to execute in PowerShell                        |         |
| `typeGuard` | A function that checks if the output is of the correct type | `isAny` |
| `options`   | Additional options for the PowerShell call                  | `{}`    |


The `command` parameter takes a string containing the command to execute in PowerShell. The command may contain parameters, which are passed to the method as arguments. 
The parameters are automatically converted to PowerShell variables and are available in the command.

</br>

The `typeGuard` parameter takes a function with the following signature:
```typescript
(input: unknown) => input is T
```

Such functions may be created using the [@shadow578/type-guardian](https://www.npmjs.com/package/@shadow578/type-guardian) package.

</br>

The `options` parameter takes the following properties:
| Name                 | Description                                                                                                                                                                          | Default |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `expandParameters`   | Whether to expand the parameters to variables. If false, parameters are only available in the `$params` variable                                                                     | `true`  |
| `serializationDepth` | How deep the output object should be serialized (See [ConvertTo-Json docs](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/convertto-json#-depth)). | `2`     |

#### The `psCall` Function
The `psCall` function is used to stub the implementation of the binding method.
By itself, it does nothing but throw a Error, but it is replaced by the `@PowerShellCall` decorator with the actual implementation.


### Calling a Binding Method
To call a binding method, create an instance of the binding class and call the method:

```typescript
const binding = new MyBinding();
const output = await binding.greet("World");
// output === "Hello, World!"
```

#### Exception Handling
If an exception is thrown in PowerShell, it is re-thrown in JavaScript as a `PowerShellError`.

<br/>

#### Binding Class Options
By default `PowerShellBinding` constructor creates a new `PowerShell` instance using the default options. 
Further options may be passed to the `PowerShell` constructor using the `options` parameter. 
See [The `node-powershell` docs](https://www.npmjs.com/package/node-powershell) for possible options.

Additionally, a pre-existing `PowerShell` instance may be passed to the `PowerShellBinding` constructor using the `instance` parameter. 
In this case, the parameter `options` is ignored.


## Examples
For more examples, see [`DocumentationExamples.test.ts`](/src/__tests__/DocumentationExamples.test.ts) and [`PowerShellCall.test.ts`](/src/__tests__/binding/PowerShellCall.test.ts). 


## Limitations
- Input parameters to binding methods must be serializable using `JSON.stringify` and deserializable using `ConvertFrom-Json`¹.
- Outputs of binding methods must be serializable using `ConvertTo-Json` and deserializable using `JSON.parse`¹.
- Outputs of binding methods may only have a depth of 100².
- Commands in binding methods cannot be interactive.

> ¹ generally, any value of type `string`, `number`, `boolean`, `object`, or a array of those types, should work.

> ² depends on used shim. For the default shim, the depth is limited to 99.
