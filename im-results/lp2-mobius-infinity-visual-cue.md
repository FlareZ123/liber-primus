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

A fixed 200-word English screen gives the best global transform only 21 matches among 1,717 training words (31 matched letters; 0.575% letter coverage) and 14 among 1,599 held-out words (18 matched letters; 0.365% coverage). The top-scoring transform is affine ([1,19,0,4]); the best non-affine candidate is weaker ([1,0,1,5]). The same screen recognizes 11 of 20 words in the known p57 plaintext control. This is not credible plaintext recovery; the source-motivated global projective-substitution interpretation is rejected.

### 3. p15-prime-derived four-transform construction

As a separate frozen construction, group the 16 p15 spiral primes into four consecutive quartets and use each quartet, reduced modulo 29, as a 2×2 Möbius matrix. The four determinants are 28, 9, 12, and 4, so all four transformations are invertible. Apply their inverses to the base-60 values modulo 29 in the four successive 8×8 blocks of p50, mapping the projective point at infinity to a separator.

This produces no readable text. The grouping into quartets and assignment to p50 blocks are not themselves stated by a source; the test is a natural construction, not an established key schedule.

The reproducible script sims/lp2_mobius_infinity_visual_cue_sft.cjs implements these tests from the original corpus, transcription, p50 grid, and solved-page controls.

## Decision

The LP1 MOBIUS/TOTIENT/PRIMES terms plus LP2 p15's infinity symbol are a genuine cross-release clue worth preserving. They motivate P¹(F₂₉) and Möbius transformations. But the available evidence does not select a unique matrix, coefficient source, page/key schedule, operand, or recipient. The global PGL(2,29) substitution and the natural Möbius-strip pointer constructions fail independent controls or are underdetermined.

Do not continue generic Möbius, projective, or table-order sweeps. Reopen only if an independent first-party clue fixes the actual matrix/key schedule and the ciphertext object it transforms, with a locked prediction on untouched LP2 material.
