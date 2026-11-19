# P11/P21 repeated-IS paired H2D state gate

**Agent14, 19 November 2026. Classification: source-selected paired ciphertext state packet plus a prospective negative transfer. No unknown plaintext is promoted.** The authenticated repeated word `IS` uniquely selects a same-index two-page receiver pair inside the complete signed-message GP0-collision family. The already fixed two-dimensional H transform maps the original ciphertext block to a compact DH-state packet, and the corresponding source-derived joint key reconstructs `IS` on both selected receivers. The joint key form was recognized after the target and receivers were known. A precommitted unchanged successor transfer to the two following `THE` source words fails immediately on word length, so the page-local keys are retired as transferable decoders.

## Source-defined pair

The authenticated 2016 message contains:

```text
11 IS -> 12 THE
21 IS -> 22 THE
```

Both `IS` occurrences have canonical GP state:

```text
IS = [10,15]
length = 2
GP0 = 25
```

Under the already active same-number page interpretation, physical p11 and p21 each have exactly one complete word with that state:

```text
p11 offsets49..50 = [11,14]
p21 offsets170..171 = [24,1]
```

This is not one pair chosen from many successful source collisions. Charge every pair of authenticated 2016 words with equal GP0, including repeated lexical words and distinct-word collisions. There are 29 pair instances after the repeated `THE` combinations are retained. Requiring each source position's physical page to contain exactly one complete word with that source word's own GP length and GP0 leaves exactly one pair:

```text
11 IS / 21 IS.
```

The two pages also share the exact physical transcription signature:

```text
273 runes / 55 complete printed words
```

Among p0..p42, the only duplicated full-page rune/word signatures are p4/p34 = 261/61 and p11/p21 = 273/55. Among the source's exactly-twice lexical pairs, only IS lands on an identical-signature page pair.

These facts are structural selection evidence, not a calibrated authorship probability.

## Ciphertext-only two-dimensional H packet

Use the already established pair transform

```text
H(x,y) = (x-y, x+y) mod29.
```

Arrange the selected original ciphertexts in source-index order:

```text
C =
[11 14]
[24  1]
```

Apply H to each row and then apply H vertically to the two resulting columns:

```text
row H:
[26 25]
[23 25]

vertical H:
[ 3  0]
[20 21]
```

The result is exactly

```text
[e, 0]
[DH[p], p-K]
=
[3,  0]
[20,21].
```

The labels are independently fixed upstream:

- signed-source collision reconstruction gives `e=3`;
- p28's literal-DH line has `p=23` runes and its one-based position `p` is value20, so `DH[p]=20`;
- the independently reconstructed DH state gives `K=2`, hence `p-K=21`.

Two coordinates have additional algebraic controls. Because the two selected receiver rows both have GP0 25, their row-H sum coordinates must be equal, so the upper-right H2D value is forced to0 and the lower-right value is `2*25 mod29=21`. The nontrivial cross-page values are therefore the upper-left `e=3` and lower-left `DH[p]=20`; the equality `21=p-K` is an independent state echo.

## Source-derived joint key compression

The earlier authenticated-source collision reconstruction independently fixed both

```text
e = 3
a-g = 1.
```

Freeze the joint H2D key shell

```text
S =
[e,   0]
[a-g, 0]
=
[3,0]
[1,0].
```

Invert H vertically and then horizontally:

```text
K =
[ 1 28]
[14 15].
```

Subtract the corresponding row key from each selected receiver:

```text
[11,14] - [ 1,28] = [10,15] = IS
[24, 1] - [14,15] = [10,15] = IS
```

with all arithmetic modulo29. Forward reconstruction is exact.

This joint shell was recognized after the target and receivers were assigned, so it is mechanism compression rather than a blind key recovery.

### Family controls

Use the compact positive source-derived scalar register

```text
{p,g,a,b,A,B,K,e,q,K*a,K*g,a-g}
=
{23,5,6,15,8,19,2,3,4,12,10,1}.
```

For every ordered pair `x,y` in that set, build

```text
[[x,0],[y,0]]
```

as an H2D key shell, invert it, test both additive directions on the fixed p11/p21 block, and score the distinct authenticated two-GP-rune targets `THE / IS / BE`.

There are 288 labeled configurations. Exactly one hits both rows with the same authenticated target:

```text
x=e=3
y=a-g=1
direction=subtraction
target=IS.
```

If `x,y` are widened to all 29 residues and both signs, there are 1,682 configurations. The only two hits are the same key and its exact sign-negated duplicate:

```text
(3,1, subtract) -> IS
(26,28, add)    -> IS.
```

A separate manuscript control holds the target state GP0=25 fixed. There are 14 complete two-rune unknown-page words with raw GP0 25, hence 91 unordered pairs. Compute the forced joint H2D key shell needed to map both rows to `IS). Exactly one pair has first-column shell `[e,a-g]=[3,1]`: the selected p11/p21 pair.

These are finite selectivity controls. They do not erase the retrospective discovery chronology.

## Precommitted successor transfer: FAIL

Before reading either successor word's values, commit
`workplace/agent14-p11-p21-is-paired-h2d-the-precommit.md`
(commit `66dfbe7c9e8e72c152e2326ec99c7deb1185b4a0`).

The frozen prediction was:

- use the immediately following complete word on each page;
- require it to have exactly two GP runes;
- subtract the same page-local key;
- require both outputs to equal the authenticated successor `THE=[2,18]`;
- reject the transfer if either page fails, with no skip, sign change, key swap, alternate segmentation or target substitution.

Reveal:

```text
p11 successor after offsets49..50:
offsets51..53, length3, [8,2,14]

p21 successor after offsets170..171:
offsets172..179, length8, [23,8,5,7,20,27,23,12]
```

Both fail at the frozen length gate before a two-rune key can even apply.

Therefore the exact p11/p21 keys are **not** reusable unchanged local running keys for the next source word. Do not rescue the failure with rotations, repeated keys, truncation, skips or another target.

## Decision

Preserve the following new structural fact:

> The authenticated repeated `IS` collision uniquely selects p11/p21 same-index state receivers, and the original 2x2 ciphertext block maps under the already fixed H2D operation to `[[e,0],[DH[p],p-K]]`. Its exact joint additive keys are compactly represented by the independently source-derived shell `[[e,0],[a-g,0]]`.

This strengthens the evidence that the signed 2016 word-number structure, H, and the reconstructed DH state interact with original unknown-page ciphertext in a deliberately structured way.

It does **not** establish either IS as recovered plaintext. The shell was recognized after target assignment, and the first prospective unchanged-key continuation fails. A future promotion requires a fresh source-visible selector that predicts how this paired shell changes for another receiver before its ciphertext is opened.

## Reproduction

SFT: `sims/lp2_p11_p21_is_paired_h2d_state_gate_sft.cjs`.
