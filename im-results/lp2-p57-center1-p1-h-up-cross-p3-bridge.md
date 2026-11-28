# P57 center-one selects p1; p1 center-H reads UP and closes a source-visible bridge to p3

**Agent18, 28 November 2026. Classification: new source-constrained navigation/H-opcode cross-lock plus bounded full-page negatives. No unknown LP2 body plaintext is claimed.**

## Result

Solved physical p57 explicitly says:

```
SHED OUR OWN CIRCUMFERENCES
FIND THE DIUINITY WITHIN AND EMERGE
```

The established original-raster analysis of its unique terminal 23-dot ornament gives recursive circumference onion:

```
[14,8,1]
```

The prior morphology report deliberately stopped short of promoting the final center `1 -> p1` interpretation because p1 had not passed a typed receiver test. This report freezes that literal continuation **before using p1 content**:

```
p57 terminal ornament
  -> shed circumference14
  -> shed circumference8
  -> center1
  -> signed "numbers are the direction"
  -> physical p1
```

Physical p1 is the middle page of the original p0–p2 opening triple and carries the already-established matched pair of three-bar crosses: lower-left inverted and upper-right upright, related by an exact 180-degree page-centered rotation. The cross geometry itself was established before this test.

P1 has exactly **266 GP29 runes**. Its two central runes, positions132 and133 in zero-based physical rune order, are:

```
left  = 6 = G
right = 7 = W
```

Use the same frozen H operation already present elsewhere in the current source-state program,

```
H(x,y) = [x-y, x+y] mod29.
```

The artwork supplies a direction: the lower-left cross is the inverted member and the upper-right cross is the upright target, so take the right/upright member first. At the p1 center:

```
H(right,left)
= H(7,6)
= [1,13]
= [U,P]
= UP.
```

This is not obtained by scanning p1 for words. The receiver is selected by the p57 center before p1 content is consulted, the pair is the unique geometric center of an even-length page, H is frozen, and the orientation is the one literally carrying the inverted cross into the upright cross.

## Complete manuscript center control

Charge the exact same directed center-H rule on every nonempty unsolved physical page p0–p55 with an even rune count.

There are **23** such pages. Exactly one has center-H output `[1,13]` / `UP`:

```
physical p1 only.
```

Other readable-looking center outputs do occur under the GP labels (for example `IN` on p13 and p45), so this is not presented as a discovery-wide probability claim. The important fact is narrower: **the page prospectively selected by p57's center1 returns a semantically exact orientation word under the already-used H pair grammar.**

## Human-readable continuation to p3

`UP` has a literal target on p1: of the two matched cross illustrations, exactly one is upright. It is a standard three-bar Eastern/Russian Orthodox cross form, so its visually dominant count is **3 horizontal bars**.

Under the already authenticated 2016 statement that the numbers are the direction, the minimal continuation is therefore:

```
p57 center1
  -> p1
  -> center H = UP
  -> upright three-bar cross
  -> 3
  -> physical p3.
```

P3 is independently important: its marked red triad `[13,23,2]` is the existing field source for the exact Q-state construction. The p1 result therefore supplies a second original-art route into p3 that is materially different from the previously published red-13-punctuation peel `13 -> interior3 -> p3`.

This does **not** make the H operation author-signed, and it does not independently prove that the creator intended the cross bar-count as a page address. It does remove the prior untyped status of the p57 center1 continuation: p1 now returns a source-visible local instruction that acts on its own artwork and lands on an independently live receiver.

## Why UP is local, not a body decryption

The most literal whole-page extension was frozen and tested rather than rescued after the local hit.

Pair every p1 rune with its 180-degree counterpart, begin at the center as instructed by `WITHIN AND EMERGE`, apply directed `H(right,left)`, and serialize each difference/sum pair. This complete reversible 266-rune transform begins:

```
UP...
```

but immediately becomes nonprose. Using the repository's pinned LP1 source-native trigram model:

| Stream | mean trigram log score |
| --- | ---: |
| LP1 training | -2.260728012730832 |
| solved p57 | -2.468144714244746 |
| p1 printed | -3.440978878397509 |
| p1 center-out H | -3.425603603310450 |

So the `UP` result behaves as a **local opcode/navigation word**, not the prefix of a full-page H plaintext.

The same applies to the obvious 2014 column-transposition consumer. P1 has the exact factorization:

```
266 = 14 x 19.
```

Only p1, p6 and p36 among nonempty unsolved pages have rune counts divisible by14, and p1 is the only member of the p0–p2 crossed opening triple. The historical 2014 Cicada chain used the documented 14-column permutation:

```
[2,8,9,1,12,13,11,4,5,7,3,0,6,10]
```

on five 14-character rows to recover `GOOD WORK / ULTIMATE TRUTH IS THE ULTIMATE ILLUSION / ...`. Applying that fixed permutation rowwise to p1 gives score **-3.416230853368736**; reading the historical columns literally **UP** from bottom to top gives **-3.422646357226988**. Neither is native prose. The historical permutation is an archived solve operation rather than a signed instruction telling LP2 solvers to reuse that exact column order, so this negative is deliberately scoped to those two obvious consumers.

Historical references for the 2014 order:
- https://cicadanotebook.com/sessions/358.html
- https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_3

## Evidence boundary

**Exact/source-fixed:**
- p57's terminal ornament onion is `[14,8,1]` under the previously established original-raster circumference operation;
- p1 is physical page1 and contains 266 canonical GP29 runes;
- its two central values are left/right `[6,7]`;
- frozen `H(right,left)` is exactly `[1,13]=UP`;
- p1 is the sole exact `UP` hit among all 23 even nonempty p0–p55 page centers under that fixed rule;
- the p0–p2 cross asset is a pre-existing exact 180-degree inversion pair; the upright member visibly has three horizontal bars;
- the full center-out H stream and two obvious historical-14 consumers are nonprose under the pinned native model.

**Interpretive/provisional:**
- extending p57's `numbers are the direction` grammar from center1 to p1;
- reading local `UP` as “select the upright cross”;
- reading the cross's three bars as page3;
- treating H as an intended p1 opcode rather than a structurally apt coincidence.

No p1 body plaintext, key, KDF, or general LP2 cipher is claimed.

## Reproduction

Run:

```
node sims/lp2_p1_center_h_up_sft.cjs
```

The SFT uses only canonical repository inputs and the existing pinned LP1 source-native trigram model. It asserts the exact center values/output, complete even-page center census, 14-divisibility census, historical permutation, and frozen negative scores.

Related earlier evidence:
- [p57 circumference onion](lp2-p57-dot-circumference-onion.md)
- [punctuation circumference morphology](lp2-punctuation-circumference-morphology.md)
- [opening cross geometry and reversal gate](lp2-opening-cross-geometry-and-reversal-gate.md)
- [orthodox cross source plate gate](lp2-p0-p2-orthodox-cross-source-plate-gate.md)
- [p3/Q field route](lp2-p3-q-frobenius-dh-lock.md)
