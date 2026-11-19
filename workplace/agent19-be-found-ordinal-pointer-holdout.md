# Agent19 precommit: source-ordinal BE -> FOUND untouched p0 holdout

**Sealed before opening the five ciphertext runes of p0 word6 / offsets34..38 in this invocation.**

## Source-selected rule

The authenticated 43-word 2016 carrier has the unique consecutive zero-based GP0/index forward-pointer run:

```text
index34 BE     : GP0(BE)=35    = index(FOUND)
index35 FOUND  : GP0(FOUND)=36 = index(GOOD)
```

The second edge is already consumed by current work:

```text
FOUND -> value36 -> p50[36]=0s
base59 / one-origin -> position52
position52 = end of p0 word10, length4 = GP length(GOOD)
```

and p0 word10 has the independently published exact GOOD inverse.

Freeze the **same compound geometry** one step upstream, before reading its receiver:

```text
BE -> value35 -> p50[35]=0d
0d has numeric value39 in both live alphabets
one-origin -> position38
position38 = end of p0 word6, length5 = GP length(FOUND)
```

The zero-origin rival position39 starts a four-rune word and therefore fails the target-length gate before ciphertext is opened. Base59/base60 are numerically identical for `0d`, so they are aliases rather than separate choices.

## Frozen value-changing test

Reuse the already published FOUND Alice-shell key unchanged:

```text
[p28 DH] p=23, g=5, a=6, A=8, K=2

key = [K*a, g-a, K*g, a-g, A]
    = [12,28,10,1,8]
```

Apply exactly subtraction modulo29 to p0 word6 offsets34..38.

**Positive gate:** the untouched receiver decrypts exactly to canonical GP `FOUND=[0,3,1,9,23]` with exact forward replay. This would be a prospective cross-receiver transfer of the fixed FOUND key under a source-only GP0/index pointer and p50 geometry rule.

**Negative gate:** any other output. Do not permute the key, change sign, change origin, move to the adjacent four-rune word, or fit another authenticated target.

No p0 rune value at offsets34..38 may be inspected before this precommit is remotely established.
