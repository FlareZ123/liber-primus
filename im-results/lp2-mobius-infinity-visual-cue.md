# Cross-page Möbius/infinity cue: a real clue family, no validated inverse

**Status:** a new, source-motivated visual relation was identified and tested. It does not yet select a unique transformation or recover plaintext. The direct global and natural table-pointer interpretations tested below fail their discriminating checks. Do not promote the visual resemblance into a decryption claim.

## The cross-page clue

The solved early *Some Wisdom* page (LP1 archive 05.jpg; canonical section 0_wisdom) contains the terms **MOBIUS**, **TOTIENT**, and **PRIMES** in its word/number table. LP2 page 15 (archive 32.jpg) has a hand-drawn infinity symbol immediately beneath a 4×4 grid whose 16 values, read in the printed spiral, are prime differences:
2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817.

The 29-symbol Gematria Primus alphabet is naturally a 29-symbol alphabet, and 29 is prime. Its projective line P¹(F₂₉) has exactly 30 points: the 29 finite residues plus infinity. Thus the LP1 MOBIUS/TOTIENT/PRIMES vocabulary, LP2 p15's infinity mark, and the GP29 alphabet form a plausible cross-release selector for projective Möbius transformations. This is stronger than an unmotivated cipher-family guess, but it selects a family, not a matrix, operand, or key schedule.

A second visual alignment is suggestive but not decisive: LP2 p5 (archive 22.jpg) has four spiral ornaments; p50 is a 32×8 numeric table. A Möbius strip with 32 rows and width eight has four disjoint 64-cell cycles, pairing columns c and 7-c. This gives a natural way to test a four-cycle table walk, without establishing that the artwork intends it.

## Tests and outcomes

### 1. Möbius-strip walk over p50

Frozen rule: use each p57 word's GP0 rune-value sum as a row-major p50 cell address; interpret that cell's two-character token as base-60; advance that many steps modulo the 64-cell Möbius cycle, where the successor increments the row and flips the column at the row-31 seam. Compare the resulting cell address with the next p57 word's GP0 sum.

The 20-word p57 parable produces exactly one adjacent hit: **THE → SURFACE** (address 20 to 67). This looks semantically attractive, but it is not discriminating:

- The same GP0 address 67 denotes **SURFACE** in p57, **EVERY** in p56, and **FUNCTION** in the LP1 Some Wisdom control. The pointer therefore does not uniquely identify the target word.
- The same rule produces no adjacent-word hits on p56 or the LP1 Some Wisdom control.
- Under a simple uniform 256-address baseline, 19 transitions have expected matches 19/256 = 0.0742 and probability of at least one match 1-(255/256)^19 = 0.0715. One hit is not decisive.
- A second natural indexing convention—linearize the four Möbius cycles first, then use the GP0 sum as the cycle-stream index—removes the p57 hit and instead produces one p56 PAGE → THAT hit. The visual cue does not select between these address conventions.

The walk is therefore a useful bounded negative: a single semantic hit is not a recovered map or key.

### 2. Projective substitution on the 30-point alphabet

Tested the full PGL(2,29) family of 24,360 projective transformations as a single global substitution on the original LP2 transcription. The 29 rune symbols are the finite field elements; the transcription's hyphen word separator is treated as the projective point at infinity; non-alphabet punctuation remains framing. The corpus was split before scoring: pages p0–27 for selection and p28–55 as held-out text.

A fixed 295-word English screen gives the best global transform only 21 matches among 1,717 training words (31 matched letters; 0.575% letter coverage) and 14 among 1,599 held-out words (18 matched letters; 0.365% coverage). The top-scoring transform is affine ([1,19,0,4]); the best non-affine candidate is weaker ([1,0,1,5]). The same screen recognizes 11 of 20 words in the known p57 plaintext control. This is not credible plaintext recovery; the source-motivated global projective-substitution interpretation is rejected.

### 3. p15-prime-derived four-transform construction

As a separate frozen construction, group the 16 p15 spiral primes into four consecutive quartets and use each quartet, reduced modulo 29, as a 2×2 Möbius matrix. The four determinants are 28, 9, 12, and 4, so all four transformations are invertible. Apply their inverses to the base-60 values modulo 29 in the four successive 8×8 blocks of p50, mapping the projective point at infinity to a separator.

