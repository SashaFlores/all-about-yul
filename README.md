## Unlock the Power of Inline Assembly: A Smart Contract Developer's Guide.

Yul is a low level language that can be used in a standalone Yul contracts, or in Solidity contracts via an assembly block. The default dialect of Yul currently is the EVM dialect.

Since the EVM is a stack-based virtual machine, it operates by set of instructions which can be categorized as:

**1- Stack Instructions**

- is the set of instructions that manipulate the position of values on the stack.
- Since Yul manages local variables and control-flow, opcodes that interfere with these features are not available.

*Examples of Stack Opcode:*

- `pushN`   
- `dupN`
- `swapN`
- `jumpN`


**2- Arithmetic Instructions**

- pops two or values from the stack, performs an arithmetic operation with, and then pushes the result.

*Examples of Arithmetic Opcode:*

- `add`
- `div`
- `mul`
- `mod`

**3- Comparison Instructions**

- pops one or two values from the stack, performs a comparison and pushes the result; either False (0) or True (1).

*Examples of Comparison Opcode:*
- `lt`
- `gt`
- `eq`
- `iszero`


**4- Bitwise Instructions**

- pops one or two values from the stack, performs a bitwise operations on them.

*Examples of Bitwise Opcode:*
- `and`
- `or`
- `xor`
- `not`

**5- Memory Instructions**

- it read and writes to the memory.

*Examples of Memory Opcode:*
- `mstore`
- `mload`
- `mstore8`


**6- Read Context Instructions**

- it reads from the global state and execution context.

*Examples of Read Context Opcode:*
- `caller`
- `sload`
- `chainid`


**7- Write Context Instructions**

- it writes to the global state and the execution context.

*Examples of Write Context Opcode:*
- `call`
- `create`
- `sstore`

### You can find a list of all `Yul` opcodes [here.](./EVM-Dialect.md)