# EVM Dialect

The default dialect of Yul currently is the EVM dialect for the currently selected version of the EVM.

### Opcodes marked with:
 
- `-` do not return a result and all others return exactly one value.

- `F` presents since Frontier.

- `H` presents since Homestead.

- `B` presents since Byzantium.

- `C` presents since Constantinople.

- `I` presents since Istanbul.

- `L` presents since London.

- `P` presents since Paris.

- `S` falls in `Stack` Category.

- `A` falls in `Arithmetic` Category.

- `C` falls in `Comparison` Category.

- `B` falls in `Bitwise` Category.

- `M` falls in `Memory` Category.

- `R` falls in `Read Context` Category.

- `W` falls in `Write Context` Category.

- `D` falls in `Deprecation` Category.




| Instructions  | Category  |  |   | Explanation      |              
|---------------|:---------:|:---|:---:|------------------|
add(x, y)       | `A` |  | F |x + y|
sub(x, y)       | `A` |  | F |x - y|
mul(x, y)       | `A` |  | F |x * y|
div(x, y)       | `A` |  | F |x / y or 0 if y == 0|
sdiv(x, y)      | `A` |  | F |x / y, for signed numbers in two’s complement, 0 if y == 0|
mod(x, y)       | `A` |  | F |x % y, 0 if y == 0|
smod(x, y)      | `A` |  | F |x % y, for signed numbers in two’s complement, 0 if y == 0|
exp(x, y)       | `A` |  | F |x to the power of y|
not(x)          | `B` |  | F |bitwise “not” of x (every bit of x is negated)|
lt(x, y)        | `C` |  | F |1 if x < y, 0 otherwise|
gt(x, y)        | `C` |  | F |1 if x > y, 0 otherwise|
slt(x, y)       | `C` |  | F |1 if x < y, 0 otherwise, for signed numbers in two’s complement|
sgt(x, y)       | `C` |  | F |1 if x > y, 0 otherwise, for signed numbers in two’s complement|
eq(x, y)        | `C` |  | F |1 if x == y, 0 otherwise|
iszero(x)       | `C` |  | F |1 if x == 0, 0 otherwise|
and(x, y)       | `B` |  | F |bitwise “and” of x and y|
or(x, y)        | `B` |  | F |bitwise “or” of x and y|
xor(x, y)       | `B` |  | F |bitwise “xor” of x and y|
byte(n, x)      | `R` |  | F |nth byte of x, where the most significant byte is the 0th byte
shl(x, y)       | `B` |  | C | logical shift left y by x bits
shr(x, y)       | `B` |  | C |logical shift right y by x bits
sar(x, y)       | `B` |  | C |signed arithmetic shift right y by x bits
addmod(x, y, m) | `A` |  | F |(x + y) % m with arbitrary precision arithmetic, 0 if m == 0
mulmod(x, y, m) | `A` |  | F |(x * y) % m with arbitrary precision arithmetic, 0 if m == 0
signextend(i, x)| `B` |  | F |sign extend from (i*8+7)th bit counting from least significant
keccak256(p, n) | `M` |  | F |keccak(mem[p…(p+n)))
pc()            | `R` |  | F | current position discard value x
pop             | `S` |- | F | discard value x
mload(p)        | `M` |  | F |mem[p…(p+32))
mstore(p, v)    | `M` |- | F | mem[p…(p+32)) := v
mstore8(p, v)   | `M` |- | F |mem[p] := v & 0xff (only modifies a single byte)
sload(p)        | `R` |  | F |storage[p]
sstore(p, v)    | `W` |- | F |storage[p] := v
msize()         | `M` |  | F |size of memory, i.e. largest accessed memory index
gas()           | `R` |  | F |gas still available to execution
address()       | `R` |  | F |address of the current contract / execution context
balance(a)      | `R` |  | F |wei balance at address a
selfbalance()   | `R` |  | I |equivalent to balance(address()), but cheaper
caller()        | `R` |  | F |call sender (excluding delegatecall)
callvalue()     | `R` |  | F |wei sent together with the current call
calldataload(p) | `R` |  | F |call data starting from position p (32 bytes)
calldatasize()  | `R` |  | F |size of call data in bytes
calldatacopy(t, f, s)| `W` |- | F |copy s bytes from calldata at position f to mem at position t
codesize()      | `R` |  | F |size of the code of the current contract / execution context
codecopy(t, f, s)| `W` | -| F |copy s bytes from code at position f to mem at position t
extcodesize(a)  | `R` |  | F |size of the code at address a
extcodecopy(a, t, f, s) |  `W` | - | F |like codecopy(t, f, s) but take code at address a
returndatasize() |  `R` |  | B |size of the last returndata
returndatacopy(t, f, s) |  `R` | - | B | copy s bytes from returndata at position f to mem at position t
extcodehash(a)  | `R` |   | C |code hash of address a
create(v, p, n) | `W` |   | F |create new contract with code mem[p…(p+n)) and send v wei and return the new address; returns 0 on error
create2(v, p, n, s)   |  `W` |  | C |create new contract with code mem[p…(p+n)) at address keccak256(0xff . this . s . keccak256(mem[p…(p+n))) and send v wei and return the new address, where 0xff is a 1 byte value, this is the current contract’s address as a 20 byte value and s is a big-endian 256-bit value; returns 0 on error
call(g, a, v, in, insize, out, outsize) |  `W` |   | F | call contract at address a with input mem[in…(in+insize)) providing g gas and v wei and output area mem[out…(out+outsize)) returning 0 on error (eg. out of gas) and 1 on success 
callcode(g, a, v, in, insize, out, outsize) | `W` |     | F |identical to call but only use the code from a and stay in the context of the current contract 
delegatecall(g, a, in, insize, out, outsize) |  `W` |  | H |identical to callcode but also keep caller and callvalue 
staticcall(g, a, in, insize, out, outsize) |  `R` |  | B |identical to call(g, a, 0, in, insize, out, outsize) but do not allow state modifications 
return(p, s)       | `R` | - | F |end execution, return data mem[p…(p+s))
revert(p, s)       | `W` | - | B | end execution, revert state changes, return data mem[p…(p+s))
selfdestruct(a)    | `D` | - | F |  deprecated
invalid()          | `?` | - | F |end execution with invalid instruction
log0(p, s)         | `W` | - | F | log data mem[p…(p+s))
log1(p, s, t1)     | `W` | - | F | log data mem[p…(p+s)) with topic t1
log2(p, s, t1, t2) | `w` | - | F | log data mem[p…(p+s)) with topics t1, t2
log3(p, s, t1, t2, t3) | `w` | - | F | log data mem[p…(p+s)) with topics t1, t2, t3
log4(p, s, t1, t2, t3, t4) | `W` | - | F | log data mem[p…(p+s)) with topics t1, t2, t3, t4
chainid()          | `R` |  | I | ID of the executing chain (EIP-1344)
basefee()          | `R` |  | L | current block’s base fee (EIP-3198 and EIP-1559)
origin()           | `R` |  | F | transaction sender
gasprice()         | `R` |  | F | gas price of the transaction
blockhash(b)       | `R` |  | F  | hash of block nr b - only for last 256 blocks excluding current
coinbase()         | `R` |  | F | current mining beneficiary
timestamp()        | `R` |  | F | timestamp of the current block in seconds since the epoch
number()           | `R` |  | F | current block number
difficulty()       | `R` |  | F | difficulty of the current block 
gaslimit()         | `R` |  | F | block gas limit of the current block