This produces no readable text. The grouping into quartets and assignment to p50 blocks are not themselves stated by a source; the test is a natural construction, not an established key schedule.

The reproducible script sims/lp2_mobius_infinity_visual_cue_sft.cjs implements these tests from the original corpus, transcription, p50 grid, and solved-page controls.

## Issue #2851: extra-state serialization and authentic F collisions

The source has not selected a unique thirtieth token. The enlarged infinity ornament on p15 is physically separate from the text, between the numeral square and the lower heading; the six smaller instances on p0–2 are framing ornaments (see [original ornament audit](lp2-original-infinity-ornament-source-gate.md)). It is not a recurrent inter-rune symbol. The word dot and 13-dot rubric are distinct visible marks. F is already one of the 29 chart runes.

Using the rich Rain transcription's rune-containing lines (excluding the numeric and hash rows) and checking the rune sequence against the canonical corpus, the actual token inventories are:

| Page | GP29 runes | Word dots | 13-dot token | 10-dot token | Other punctuation |
|---|---:|---:|---:|---:|---|
| p15 | 159 | 35 | 3 | 0 | 0 |
| p56 | 85 | 21 | 2 | 1 | 1 |
| p57 | 95 | 16 | 2 | 1 | 2 |

The p57 terminal 23-dot glyph is transcribed as the combined 10+13 tokens; these are transcription-token counts, not separate physical glyph counts. Both word-dot and rubric-token mappings to projective infinity have exact round trips when distinct remaining framing is retained. Neither is an authenticated mapping. A single generic punctuation token cannot reproduce the distinct source marks without supplementary framing. The literal infinity ornament has no corresponding token in the two solved controls.

### Necessary obstruction for a fixed-F projective receiver

If every position-dependent projective bijection preserves both the separator point infinity and the literal F point 0, it must be a multiplication by a nonzero field element: fixing infinity forces the lower-left matrix entry to zero, and fixing 0 forces the upper-right entry to zero. Consequently no nonzero plaintext rune can map to ciphertext F, even with an arbitrary secret state sequence. More generally this obstruction applies to any permutation fixing F, independent of the other fixed point.

The independently established p56 prime-minus-one encryption with a conditional F bypass exactly regenerates all 85 original runes and yields these five ciphertext F positions (zero-based):

| Position | Plain GP index | Prime consumed |
|---|---:|---:|
| 35 | 24 (A) | 151 |
| 47 | 10 (I) | 223 |
| 51 | 23 (D) | 239 |
| 56 | 0 (F) | none |
| 74 | 5 (C) | 373 |

Four actual consumed F collisions falsify the fixed-F bijection interpretation. A proposed visible extra escape glyph distinguishing those collisions from literal F is also absent: the original prints the same F rune in all five cases. A latent state or separate conditional bypass can escape the obstruction, but requires a decoder rule beyond the proposed symbol mapping. In particular, the established F hold is not a fixed point of every consuming permutation. This does not exclude arbitrary projective models on unknown pages or a conditional bypass external to their projective action.

The source-input reproducer [lp2_projective_extra_state_gate.cjs](../sims/lp2_projective_extra_state_gate.cjs) checks the three native inventories, reversible token mappings and authentic p56 collision pattern. No fitting on unknown ciphertext was done. The earlier [all-secret p15 projective gate](lp2-p15-infinity-projective30-allsecret-original-gate.md) already rejects its specific quadrant maps and Fibonacci-ratio cycles; the [LP1 global 30-symbol clock](lp1-mobius-full30-all-symbol-clock.md) is also negative. The new result closes the proposed unique extra-token selector, not the mathematical projective family. A new independently authenticated encoding/decoder is required before running an untouched-page inverse.

## Decision

The LP1 MOBIUS/TOTIENT/PRIMES terms plus LP2 p15's infinity symbol are a genuine cross-release clue worth preserving. They motivate P¹(F₂₉) and Möbius transformations. But the available evidence does not select a unique matrix, coefficient source, page/key schedule, operand, or recipient. The global PGL(2,29) substitution and the natural Möbius-strip pointer constructions fail independent controls or are underdetermined.

Do not continue generic Möbius, projective, or table-order sweeps. Reopen only if an independent first-party clue fixes the actual matrix/key schedule and the ciphertext object it transforms, with a locked prediction on untouched LP2 material.
