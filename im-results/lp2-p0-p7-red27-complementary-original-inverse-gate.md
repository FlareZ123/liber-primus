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
| Original unchanged | 0.0343633 | 0.0341017 |
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

## C. All-secret period-27 alphabet exclusion on the original opening chapter

The 27×27 shape supplies a stronger **key-independent necessary condition** than any guessed red27 key. Suppose the 729 original GP29 runes were generated from ordinary original-language plaintext by **any deterministic, fixed bijection for each of the 27 cyclic columns** (equivalently: an arbitrary secret substitution alphabet in each phase, including the entire unknown-key period27 additive/Vigenère family). Within one column, any two source symbols are equal **if and only if** the corresponding plaintext symbols are equal, regardless of which of the 29! possible secret permutations was used. Thus aggregate same-column equal pairs from original ciphertext can directly discriminate this entire mechanism family without knowing any key or plaintext.

Three page-boundary/marker-origin conventions are independently physically plausible. All are held fixed; no secret key, language score, plaintext crib, phase search or hand-tuned permutation is involved. For each convention, the SFT compares every original same-column equal-symbol pair against *matched-length consecutive windows* from a previously solved LP1 reference encoded with the same canonical GP29 tokens. Its positive fixture generates a distinct random **secret 29-symbol bijection for each phase**, encrypts solved native material, inverts each permutation exactly, and preserves the collision invariant.

| Source-selected phase clock | Original collision pairs | Rate | Solved LP1 windows | Lowest native rate | Native windows at or below original |
| --- | ---: | ---: | ---: | ---: | ---: |
| Continuous 729-rune opening p0–p2, origin at p0 start | 326 / 9,477 | **0.0343991** | 2,559 | 0.0552918 | **0** |
| Reset the phase at each original physical page p0/p1/p2 | 298 / 9,493 | **0.0313916** | 2,559 | 0.0562520 | **0** |
| Exclude p0 red13 at its original dot marker, then reset at each physical page | 282 / 9,149 | **0.0308230** | 2,572 | 0.0539950 | **0** |

The 29-symbol uniform expectation is **0.0344828**; expected natural GP29 English same-phase collision rates are substantially higher, with continuous-clock solved-LP1 mean **0.0597218** and 5th/50th/95th-percentile rates **[0.0562414,0.0595125,0.0637332]**. In the original 729-runic square, source runes collide at effectively the uniform rate **even after the plaintext-relevant common column position is controlled**, contradicting direct native-English input under any fixed phase-bijection. This is an **all-secret family exclusion**, materially stronger than the finite Trifid/Vigenère negative tests.

**Historically motivated nonconsuming-F clock:** Solved p56 preserves literal `F` (GP index0), so a fixed phase cipher could advance its 27-symbol key clock only on non-F symbols while leaving F visible. Under that more permissive but still source-visible hypothesis, each phase is an arbitrary unknown bijection of the **28 non-F symbols**, and all F observations are omitted from collision comparisons. Four exact original-body tests are again key-independent and negative:

| Literal-F no-clock convention | Original same-phase pairs | Original rate | Solved native windows | Smallest control rate | Controls at or below source |
| --- | ---: | ---: | ---: | ---: | ---: |
| Entire p0–p2 chapter continuous | 292 / 8,600 | 0.0339535 | 2,559 | 0.0555739 | **0** |
| Physical-page reset p0/p1/p2 | 277 / 8,615 | 0.0321532 | 2,559 | 0.0575193 | **0** |
| Exclude red13; continuous from marker | 287 / 8,300 | 0.0345783 | 2,572 | 0.0553143 | **0** |
| Exclude red13; page resets | 272 / 8,312 | 0.0327238 | 2,572 | 0.0565331 | **0** |

The SFT additionally plants all **28!**-possible-per-phase-type *family* by constructing a distinct arbitrary secret non-F permutation in each of the 27 phases, preserving F literally, and verifies exact forward/inverse recovery and unchanged same-phase collision counts in every clock. These are eight independent original-clock variants covering fixed-period27 alphabets with and without literal transparent F. The author still might use a ciphertext-dependent F skip, other variable transformations or a hidden compressed stage. [Windows PASS, F-skip extension](https://github.com/FlareZ123/liber-primus/actions/runs/44948583365).

**Limit:** The controls come from one editor-normalized known LP1 work and overlapping windows, so the 0/N statements are exact empirical control counts, **not** globally calibrated probabilities. The invariant is destroyed by a genuinely stateful cipher, per-symbol changing alphabets, nonbijective transformations, ciphertext-dependent skips, additional transposition mixing column positions, or an independent encrypted/compressed plaintext layer. It does not preclude those. It also does not imply the red13+red14 combined key was intended: the grid itself suffices to derive this negative.

## Decision

The **counts** 13+14=27 and 262+266+201=729 are reproducible; these tests supply no authorial instruction for combining distant red headings, no complete intrinsic 27-cell alphabet, and no original ciphertext body decoder. In addition to the bounded Trifid and lag27 autokey negatives, the complete period27 fixed-bijection family is excluded for all three original-source clock conventions independently of any secret key. No supplied clue selects a nonperiodic stateful operation or original-body inverse; do not expand the 27-symbol coincidence with arbitrary fillers, secret keys or speculative clocks. Return to the human-visible body operation or externally retained key if one is independently selected.

**SFT:** [Windows Node22 CommonJS](../sims/lp2_p0_p7_red27_trifid_gate_sft.cjs). **Executed source-native CI PASS:** [44948583365](https://github.com/FlareZ123/liber-primus/actions/runs/44948583365). The SFT validates exact original GP29 inputs, positive controls, all reversible inverses, source title replay, and original outputs.
