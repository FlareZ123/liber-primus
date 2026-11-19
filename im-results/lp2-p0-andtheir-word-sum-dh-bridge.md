# P0 ROAD/NUMBERS receiver word sums invert to literal DH

**Agent3, 19 November 2026. Classification: source-selected receiver/state bridge with a failed sequential holdout. The receiver geometry was sealed upstream before its rune values were consumed; this report notices a new aggregate relation after those values were already public. It strengthens the receiver and DH-state linkage, not the candidate plaintext letters AND/THEIR.**

## Source-selected receiver

Agent18's sealed ROAD dual-radix experiment selected the adjacent original p0 words

```text
word42 offsets189..191 length3
word43 offsets192..195 length4
```

before opening their rune values. The authenticated 2016 source continuation after ROAD is **AND THEIR**, whose canonical GP lengths are `[3,4]`. Agent22 later reselected the same adjacent pair independently from `GP0(NUMBERS)=83 -> p50[83]=3D` under the source-only dual-radix rule.

The opened ciphertext words are

```text
p0 word42 = [0,6,9]
p0 word43 = [19,12,20,9]
```

Their ordinary coordinate sums are

```text
15
60 = 2 (mod29)
```

so the ordered raw word-sum state is

```text
[15,2] = [b,K].
```

No candidate plaintext values or additive keys are needed for this reduction.

## The independently selected p28 DH line carries the same ordered state

Physical p28 line6 is the manuscript's unique rune-bearing line beginning literal **DH** and independently reconstructs

```text
(p,g,a,b,A,B,K) = (23,5,6,15,8,19,2).
```

The already frozen outer-pair map is

```text
H(x,y) = (x-y, x+y) mod29.
```

The first printed fragment on that line is literal `DH = [23,8]`, hence

```text
H(D,H) = H(23,8) = [15,2] = [b,K].
```

The selected p0 pair therefore reproduces the exact first p28 DH-line H state at the level of whole-word ciphertext sums.

Because H is invertible over GP29,

```text
H^-1([15,2]) = [23,8] = DH.
```

Thus one fixed reversible operation turns the two selected raw p0 word sums back into the literal source label **DH**.

## Manuscript-wide shape control

Charge every adjacent complete unknown-page word pair with lengths exactly `[3,4]`, matching the prospectively fixed AND/THEIR source shape.

Across p0..p55 there are **126** such adjacent pairs.

Exactly **one** has raw coordinate sums modulo29 equal to the first p28 DH-line H pair `[15,2]`:

```text
p0 word42/43
offsets 189..191 / 192..195
lengths [3,4]
sum residues [15,2]
H^-1 -> DH
```

Across all five outer-H pairs from p28 line6,

```text
[15,2], [14,4], [12,12], [23,12], [8,19]
```

only **two** of the 126 manuscript-wide `[3,4]` pairs match any member. The selected p0 pair matches the first pair; p51 words8/9 at local starts31/34 match the second pair `[14,4]`. The latter has no independent receiver selector here and is retained only as a control observation.

The exact `[15,2]` state occurs at four adjacent word pairs if word lengths are ignored. The independent `[3,4]` source shape is what makes the selected p0 pair unique.

## Prospective sequential holdout fails

The obvious stronger hypothesis would serialize the p28 DH-line H pairs through successive authenticated source word shapes.

After **AND THEIR**, the signed source continues **NUMBERS ARE**, with canonical GP lengths `[7,3]`. Before searching those receivers, freeze the next p28 DH-line H pair as `[14,4]`.

Across the manuscript there are **61** adjacent complete `[7,3]` word pairs.

Result:

```text
[7,3] pairs with raw sum residues [14,4] = 0 / 61.
```

Therefore the new bridge is **not** evidence for a sequential five-pair serializer. Do not rescue it by changing the source-word pairing, H-pair order, residue convention, or receiver shape.

## Decision

Preserve one narrow upgrade:

> The independently source-selected p0 `[3,4]` receiver at offsets189..195 is the unique manuscript-wide `[3,4]` pair whose raw word sums are exactly `[b,K]`; the frozen inverse H map converts those sums to literal **DH**.

This is a clean cross-object state checksum that does not depend on choosing AND, THEIR, PATHS, or any additive key. It materially strengthens the receiver itself and ties the ROAD/NUMBERS navigation branch back to the independently promoted p28 DH23 state.

It does **not** settle the word43 THEIR/PATHS ambiguity, recover new rune-level plaintext, or define a reusable word-sum cipher. The first natural sequential transfer fails completely.

## Reproduction

Run:

`node sims/lp2_p0_andtheir_wordsum_dh_bridge_sft.cjs`
