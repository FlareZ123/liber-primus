# p57 95 = 5×19 and p53 51: a derived structural coincidence, not a selected map

**Classification:** intermediate hypothesis, now **parked** after correcting the original-layout premise and running direct gates. No decryption, recovered key, or demonstrated creator-intended map has resulted.

## Source observations

Physical p57 (the final solved LP2 page; combined JPEG scan 74) contains **95 runes**, including the seven-rune red heading `PARABLE`, and **19 body words**. The actual printed-line rune counts are **20 / 17 / 17 / 18 / 23**, totaling 95. The first printed line includes the first rune `T` of `TUNNELING`:

```text
PARABLE LIKE THE INSTAR T
```

This corrects the earlier claim that the first printed line has 19 runes. The 5×19 row-major candidate's first row ends immediately before that `T`, so it does **not** align with the printed line. Agent 38 checked the canonical transcription's physical-line separators and original scan 74; the correction is preserved in [the source-layout message](../communications/agent35/20261111T0642Z_agent38_p57-5x19-line-correction.md).

A purely arithmetic 5×19 rendering of the 95-rune stream is:

| Row | 19 rune transliterations |
|---:|---|
| 1 | `PARABLELICETHEINSTAR` |
| 2 | `TUNNELNGTOTHESURFACEW` |
| 3 | `EMUSTSHEDOUROWNCIRC` |
| 4 | `UMFERENCESFINDTHEDIU` |
| 5 | `INITYWITHINANDEMERGE` |

These are simply consecutive 19-rune chunks. The later row boundaries split `WE`, `CIRCUMFERENCES`, and `DIVINITY`; the 19-rune width is not independently selected by the page layout.

If one chooses this rectangle, its border sizes are **44 / 36 / 15**: removing the 44-cell outer border leaves a 3×17 interior of **51** cells; removing the next border leaves a 1×15 central core `USTSHEDOUROWNCI`. Separately, the final 15 source-order runes are `YWITHINANDEMERGE`; they lie at the right end of the bottom row, not at the geometric centre.

The p53 red span is **51 runes** at zero-based page-local offset 128. Its transliteration is:

```text
TPWEOSWBEOTHNHGJRIADIATHAIEOAEXLEOEAIAAJHRTHPDJNGOGFEOMCHDOTCURPN
```

On original combined scan 70, these 51 runes span the final rune of the preceding line plus the next three red lines (**1 + 24 + 22 + 4**). They are not printed as a 3×17 block. Thus the p53/p57 relation is only a length/area match after choosing 5×19; it is not a visible geometric alignment.

The source transcription is [`resources/lp2-transcription.txt`](../resources/lp2-transcription.txt), with rune indices and prime weights in [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json). The p53 red-span annotation is in [`resources/liber-primus/lp2-ink-annotations.json`](../resources/liber-primus/lp2-ink-annotations.json).

## Possible historical selector, but not enough to establish the map

Existing research records the 2013 `NUMBER` operation on the PARABLE prime sum 449 as reversing 449 to 944 and factoring 944 as 16×59. Applying the same source-derived rule to the factor 59 predicts 95=5×19. **There is no preserved historical response for a literal `NUMBER 59` query**; this is a derived follow-up, not an authenticated instruction. It is the only present selector for width 19. The actual printed line does not independently support that width.

The p57 parable's “tunneling to the surface” / “shed our own circumferences” language makes a rectangular peel an understandable hypothesis, and the 2016 signed message's “words are the map” / “numbers are the direction” wording is broadly compatible with map-making. Neither source selects a 5×19 orientation or specifies how p53 red values act on the p57 interior.

## Secondary arithmetic observations

The GP-prime weights of all 95 p57 runes, including the heading, sum to **3968 = 128×31 = 2⁷×31**. The factor 128 equals the hexadecimal character count of the solved-p56 64-byte hash documented in [the authoritative synthesis](../results/README.md). This is a possible cross-stage length/checksum coincidence, not a demonstrated decoding step. The factor 31 does **not** map to C under the current source-derived 2013 `NUMBER` rule: `numberCommand(31)` reverses to 13, which is prime, and therefore returns `+`.

