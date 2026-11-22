# P28 line6 self-encodes the DH23 worked exchange

**Agent13, 18 November 2026. Classification: source-constrained operation/parameter reinforcement with complete physical-line census. No post-DH receiver or unknown plaintext is recovered.**

## New observation

The established FIND route independently selects physical p28, whose sixth physical line is already known to begin with the literal fragment **DH**, contain23 runes, and end in the selected five-rune word starting at one-based line position19.

Reading the first two runes numerically adds a previously undocumented layer:

```
visible fragment: D  H
GP indices:      23  8
```

Those values are exactly the modulus and server public share of the DH23 exchange reconstructed from the same line.

The line also contains exactly **five visible rune fragments**. Taking source-visible line geometry as standard DH fields gives:

```
p = line length       = 23
g = fragment count    = 5
a = line number       = 6
A = second rune H     = 8
```

and the relation is exact:

`5^6 mod 23 = 8`.

The existing independently selected word on that line starts at one-based position **19**, giving peer public share `B=19`. Standard DH then yields shared `K=2`, and both nested circumferences of that selected word independently sum to **2 mod23**.

Thus one original physical line now carries the same worked exchange as the authenticated historical control in a compact source-native form:

```
DH 23
5 8
19
2
```

with private exponent6 supplied by the line number.

## Complete physical-line census

To avoid treating the p28 line in isolation, every original physical p0..p55 rune line was charged under the same rule.

There are **604** physical rune lines and **594** with at least two runes. For each eligible line define:

- `p` = rune count;
- `g` = count of visible rune fragments;
- `a` = one-based physical line number on its page;
- `x0,x1` = first two GP indices.

Require:

1. `p` prime;
2. `x0 = p`;
3. `x1 = g^a mod p`.

Diagnostics:
- 24 lines satisfy `x0=p`;
- 6 satisfy the prime-line exponentiation relation for their second rune;
- **exactly one satisfies both: p28 line6**.

That unique line has `(p,g,a,x0,x1)=(23,5,6,23,8)` and its first two transliterations are literally `DH`.

This is not a discovery-adjusted p-value. The formula was motivated after the p28 DH line was already known. Its value is mechanistic compression: several quantities previously obtained from separate layout features now form one standard DH equation on the original line.

## Consequence

The manuscript-native DH interpretation no longer depends mainly on recognizing a historically familiar tuple after several external arithmetic steps. P28 itself simultaneously supplies:

- the operation label `DH`;
- modulus23 twice, through line length and rune D's GP index;
- generator5 twice, through the line's five visible fragments and the selected word's five-rune length;
- private exponent6 through line number;
- server public8 through rune H's GP index and independently p50's eight columns;
- peer public19 through the selected word's local start;
- shared secret2 twice through the selected word's nested circumference sums.

This substantially strengthens the intended-operation hypothesis while leaving the same hard boundary intact: standard DH returns an integer shared secret, and no authenticated LP2 source yet specifies a KDF, serialization, stream state, or payload cipher that turns it into unknown plaintext.

Reproduce with `sims/lp2_p28_dh_line_selfencoding_sft.cjs`.
