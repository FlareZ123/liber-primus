# Terminal p55–p57 and the p49–51 H/G checksum: a bounded original-source inverse decision

**15 November 2026, Agent 5. Classification: source-conditioned negative and capacity theorem. No unknown-page plaintext, cipher key or destination recovered.** The first necessary operation in this interpretation remains absent from the original manuscript.

## The specific human-visible clue and two independent interpretations

Original pp49–51 print a **32×8 = 256** two-character grid. The original terminal pages contain p55 **76** GP29 runes, p56 **85**, and clear p57 **95**, also **256**. The authentic p57 parable describes shedding circumferences; the 32×8 grid has nested ring sizes **76, 68, 60, 52**. These source observations motivate the *hypothesis* that p55 belongs on the outer ring while p56+p57 fill the inside. The first p55 rune, however, completes a p54 word, so a strictly self-contained p55 bookend has only 75 runes.

A separately established original-table property is that conventional base60 grid bytes, reduced modulo29 and interpreted as **descending GF(29) polynomial coefficients**, satisfy the four independent parity conditions defined by

- G(X)=(X−24)², which derives from the red p39 triad only under an unconfirmed polynomial convention;
- H(X)=X²+18X+11, a normalized alternative to the signed-2013 3QO-derived factor under a further unconfirmed coefficient-order convention.

The exact original grid satisfies P(24)=P'(24)=0 and P mod H=(0,0). This is an algebraic fact; neither the 2013 nor 2014 first-party material directs a reader to **apply the same four parity conditions to terminal p55–p57 runes**. This test challenges that extra assumption before promoting a mechanism.

## Exact original-input test

The [standalone CommonJS SFT](../sims/lp2_terminal256_hg_parity_sft.cjs) reads the unmodified original corpus and table JSON. It pins the exact 256-byte grid SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`, checks all four original-table syndromes are zero, and reconstructs **all 85** authentic p56 plain runes using the real consecutive-prime-minus-one cipher, including its unique literal-F bypass at zero-based index 56; the decoder strictly re-encrypts each consumed rune. The original clear p57 indices are copied without reinterpretation.

For a terminal 256-rune candidate, take the original 76 p55 **ciphertext** runes, followed by either the original p56 ciphertext or the independently recovered p56 plaintext, then all 95 actual p57 runes. Preserve every original glyph. Map each consecutive section into the four nested rings of the printed 32×8 rectangle. For each of the four corners, run clockwise or counterclockwise, using the same corner/direction convention on all rings. All eight natural orientations and both p56 registers were tested, without fitting to the syndrome.

The original **printed-order** four-syndrome vectors, in the order (P(24),P'(24),P mod H X coefficient,P mod H constant), are:

| Terminal middle register | Four-syndrome vector |
| --- | --- |
| p56 original ciphertext | (10,21,8,6) |
| p56 authentic plaintext | (8,14,28,22) |

The **eight nested-ring walks** each fail the same all-zero codeword test for **either** middle register, 16/16 nonzero syndromes. The source table itself passes (0,0,0,0) under the identical code. In the natural top-left clockwise ring walk the vectors are (18,2,4,23) with p56 ciphertext and (12,24,24,20) with p56 plaintext.

**Scope:** these failures exclude only the *direct* hypothesis that the observed p55 ciphertext participates, unchanged, as a 76-symbol outer ring of a second H/G codeword. They say nothing about a genuinely unknown **p55 plaintext** or additional cipher operation producing new terminal symbols.

## Why the parity clue cannot decrypt the 76 unknown runes

Even granting the unproven stronger model that unknown p55 **plaintext** supplies the 76 outer symbols and authentic p56/p57 plaintext supplies the 180 inner symbols, four independent homogeneous GF29 parity equations constrain at most four unknown degrees of freedom. Here the rank is exactly **four**: the p55 outer ring includes all eight top-row cells, and the first four row-major coefficient positions alone give syndrome-column determinant **13 modulo29**, which is nonzero. Consequently **29^72 distinct p55 outer plaintext assignments** satisfy the assumed parity checks with the inner 180 known symbols, for every fixed ring orientation.

This is a mathematical underdetermination independent of an English dictionary, a search budget, and a preferred key. It is not a plaintext decoder. To choose one output, a creator-authenticated *additional* operation or constraint is necessary.

## Decision and exact broken step

The text **“shed our own circumferences”** plausibly motivates a ring reading. But no first-party instruction specifies this table as receiver, tells a solver to map runes onto it, equates the printed numeral polynomial to terminal plaintext, identifies an inverse for 76 unknown GP symbols, or supplies the necessary 72 additional degrees of information. The direct unchanged-ciphertext version is rejected by the 16 original-source tests; the unknown-plaintext version is formally non-identifying. Do not broaden this route with fitted ring rotations, secret S-boxes, arbitrary polynomial extensions or postselected linguistic scores. A future independently authenticated operation would be new evidence warranting a new original-source decision.

**Reproduction:** \`node sims/lp2_terminal256_hg_parity_sft.cjs\` on Node22 from the repository; source inputs \`resources/liber-primus/lp2-corpus.json\` and \`resources/liber-primus/lp2-grid-256.json\`. Existing context: [terminal inner-code gates](lp2-terminal256-original-inner-separable-gates.md), [the original H/G construction](lp2-p50-hg-single-residue-correction.md), and [the integrated frontier](../workplace/integrated-original-inversion-challenge.md).
