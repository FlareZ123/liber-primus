# P27 dual-radix DJU/BEI navigation closes a DIVINITY -> red13 -> shared2 shedding loop

**Agent20, 18 November 2026. Classification: source-constrained structural navigation and operation selection. No unknown LP2 plaintext, complete cipher inverse, post-DH KDF, or final destination is recovered.**

## Decision

Retain a new p27-local interpretation of the independently selected `DJU / BEI` pair.

The terminal p55 copy and its unique earlier duplicate select p27. Solved p57 `FIND` has GP0 sum42; original p50 cell42 is `0S`, which decodes to28 under both frozen numeral alphabets. On the already selected p27 page, local rune offset28 is exactly the start of `DJU`, followed by `BEI` at31.

Applying the replicated whole-word GP0 -> p50 rule independently to those two source words, while retaining p27 as the receiver page, produces two distinct first hops that converge on one original 12-rune carrier under **both** base59 and base60. The p57 parable then explains the numerical registers of that convergence and selects an exact 8-rune interior whose GP-prime sum is `DIVINITY`. GP0(`DIUINITY`)=105 returns through p50 to the literal token `13`, selecting p27's visible red 13-dot object. The already established red13/DH transducer returns shared secret2, exactly confirming the symmetric shedding depth that exposes the DIVINITY interval.

This supplies a source-constrained handoff into the p27 red13/DH mechanism and removes the earlier arbitrary choice of a two-rune shedding depth. It still stops before a reversible unknown-page plaintext operation.

## Upstream selection is fixed before the new arithmetic

Across the 2,896 complete unknown words, the only repeated adjacent two-word phrase is `DJU / BEI`, at complete-word indices1462 and2894. The second copy is the terminal pair on p55; the earlier copy is on p27.

The solved p57 word `FIND` independently supplies the local offset:

```text
GP0(FIND) = 42
p50[42]   = 0S
base59(0S) = 28
base60(0S) = 28
```

Original p27 rune offset28 begins `DJU`; offset31 begins adjacent `BEI`.

Thus page and offset are source-selected before the new p27-local continuation is evaluated.

## Dual-radix two-step convergence

The selected words have:

```text
GP0(DJU) = 35
GP0(BEI) = 45
```

First p50 lookup:

| source | p50 cell | token | base59 | base60 | p27 receiver |
| --- | ---: | --- | ---: | ---: | --- |
| DJU | 35 | `0d` | 39 | 39 | rune39, inside `AEPTH` at37..39 |
| BEI | 45 | `1l` | 105 | 107 | first or last rune of `ATS` at105..107 |

The containing three-rune words have:

```text
GP0(AEPTH) = 40
GP0(ATS)   = 55
```

Original p50 cells40 and55 are **both the same printed token `1K`**. Therefore both source branches reconverge:

```text
base59(1K) = 79
base60(1K) = 80
```

Both values land in the same original p27 word:

```text
offset79..90 = EORNSOOCAEYEE
length = 12 runes
```

Base59 lands exactly on the first rune at79. Base60 lands on the next rune at80.

A complete local family control over all51 adjacent p27 word pairs finds two pairs that converge on one target word under both numeral alphabets. The other pair already collides on the same first hop. `DJU / BEI` is the **only** pair whose distinct first hops reconverge under both alphabets.

## P57 explains the otherwise opaque intermediate numbers

The solved p57 vocabulary supplies exact meanings for the key registers of this path.

### OWN supplies both intermediate GP0 addresses

```text
GP-prime(OWN) = 55
phi(55)       = 40
```

Those are exactly the two intermediate GP0 addresses:

```text
GP0(AEPTH) = 40
GP0(ATS)   = 55
```

Both p50 cells carry `1K` and therefore point to the same carrier.

There is also a direct p57 base59 path into the same carrier:

```text
GP0(TUNNELNG) = 94
p50[94] base59 = 55 = GP-prime(OWN)
p50[55] base59 = 79 = carrier start
```

The source-selected TUNNELNG pointer route therefore reaches the same p27 carrier without using the DJU/BEI second-hop interpretation.

### OUR gives the carrier length

```text
GP-prime(OUR) = 21
phi(21)       = 12
```

The selected carrier has exactly12 runes.

### SURFACE and EMERGE give the base60 convergence point

```text
GP-prime(SURFACE) = 246 ; phi = 80
GP-prime(EMERGE)  = 300 ; phi = 80
```

Byte80 is exactly the base60 convergence point inside the carrier.

### WE returns to FIND

```text
GP-prime(WE) = 86
phi(86)      = 42 = GP0(FIND)
```

This is an internal p57 numerical closure on the already active FIND address.

## The DIVINITY interior is source-selected, not chosen by depth search

Base59 continuation from the carrier start gives:

```text
p50[79] base59 = 81
```

This fixes the left edge of the inner interval.

The solved word `WITHIN` fixes its right edge:

```text
GP-prime(WITHIN) = 115
phi(115)         = 88
```

The original p27 span81..88 is therefore fixed before its sum is read:

```text
p27[81..88] = NSOOCAEY
length = 8
GP-prime sum = 376
```

Solved p57 `DIUINITY` also has eight runes and GP-prime sum376.

The same carrier can be described as symmetric shedding by two runes from each edge, but that is now a consequence of the independently selected endpoints81 and88 rather than a fitted depth.

Across all **2,896 complete unknown words**, `EORNSOOCAEYEE` is the **only** word satisfying both of these fixed signatures:

1. `phi(whole GP-prime sum) = 280 = GP-prime(INSTAR)`;
2. some symmetric interior has GP-prime sum `376 = GP-prime(DIUINITY)`.

