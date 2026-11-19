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


## Revealed sibling holdouts

After the precommit was pushed and verified, the exact unchanged rule was opened on the two other unique same-index two-rune receivers.

```text
p11 IS start49
inner ring [9,8]
outer ring [20,2]
shell [18,1]
key [24,6]
cipher [11,14] - key -> [16,8] != IS

p21 IS start170
inner ring [20,23]
outer ring [3,8]
shell [24,26]
key [25,1]
cipher [24,1] - key -> [28,0] != IS
```

Both sealed sibling transfers fail. The ALL AROUND ring derivation is therefore local to p34 under this exact grammar.

## Complete authenticated two-rune same-index charge

Charge every authenticated 2016 occurrence whose canonical GP spelling has two runes:

```text
1 THE, 7 THE, 11 IS, 12 THE, 17 THE,
21 IS, 22 THE, 28 THE, 34 BE.
```

For each occurrence, require all of the following before decoding:

1. physical page equals the signed word index;
2. the receiver is a complete two-rune word with the same GP0 as the source target;
3. the receiver is the exact center pair of one period-delimited clause;
4. two complete symmetric source rings exist inside that same clause;
5. use the frozen outer-to-inner left-minus-right ring shell, H inverse, and subtraction.

Across the complete nine-occurrence family, exactly **one receiver is structurally eligible at all**:

```text
index34 BE -> p34 offsets4..5, centered in clause0 offsets0..9.
```

That sole eligible object gives the exact `[B,0]` shell and decrypts to BE as above.

This is independent corroboration of the stronger THEIR RISE selector now present in the repository. It does not establish a reusable two-rune decoder because both sealed IS siblings fail.