The 19 body-word GP-prime sums are `184,72,280,339,66,72,246,86,186,232,21,55,451,151,72,376,115,215,300`. Applying the archived NUMBER rule (factor composites; reverse primes and return `+` when the reversal is prime) yields **41 distinct-factor tokens**, one `+` (151), and one factor outside GP29 (113). The count 41 equals the 2014 7×7 square's 41 active NUMBER cells. This count equality is not a mechanism: the 40 mapped GP tokens do not match the 41-symbol centre-out key (best alignment 6/40), and using them as compass directions on the 7×7 active-cell map from its centre exits, hits a plus cell, or cycles after only 3–7 visited cells.

## Bounded tests and result

1. **Direct 51-symbol correspondence:** the row-major p57 3×17 interior and p53 red span have only 1 same-position match out of 51, different rune histograms, and no consistent one-to-one monoalphabetic substitution.
2. **Affine correspondence family:** Agent 9 tested identity / horizontal flip / vertical flip / 180° orientation and every nonzero (a\in GF(29)) in the complete separable family (C[r,c]=aP[r,c]+R[r]+K[c]\pmod{29}). No exact fit exists. Best is 24/51 (vertical flip, (a=8)); 19 cells are forced by fitting the first row and column, leaving only 5/32 additional matches.
3. **Difference-stream language check:** the p53-minus-p57 stream `SRIADASUNFLOECWROENEODAAEIGTHEAEYLHUAYOMNGNGXTHJOXTOEDOEWJEASMEA` looks superficially language-like, but a fixed native-GP bigram/trigram score is null against 20,000 permutations of the same 51 solved p57 values: upper-tail 0.44278 for subtraction and 0.88401 for addition.
4. **Direction / route tests:** p53 red prime-weight mod-4 left/straight/right walks from the p57 interior centre exit after 4–7 cells; ordinal mod-4 / prime-ordinal mod-4 absolute walks cycle after three. Agent 9's cumulative red-rune walks modulo 51 are not permutations (distinct positions: 28/51 for ordinal, 38/51 for ordinal+1, 33/51 for GP-prime values). Eight-way ordinal walks also exit or hit a boundary/previous cell within 3–8 steps.
5. **Standard grid reads:** column-major, alternating-row, and clockwise-spiral reads of the full 5×19 array do not produce a second readable text; only row-major preserves the parable.
6. **Direct p53-span additive key:** using the 51 red-span rune ordinals or their GP prime weights modulo 29 as a repeating additive key against the 12,956 unsolved runes (both signs, continuous-book and page-reset clocks) does not improve the language score; all tested quadgram scores are worse than the unmodified ciphertext.
7. **NUMBER-derived word keys:** repeating the 41-factor sequence (113 mapped to zero), dropping 113 for a 40-symbol key, or aggregating factor indices per word into a 19-symbol key all score worse than raw ciphertext under both signs and book/page clocks. The 41-factor-to-7×7 direction walk also fails as above.
8. **No plaintext recovered:** no tested operation yields a key, plaintext, or intended route.

Agent 9's complete direct-gate results are preserved in [the follow-up message](../communications/agent35/20261111T0650Z_agent9_p53-p57-inner51-direct-gates.md).

## Decision

**Park this branch.** The valid facts are the p57 95-rune count, 19 body words, the derived 95=5×19 factorization, the conditional 59→95 NUMBER follow-up, the 51-rune p53 red span, and the 51-cell area obtained after choosing a 5×19 rectangle. The earlier claimed 19-rune first-line alignment was wrong. The remaining 51=51 equality is under-selected and the natural direct correspondences have failed.

Do not create a Director task or expand this into arbitrary orientations, modular direction alphabets, or cipher menus. Reopen only if an independent source selects width 19 or supplies a specific reversible operation linking the p53 red span to the p57 interior.