For this word the matching symmetric depth is uniquely2.

The solved p57 vocabulary contains one further exact totient relation:

```text
GP-prime(DIUINITY) = 376
phi(376)           = 184
GP-prime(LICE)     = 184   # GP spelling of LIKE
```

Among the complete p57 vocabulary, DIVINITY -> LIKE is the only case where the totient of one word's GP-prime sum equals another p57 word's GP-prime sum.

## DIVINITY returns to p27's visible red13 receiver

Canonical GP0 gives:

```text
GP0(DIUINITY) = 105
p50[105]      = literal token 13
```

On the already selected p27 receiver, the source ink annotations give exactly:

- a red heading at offsets0..18, length19;
- an immediately following red large-punctuation mark with count13.

The established p27 red13 construction is therefore reached by a literal source token from the newly selected DIVINITY semantic value.

The local red13 arithmetic remains:

```text
13th heading rune, one-based = I
GP-prime(I)                 = 31
heading length - 13         = 6
whole heading GP-prime sum  = 1109 = prime #186
31 * 6                      = 186
```

The solved p57 word `MUST` independently has GP-prime sum186.

Using the source-derived pair(31,6) as the established zero-based 32x8 p50 coordinate gives address254 and token `39`:

```text
base59(39) = 186 = 23*8 + 2
base60(39) = 189 = 23*8 + 5
5^6 mod 23 = 8
```

The signed DH23 worked example therefore returns shared secret **2** on the base59 branch. That value independently confirms the symmetric shedding depth of the selected p27 carrier:

```text
EORNSOOCAEYEE
  NSOOCAEY       # shed 2 runes from each side
```

The separate p50 DH geometry had already selected circumference depth2 from the same shared secret. The new route makes that depth a holdout confirmation of the p57/p27 DIVINITY interval.

## Shared2 also selects an exact SHED receiver on p50

The same shared secret2 has a literal geometric consequence on the original 32×8 p50 rectangle. Removing two complete outer layers leaves:

```text
(32 - 4) × (8 - 4) = 28 × 4 = 112 cells.
```

That count is independently named by the solved instruction word:

```text
GP-prime(SHED) = 232
phi(232)       = 112
```

Thus the DH value and the p57 verb agree on the same exact p50 interior size without choosing a depth after inspection.

The literal `13` at global cell105, reached by `GP0(DIUINITY)=105`, lies inside this depth-2 interior. Decoding that printed token as the next p50 pointer immediately leaves the shed rectangle under both frozen numeral systems:

```text
base59(13) = 62   # outside the 28×4 interior
base60(13) = 63   # outside the 28×4 interior
```

This is a literal source-compatible realization of `FIND THE DIUINITY WITHIN AND EMERGE`: DIVINITY identifies a cell within the shared2/SHED interior, and the next pointer exits it. The two radices disagree on the exterior destination, so this does not yet select the downstream path by itself.

A supporting base59 relation continues from cell105 for exactly the eight-rune length of DIVINITY and lands on83, which is `GP0(EMERGE)`:

```text
105 → 62 → 122 → 85 → 28 → 148 → 242 → 41 → 83
```

This self-length relation is not unique across the complete p57 vocabulary: MUST also reaches LIKE after its own four-rune length, and CIRCUMFERENCES also reaches EMERGE after14 steps. It is therefore retained only as supporting graph structure, not a selector.

## Rival interpretation retained

Agent5 independently found a different, strong reading of the same first outputs under base59:

```text
DJU -> 39
BEI -> 105
```

Read as **page39 / offset105**, those values enter a clean original-word circuit:

```text
p39:105 HGREOT -> p39:196 WLYNU -> physical p50
```

That route has exact word-start controls and should remain live. The present result instead keeps the independently selected p27 page active and reads the two outputs as local rune offsets.

The source does not yet provide an explicit grammar saying when a pair of table values is a page/offset coordinate and when each value should be reinterpreted within the current page. The two constructions are therefore competing architectural readings of the same source-selected words, with different successful holdouts.

## Direct decoder checks

The new interval supplies an 8-rune semantic crib candidate, but the obvious source-key consumers fail.

The exact GP29 key required to map original `NSOOCAEY` to `DIUINITY` by subtraction is:

```text
[15, 5, 2, 22, 25, 14, 2, 0]
```

No cyclic phase or direction of the source-selected 19-node TUNNELNG/SURFACE p50 path matches more than2 of the8 required residues under either additive sign. The authentic solved-p56 consecutive-prime-totient stream also fails at its genuine start. Earlier whole-page transfer work already rejects ordinary reuse of that p56 cipher on unknown pages.

Thus the new structural loop does not yet define a letter-level inverse for the selected eight runes.

## Reproduction and status

Primary reproducer:

`sims/lp2_p27_djubei_dualradix_divinity_red13_sft.cjs`

Dedicated Windows/Node22 workflow:

`.github/workflows/agent20-p27-dualradix-divinity-red13.yml`

Latest full source test: **PASS, run 44419149732** at commit `fdf6ceb5a8ff882ea3d92428dbc3c0e7f1f6b7c4`.

The SFT rebuilds all assertions from the canonical transcription, p50 table, corpus and ink annotations, including the full 2,896-word conjunction census and the 51-pair dual-radix p27 control.

**Current research decision:** promote this as a high-priority source-constrained handoff into the existing p27 red13/DH mechanism. It materially reduces the earlier source-selection weakness of that branch and supplies a source-derived shedding depth with an independent semantic confirmation. The remaining decisive problem is the post-DH receiver/KDF or another reversible operation that turns original ciphertext into unknown plaintext.
