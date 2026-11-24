# Original-source gate: additive pair streams in the two order-840 GF(29²) fields

**Status: bounded negative; no unknown plaintext or key recovered.** This is an intermediate result, not an established decryption.

## Why this operation was worth testing

Two independent original-source constructions give primitive order-840 elements in quadratic extensions of GF(29):

1. The signed 2013 BASE29(3301) values [3,26,24] define the H quadratic, with α² = 11α + 18. The source-fixed element α has order 840. See [the 2013/2014 spectral source relation](lp2-2014-3301-square-base29-spectral-original-gate.md).
2. The p3 red quadratic u² = 3u + 8 has the source-derived primitive element g = 19 + 13u, also of order 840. See [the p3-red order-840 field analysis](lp2-gf841-period840-source-clock-two-inverses.md).

The original p33–39 cuneiform chapter contains exactly 1,680 runes: 840 adjacent pairs. This makes a two-rune additive stream a compact, source-motivated receiver to test. Earlier work had tested scalar recurrences and pairwise multiplication/division, but not this direct additive operation.

The missing premise remains important: no first-party Cicada instruction says to pair adjacent runes as GF(29²) elements or to add a primitive-element stream. The test therefore evaluates a plausible mathematical consumer, not an authenticated author instruction.

## Frozen operation and search

For an adjacent ciphertext pair Cⱼ = c₀ + c₁α, test plaintext pair

Pⱼ = Cⱼ − g^(phase ± j)

in the relevant source-derived quadratic field.

The finite search covers:

- Both source-derived fields (H2013 and p3-red).
- The primitive generator and its Frobenius-conjugate root.
- All 840 starting phases.
- Forward and reverse exponent direction.
- Normal and swapped coefficient order.
- Three source-natural pair framings: page-reset clock, page-continuous clock with page-local pairs, and global pairs crossing page boundaries.

The additive sign does not require a second search: for every primitive order-840 generator, g^420 = −1, so adding the stream is exactly subtracting it at phase+420. Fixing subtraction and enumerating all 840 phases covers both signs without duplication.

This yields **40,320 parameter configurations**. No key, language-selected phase, or fitted offset is introduced. On page-local framings, an odd terminal rune remains unchanged; global pairing instead pairs continuously across physical page boundaries.

## Results on the untouched original chapter

| Measure | Result |
|---|---:|
| Original p33–39 rune count | 1,680 |
| Original index of coincidence | 0.03436002 |
| Configurations evaluated | 40,320 |
| Lowest candidate IoC | 0.03403174 |
| Median candidate IoC | 0.03447063 |
| Best candidate IoC | 0.03547747 |
| Solved p57 GP29 plaintext reference IoC | 0.06270997 |

The best configuration is the p3-red field, conjugate root, forward clock, global pair framing, swapped coefficient order, phase 372. Its output begins:

> AE NG OE F X M EA U B AE D X D O S H H B EA W P N C G I I O EO W W S G X G X S T EO P J R A B H EA C OE EO S NG G H L T C G H G I N EO O T C H M Y T D TH J AE J N M R I EA OE G H B T O OE M R H E A NG L C A IA W C D EA D

It is not coherent GP29 English. The maximum IoC remains close to the uniform 29-symbol baseline and far below the known solved-p57 plaintext reference.

A supplementary 32-variant phase-zero screen of the full 12,956-rune p0–55 stream under the H2013 field also remains nonlinguistic (IoC range 0.03443382–0.03452363). One variant happens to begin with the three rune tokens THE, but p0's first printed word has eight runes and the complete transformed word is THERAUOED; this is not a word-level plaintext hit.

The standalone script includes 16 synthetic positive controls: encryption and inverse recovery pass exactly for both fields, both roots, both exponent directions and both coefficient orientations.

## Decision

Reject this direct additive GF(29²) pair-stream family for the source-linked p33–39 chapter. The complete 840-phase search removes the starting-phase uncertainty for these two source-derived fields and the stated pair framings. Do not continue tuning phases, pair offsets or coefficient conventions for this same operation.

This does **not** rule out every possible GF(29²) cipher, other stateful or nonlinear pair operations, another source-selected key, variable-length coding, or non-GP29 plaintext. The historical algebraic relationship is real; the attempted decryption operation is not authenticated.

## Reproduction

Run on Node 22:

    node sims/lp2_gf841_additive_pair_clock_sft.cjs

The script reads the canonical original rune corpus, verifies both field generators and their order, enumerates the complete finite candidate family, checks the full-book supplementary screen, and runs exact synthetic encrypt/decrypt controls. The manual workflow file is .github/workflows/agent1-gf841-additive-pair-gate.yml.
