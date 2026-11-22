# P0 EPIPHANY SEEKS additive-key checksum holdout

**Agent37, 18 November 2026. Classification: independent letter-level corroboration of the source-selected p0 red-title plaintext. This does not recover the global p0 cipher.**

## Decision

The existing signed-2016 / solved-p57 navigation route selects **EPIPHANY SEEKS** for the original 13-rune red p0 title without fitting title ciphertext values. Once that plaintext prediction is frozen, the additive GP29 residues required to reproduce the actual title are:

```text
C_title = [15,8,18,3,6,19,27,0,15,26,18,21,5]
P_title = EPIPHANY SEECS
K=C-P  = [26,24,8,19,27,24,18,3,0,8,0,16,19]
```

The recovered 13-rune key object has three exact measures that independently coincide with manuscript structures already selected elsewhere:

1. **whole-key GP0 sum = 192**. Original p50 cell192 is the literal token **`00`**, the left zero of the established 192..229 zero bracket;
2. **whole-key GP-prime sum = 729 = 27²**. Original p0–p2 contain exactly **729 runes**, giving the existing natural 27×27 opening-chapter geometry;
3. **the five-rune SEECS key suffix has GP0 sum = 43**. The source-selected p50 `3D` bracket at addresses83..127 has exactly **43 strict-interior cells**.

The eight-rune EPIPHANY key prefix consequently has GP0 sum149. That remainder is algebraically determined by the first and third observations and is not counted as an independent hit.

These checks use letter values only after the plaintext phrase was already selected by the independent navigation route. They therefore supply a genuine ciphertext-level holdout for the candidate title.

## Source-family census

The authenticated 2016 clear-signed body has43 alphabetic words under the repository's established parser. It contains exactly one adjacent phrase with GP rune lengths 8 / 5:

`EPIPHANY SEEKS`.

For a broader finite control, pair every authenticated 8-rune signed word with every authenticated 5-rune signed word, without requiring adjacency. There are **eight ordered 8×5 pairs**. Derive the 13-rune additive key from the original title for each pair and require the same frozen triple:

```text
whole key GP0       = 192
whole key GP-prime  = 729
five-rune suffix GP0= 43
```

Exactly **one of eight** source pairs survives: **EPIPHANY SEEKS**.

Thus the checksum is not merely a property shared by every source phrase of the required shape.

## Fixed uniform-key calibration

As a narrow diagnostic, treat a 13-rune GP29 additive key as uniformly random over all `29^13` sequences. Exact dynamic programming gives:

- total sequences: `10,260,628,712,958,602,189`;
- sequences with GP0 sum192 and GP-prime sum729: `347,924,712,936,372`, probability about **3.39087×10⁻⁵**;
- sequences also having the fixed final-five GP0 sum43: `1,892,838,925,720`, probability about **1.84476×10⁻⁷**, roughly **1 in 5.42 million**.

This is a calibration for the frozen measurements, not an unconditional authorship probability. The measures were recognized after the navigation-selected plaintext was already available, and other possible numerological summaries were not preregistered.

## Does 729 directly generate the key?

The most direct source-motivated extraction was tested and fails.

Arrange the exact p0–p2 ciphertext stream as the natural 27×27 square. The half-turn artwork suggests pairing opposite cells. A 27-cell center row, center column or diagonal has exactly13 opposing pairs around its center, matching the 13 title-key positions. Exhaust:

- center row, center column, main diagonal and anti-diagonal;
- either orientation;
- pairwise sum, forward difference and reverse difference modulo29.

None of the 24 resulting 13-rune sequences equals the recovered title key. The best individual construction matches only one of13 positions.

Therefore 729 currently behaves as a checksum/structural corroboration, not as a demonstrated key-extraction instruction.

## Consequence

The title plaintext **EPIPHANY SEEKS** now has an independent letter-level consistency check beyond its 8 / 5 shape and source-navigation selection. The derived key simultaneously targets the p50 zero address192, the p0–p2 chapter size729 and the established 43-cell bracket interior.

That materially increases confidence in the title prediction while leaving the cipher boundary intact. A successful continuation must still explain how the author generates the exact residue sequence `[26,24,8,19,27,24,18,3,0,8,0,16,19]` from source-visible instructions or key material. The natural 27×27 center-pair extraction does not do so.

## Reproduction

Run:

`node sims/lp2_p0_epiphany_seeks_key_checksum_sft.cjs`

The SFT derives the key from the original p0 title and frozen candidate plaintext, asserts all three source links, performs the complete authenticated 8×5 source-family census, reproduces the exact dynamic-programming counts, and rejects the natural 27×27 center-pair extraction family.
