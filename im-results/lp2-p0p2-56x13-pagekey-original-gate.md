# P0–p2: 729 full runes and 716 black runes as candidate page-key rows

**Status:** The original 13-dot framing makes two exact 13-rune-row counts visible. Direct and one source-anchored two-layer reversible cipher-key interpretations on the original unsolved pages remain nonlinguistic. **No recovered plaintext, authenticated key, or inferred creator operation.** This is a bounded hypothesis, outside the established-results record.

## Source-visible alignment

On LP2 physical p0 (original JPEG `17.jpg`), **13 initial red runes** in an 8+5 title are followed by a **red 13-dot separator**. On physical p2 (original JPEG `19.jpg`), another **red 13-dot separator** comes immediately after the last rune. The intervening entire three-page region comprises p0 262 + p1 266 + p2 201 = **729 GP29 runes**, and the span between the two separators is **716 GP29 runes**:

```text
729 = 56 × 13 + 1    (all p0–p2 runes)
716 = 55 × 13 + 1    (after p0's red heading, through p2)
```

LP2 has **56 unknown physical pages p0–p55**, of which exactly **55 are rune-bearing** (p50 contains the middle of the 256-cell numeral panel). This motivates two *competing* speculative row interpretations. In the full 729 register, 56 rows of 13 runes and a residual occupy the three pages, and row0 coincides with the **literal original red heading** when the residual is last. In the 716 black register bounded by the two 13-dot separators, 55 rows of 13 and a residual can be assigned to 55 rune-bearing unknown pages in physical order, skipping p50.

Source constraints are the original image ink, marker positions, rune counts, and page mapping. **No first-party text instructs an actual 13-rune key table, an omitted residual, a mode, or even reuse of the opening chapter as a key.** The alternative 729=27²=3⁶ is also a natural design interpretation and has existing separate investigations. Direct use of an opening-source row to decode that same opening page would be self-referential. Hence pages p3–p55 are the independent original receiver here.

## Frozen original-source test

Reproduce with [the single-file CommonJS SFT](../sims/lp2_p0p2_56x13_pagekey_original_sft.cjs) reading the repository's canonical `resources/liber-primus/lp2-corpus.json`.

The four source row placements are:

| Register | Key rows | Original rune offset of first key | Residual placement | Page-to-key address |
| --- | ---: | ---: | --- | --- |
| Full 729 | 56×13 | 0 | Last | Physical page number |
| Full 729 | 56×13 | 1 | First | Physical page number |
| Black 716 | 55×13 | 13 | Last | Rune-bearing physical-page ordinal, skipping p50 |
| Black 716 | 55×13 | 14 | First | Rune-bearing physical-page ordinal, skipping p50 |

For each placement, reverse the key or keep printed order, select addition or subtraction, and apply three familiar reversible constructions over GP29:

1. Repeating period-13 key: `P[i] = C[i] ± key[i mod 13]`.
2. Ciphertext-autokey at lag13: `P[i] = C[i] ± (i<13 ? key[i] : C[i−13])`.
3. Plaintext-autokey at lag13: `P[i] = C[i] ± (i<13 ? key[i] : P[i−13])`.

This defines exactly **48 direct source-row candidates**, without fitting unknown secrets.

### Source-crib two-layer keybook gate

The 2016 Cicada-signed message supplies the candidate printed p0 title `EPIPHANY SEECS` (native GP normalization of “EPIPHANY SEEKS”). Its pinned original 13-rune additive difference key is `K=[26,24,8,19,27,24,18,3,0,8,0,16,19]`. Its GP-prime weights sum exactly **729**, matching this three-page opening chapter. The title remains provisional because every 13-rune guessed plaintext prefix fits one 13-rune additive key; the existing full source F-transparent/autokey study rejects the simplest prose continuation. [First-party source and checksum control](../sims/lp2_p0_epiphany_signed_729_primecheck_sft.cjs).

A different, motivated possibility is that the **716 black runes represent 55 encrypted page keys**, for which native-English IoC on the first-stage output would be the wrong goal. We therefore subtract the same fixed candidate title key in standard period-13 GP29 Vigenère from all 716 black runes to get a *hypothetical encrypted keybook*. With the leftover rune alternatively first or last, parse its 715-runic remainder into 55 rows of 13 symbols. Apply each row to the independently held-out physical page with the same explicit three reversible consumers, two signs and two orientations. This creates exactly **24 additional layered tests**, with **no fitted page key** and the same independent original p3–p55 receiving ciphertext.

The first-stage stream remains near uniform (IoC **0.0341524**), which is expected for a keybook and is not grounds for rejection. The original independent **second-stage** page outputs yield whole-receiver IoC **0.0344631–0.0345237** and no long page at IoC≥0.050 (maximum **0.0396694**). Neither extra decoded residual rune is a simple additive or prime-sum checksum of the 715 purported keybook symbols: initial residual GP0=5 versus GP0 sum25, GP-prime sum23 mod29; terminal residual GP0=10 versus GP0 sum20, GP-prime sum5 mod29. These are only two obvious checksum conventions; they are not universal exclusions. The strong conclusion is limited to the exact two-stage direct cipher consumers. A genuinely encrypted keybook or another page-key expansion remains conceivable without a supporting original operation.

**Total source-motivated original receivers in this bounded experiment: 72 (48 direct, 24 layered).** All original pages **p3–p55, excluding rune-free p50**, supply **12,227 ciphertext runes on 52 independent pages**. Also test 49 pages of length≥100 separately. A genuine solved p57 GP29-language control is used for IoC comparison, and each reversible mode is checked by exactly recovering all 95 solved p57 runes from its synthetic encryption.

## Observed decision

| Diagnostic | Result over the 72 original-input candidates |
| --- | --- |
| Original full-receiver decoded GP29 IoC | **0.0344471–0.0345264** |
| Number of independently decoded long pages reaching IoC≥0.050 | **0 of 49 per candidate** |
| Largest long-page IoC across the entire candidate family | **0.0396694** |
| Length/word-preserving original runes consumed per candidate | **12,227** |
| Genuine solved p57 GP29 IoC | **above 0.050** |
| Reversible native p57 synthetic planted control | **72 of 72**, each **95/95 recovered runes** |

Both plausible source-frame registrations and the title-key-decoded keybook interpretation fail to recover ordinary GP-native natural prose under the frozen standard cipher consumers. The paired 13-dot separators make the black-register hypothesis interesting as a reading cue, but the numerology does not fix its operation and no original ciphertext was deciphered.

**Decision:** Retire these exact direct and title-crib-fed two-stage repeating/lag13 autokey inverses. Future investigation would need a source-selected 13-rune-row consumer, with a complete exact inverse and non-overfit original plaintext holdout, to justify pursuing this alignment. Do not expand the idea into unconstrained key transformation sweeps solely because of the exact count.
