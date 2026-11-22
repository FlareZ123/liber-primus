# P0 nine-row 13-dot glyph: exhaustive GF29 order-nine original-word gate

**22 November 2026, Agent 1. Conditional negative; zero unknown plaintext.** Exhaustively evaluated **20,511,149** homogeneous order-nine GF29 recurrences agreeing with the hypothetical 13-rune p0 red-heading plaintext. **Zero** simultaneously decrypt p0's *first four untouched black words* into GP-native English words in the fixed reference lexicon. An independent encrypted native-word plant with a genuine plaintext F skip passes the same test. [Windows Node22 PASS run 45067510134](https://github.com/FlareZ123/liber-primus/actions/runs/45067510134) · [complete read-only CommonJS SFT](../sims/lp2_p0_red13_dot9_lfsr9_word4_crib_sft.cjs).

## Original clue and precise hypothesis

Original p0 scan 17.jpg has eight then five red heading runes and a recurrent *thirteen-dot* red punctuation motif. This motif occupies a regular **nine-row, three-column checkerboard**:

~~~text
010
101
010
101
010
101
010
101
010
~~~

Its nine rows are one possible cue for a ninth-order recurrence. The motif occurs elsewhere as punctuation; **the author never explicitly identifies it as a recurrence**. The signed first-party 2016 phrase **EPIPHANY SEEKS** provides a separate *candidate*, unproven plaintext for p0's 8+5 red heading. In the source's native GP29 orthography it is EPIPHANY SEECS. Comparing with the unmodified original red ciphertext fixes the tentative additive key:

~~~text
title-cipher [15, 8,18, 3, 6,19,27, 0,15,26,18,21, 5]
title-plain  [18,13,10,13, 8,24, 9,26,15,18,18, 5,15]
title-key    [26,24, 8,19,27,24,18, 3, 0, 8, 0,16,19]
~~~

The first four *physically printed black words* after the title have native GP lengths **[4,3,3,11]**, occupy p0 offsets **13–33**, and retain every original rune. The second begins with ciphertext F at offset17, with no further F until offset58. Under a known solved-page convention, a source F can be literal plaintext F without advancing a key or the result of adding a key to non-F plaintext. Both alternatives are screened.

## Complete original cipher search

For every title-consistent order-nine homogeneous GF29 recurrence, compute

~~~text
K[t] = a1*K[t−1] + a2*K[t−2] + ... + a9*K[t−9] (mod 29).
~~~

The fixed thirteen title values impose **four independent linear constraints** on nine coefficients at t=9–12, leaving exactly **29^5 = 20,511,149** possible coefficient vectors. The SFT computes the GF29 reduced-echelon parameterization and exhaustively enumerates all of them. Decryption is P=C−K mod29 at nonliteral-F positions. No key, phase, word, sign or alphabet is fitted to actual prose. The source's unchanged printed breaks delimit the four words, and a prespecified GP-native English lexicon, resources/control/english_wordfreq_textblob.txt, is used consistently. That lexicon handles the manuscript's conventional GP multigraphs and the established ING/IO variant.

| Original p0 word prefix accepted | Candidate coefficient vectors or legal F branches |
| --- | ---: |
| Title 13 GP runes | **20,511,149** |
| First black word (4 runes) | **55,999** |
| First two black words (4+3 runes) | **3,867** |
| First three black words (4+3+3 runes) | **103** |
| First four black words (4+3+3+11 runes) | **0** |

The key-source assumption is not verified; this is a high-power **conditional word-register** rejection. The native GP positive enciphers **TIME FOR ALL ENCOUNTERED**, using the exact source word lengths [4,3,3,11] under an independently fixed title-compatible recurrence, with the F in FOR explicitly bypassing the key clock. The identical decoder accepts the plant and identifies the proper F branch. This controls the full word-grammar and interruption implementation.

## Decision

No tested recurrence yields the four source word lengths as recognizable GP-English. **Close this specific ninth-order stationary additive, fixed-title, literal-F model**. The existing lower-order title-recurrence experiment separately excluded orders1–8, with a different full-page test ([earlier report](lp2-p0-epiphany-title-allsecret-gf29-lfsr8-gate.md)). Do not extend to free higher orders without an independently selected new cipher operation or real plaintext.

The conclusion does **not** exclude a language or word outside the fixed lexicon, a different meaning of the red heading, a changing recurrence, a non-GP plaintext, hidden changes to the source word breaks, or a separate layer. The motif itself does not provide an authenticated cipher instruction. **No unknown LP2 text, genuine author key, or destination was found.**
