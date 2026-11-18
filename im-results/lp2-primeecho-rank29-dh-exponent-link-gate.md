# prime_echo rank quotients 6/16 versus DH private exponents 6/15

**Agent8, 18 November 2026. Director #1651. Classification: exact arithmetic, source-convention negative. No LP2 key, plaintext, or cross-service key schedule recovered.**

## Frozen relation

The only two exceptional `prime_echo` pauses occur at:

- 1033, one-based prime ordinal174 = 6×29;
- 3301, one-based prime ordinal464 = 16×29.

The signed DH23 worked example fixes public values `5^6 mod23 = 8` and `5^15 mod23 = 19`, so the corresponding private exponents are6 and15.

Thus the proposed bridge is exactly:

```text
pause-rank quotients:  6, 16
DH private exponents:  6, 15
                         ^ exact first match
                            ^ requires -1
```

The first coordinate matches. The second requires changing16 to15.

## Source-convention test

The permitted correction in #1651 is a one-based/zero-based decrement only if an original source convention actually requires it. No such convention exists for this pair.

### prime_echo side

The preserved script is a literal ordered list of464 primes. Its exceptional entries are the 174th and464th printed primes. The player-visible operation is print followed by a two-second hold. There is no zero-based index, array subscript, counter variable, rank display, modulo29 step, decrement, or coordinate conversion at either pause.

Dividing the one-based mathematical prime ordinals by29 is already a derived comparison. The quotient16 is therefore an ordinary scalar, not a one-based position waiting to become15.

### DH side

The signed 2013 protocol presents modulus23, base5, server public8, client public19, and shared2. The private exponents6 and15 are discrete logarithms of the two public shares. They are **exponents**, not list positions or coordinates. The protocol never decrements either exponent and supplies no mixed convention in which only the client exponent is zero-based.

The first quotient6 can be identified directly with the server exponent6. Mapping the second quotient16 to client exponent15 would therefore apply a coordinate-origin correction to one scalar family while leaving the first scalar unchanged.

### Role order

The pause order is historical stream order: 1033 then3301. The DH role order is a protocol distinction between server and client. No signed source says the first pause represents the server or the second pause represents the client. The exact numerical match at the first coordinate does not independently select those roles.

The pre-Cicada Cibertec worked example documents the same private exponents6 and15, but it is evidence that the tuple was ordinary pedagogical material, not a Cicada instruction binding `prime_echo` ranks to server/client secrets.

## Exceptional-rank census

The original `prime_echo` executable has exactly two nonordinary delays: ordinal174 and ordinal464. There are no further exceptional prime ranks inside that authenticated program from which to test or derive a consistent decrement rule. Ordinary every-tenth line breaks are formatting and use the same 0.05-second delay as other primes.

Existing #1640 already establishes that quotient values6/16 and difference10 have no source-selected 29-symbol receiver. #1651 adds the narrower result that the apparent `6,16 -> 6,15` DH bridge cannot be repaired by a documented indexing convention.

## Decision

Close the exponent-link branch as an unsupported coincidence. Preserve:

- `174/29 = 6`;
- `464/29 = 16`;
- `log_5(8) mod23 = 6`;
- `log_5(19) mod23 = 15`.

Do not decrement16, swap roles, or feed these values into an LP2 key schedule unless a newly recovered first-party source explicitly identifies an indexed object and its origin convention.

Supporting sources:
- `resources/historical/cicada2013-os-original-prime-echo.sh`
- `im-results/lp2-primeecho-player-visible-pause-semantics.md`
- `im-results/lp2-primeecho-rank29-operation-gate.md`
- `resources/external/2013-tcp-server-signed-source.md`
