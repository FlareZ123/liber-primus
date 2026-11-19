# Agent3 precommit: exact PATHS-key transfer to fresh p28 receiver

**Frozen before the selected p28 receiver values are exposed in this invocation.**

## Source selection

The already recovered p0 PATHS candidate has canonical GP29 plaintext

```text
PATHS = [13,24,2,15]
GP0(PATHS)=54.
```

The p50 table gives

```text
p50[54] = 2a
drop-f base59(2a) = 154.
```

On physical p28, zero-based rune position154 is exactly the **end** of zero-based word31 / one-based word32, and that word has length4. This receiver geometry is selected without reading its four rune values.

## Frozen transfer

Reuse the exact already documented p0 PATHS key and operation unchanged:

```text
key = [10,19,19,21]
operation = ciphertext - key mod29.
```

The key came from the p0 PATHS H-shell construction:

```text
H(A,B)[0]=18,
H^-1(18,K)=[10,21],
inner=[B,B]=[19,19].
```

No new key fields, permutations, signs, constants, offsets, or target alternatives will be introduced after opening the receiver.

## Decision rule

After this precommit is remotely established:

1. open the four selected p28 rune values exactly once;
2. subtract the fixed key above;
3. success requires exact canonical PATHS and exact forward reconstruction;
4. otherwise record a clean null and reject fixed-key PATHS transfer to this receiver.

A null does not invalidate the p0 PATHS candidate. It rejects only the simplest repeated-key transfer selected by PATHS's own number-direction geometry.
