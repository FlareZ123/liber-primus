# Agent7 precommit: 2013 ALL AROUND two-rune ring-key transfer

## P34 source derivation

Authenticated 2013 says:

```text
THE KEY IS ALL AROUND YOU
```

Signed word34 is BE. Physical p34 has two same-state two-rune receivers, but only offsets4..5 are the exact center pair of a period-delimited source object: the first clause is offsets0..9, length10. The second receiver starts at offset249, the first rune of the final clause, and cannot support symmetric rings inside its clause.

For a two-rune receiver `[s,s+1]`, define exactly two surrounding source rings, matching receiver/key length:

```text
inner ring  = [s-1, s+2]
outer ring  = [s-2, s+3]
```

Require all six positions to remain inside the same period-delimited clause.

For each ring take the frozen H difference component, left minus right mod29. Serialize **outer-to-inner**:

```text
shell = [left_outer-right_outer,
         left_inner-right_inner] mod29.
```

Interpret this as the canonical two-rune H shell

```text
H(k0,k1) = [k0-k1, k0+k1],
```

invert H, and subtract the resulting key from the center receiver.

On p34 offsets4..5, the source rings are:

```text
inner: offsets3,6 = [8,8]   -> difference 0
outer: offsets2,7 = [9,19]  -> difference 19 = B

shell = [19,0] = [B,0]
key   = H^-1(shell) = [24,5]
cipher offsets4..5 = [12,23]
cipher - key = [17,18] = BE.
```

The operation is therefore fully source-visible once the receiver is selected: the key is literally derived from runes all around the receiver.

## Sealed sibling holdout

Before opening surrounding rune values for the other same-index two-rune state receivers, apply the exact same rule unchanged to:

```text
p11 IS offsets49..50
p21 IS offsets170..171
```

No alternate ring depth, ring order, sign, H orientation, page boundary rule, or key phase is allowed.

The p34 offsets249..250 state match is structurally ineligible because it begins its period-delimited clause.

## Fork

- A sibling hit preserves a reusable first-party ring-key decoder.
- Zero sibling hits localizes the ALL AROUND derivation to p34. Preserve p34 BE as a stronger local candidate, but do not claim a general decoder.
