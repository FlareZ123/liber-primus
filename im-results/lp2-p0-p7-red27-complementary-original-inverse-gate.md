# Complementary red13/red14 as a 27-symbol opening-key candidate: bounded original negative

**21 November 2026, Agent2. Evidence class: exact original-corpus geometry and source-locked candidate cipher inverses; no recovered unknown plaintext.** The finite tests below were motivated by physical red-title/colophon lengths. They do **not** imply the author combined two different original illustrated chapters, that the red runs form a permutation alphabet, or that the red title has been independently solved.

## Original-source premise

Physical LP2 p0 has **13** red heading runes before a large 13-dot marker; p7 has **14** terminal red runes in five words adjacent to its five-dot stencil. The first illustrated visual unit p0–p2 contains **262 + 266 + 201 = 729 = 27²** GP29 runes, of which **13** are p0 red and **716** are black. Thus the combined original p0+p7 red lengths are exactly **13+14 =27**. These are genuine counts. **No original mark connects the p0 heading to p7's separate chapter-ending colophon** as a key, and the specific joint-27 construction was proposed after knowing the 729 factorization.

Original p0 red GP29 indices:
`[15,8,18,3,6,19,27,0,15,26,18,21,5]`.

Original p7 red GP29 indices:
`[23,3,22,16,2,25,5,7,11,14,28,6,28,19]`.

The concatenation is 27 values but contains repeats. Removing F=0 and EA=28 leaves only **18 distinct** core values, so the red runes are **not themselves a complete 27-symbol cipher alphabet**; any 27-cell key requires a rule for nine absent symbols.

## A. Bounded keyed 27-cell Trifid inverse

One fully specified artificial completion appends the absent canonical GP indices1..27 after the first occurrences of the source red values. It keeps F=0 and EA=28 literal and nonconsuming, a hypothesis borrowed from known solved-page behavior for F and an otherwise unfixed extra symbol. Classical 27-cell Trifid digit fractionation is applied at period27, both forward and inverse, with the black p0–p2 body consumed either continuously from offset13 or with physical-page clock resets. This tests **four frozen mechanisms**. The code asserts exact forward reconstruction and a solved-page planted positive.

| Original 249-rune p0 black body | GP29 IoC | Full 716-body IoC |
| --- | ---: | ---: |
| Original unchanged | 0.0343633 | 0.03410 approx |
| Trifid inverse, continuous | 0.0367923 | 0.0345275 |
| Trifid forward, continuous | 0.0355616 | 0.0346759 |
| Trifid inverse, page reset | 0.0371486 | 0.0349494 |
| Trifid forward, page reset | 0.0356912 | 0.0348791 |

All four outputs are nonprose despite exact reversible implementations. The independently solved p57 has IoC **0.0627100** in the same encoding. These observations reject only this specific key completion and 27-step Trifid clock family, not every ternary block cipher.

## B. Exact red27 repeating key and lag-27 historical autokey

For a second, separate candidate, use the *earlier retrospective* p0 title residual from the signed-text target `EPIPHANYSEECS`:
`[26,24,8,19,27,24,18,3,0,8,0,16,19]`,
followed by p7's 14 original indices. This is a complete 27-rune GP29 key. The first 13 symbols are **plaintext-target-derived**, not independently authenticated key material. Therefore, reconstructing the 13-rune p0 title under subtractive Vigenère is a tautological positive control.

The fixed repeated27 Vigenère decrypts those red13 symbols but yields **716-body IoC 0.0340118** with no plausible contiguous original plaintext. A more historical source-conditioned family lets the 27-rune initial key continue via plaintext or ciphertext feedback at lag27, with both additive signs. All four full 729-rune original variants invert exactly and pass native-GP solved-page planted controls.

| Lag-27 body feedback | Sign for C ± K | 716-body GP29 IoC |
| --- | --- | ---: |
| plaintext | minus | 0.0345236 |
| plaintext | plus | 0.0346056 |
| ciphertext | minus | 0.0341720 |
| ciphertext | plus | 0.0340665 |

None reaches readable English; the outputs remain ciphertext-like. The occasional GP-native digraphs are expected under a 29-symbol near-uniform string and were not fitted or interpreted as new plaintext.

## Decision

The **counts** 13+14=27 and 262+266+201=729 are reproducible; these tests supply no authorial instruction for combining distant red headings, no complete intrinsic 27-cell alphabet, and no original ciphertext body decoder. The present Trifid, repeated-pad, and lag27 plaintext/ciphertext autokey hypotheses have exact, read-only negative original tests and should not be expanded by unconstrained filler alphabets, clocks, or secret-key fitting. Return to the human-visible body operation or externally retained key if one is independently selected.

**SFT:** [Windows Node22 CommonJS](../sims/lp2_p0_p7_red27_trifid_gate_sft.cjs). **Executed CI PASS:** [44946606395](https://github.com/FlareZ123/liber-primus/actions/runs/44946606395). The SFT validates exact original GP29 inputs, positive controls, all reversible inverses, source title replay, and original outputs.
