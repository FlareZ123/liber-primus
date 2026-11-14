# Issue #344: historical Babylonian numeral diagrams and the p33–39 rubric

**Decision, 11 November 2026:** No independently selected read direction, alphabet, positional origin or decipherment operation was found in the bounded pre-2014 numeric references inspected here. The authentic two-row manuscript motif continues to read **(17,13)₆₀ = 1033** and **(55,1)₆₀ = 3301**, and those values are already established. No unknown plaintext or key follows from this inspection.

## Primary visual and historic evidence

The original LP2 `50.jpg`/p33, `51.jpg`/p34 and repeated p35–39 images provide the same distinctive two-line cuneiform-like motif, with left-to-right two-place groupings. The position-wise four signs are **17, 13, 55 and 1**. The exact p34 crop was read in original 2400×3600 JPEG pixels, without substituting a standardized font or relying on a new transliteration.

Dated pre-2014 comparators examined:

- [MacTutor, *Babylonian numerals*](https://mathshistory.st-andrews.ac.uk/HistTopics/Babylonian_numerals/), source published circa 2000. It explicitly explains the two signs for units and tens, additive construction within a sexagesimal digit, and the ordinary left-to-right positional convention. It also warns that **absolute scale/zero and radix-point placements were historically ambiguous** without context. It supplies no special operation on ciphertext.
- [Wikimedia Commons, *Babylonian numerals.jpg*](https://commons.wikimedia.org/wiki/File:Babylonian_numerals.jpg), uploaded 29 September 2003 (2004 surviving file history), a public-domain 1–59 numeral chart, and [the derivative SVG](https://commons.wikimedia.org/wiki/File:Babylonian_numerals.svg), dated 28–29 March 2010. These show a **standard visual family** of separately drawn tens chevrons and unit wedges. The same standard motifs can be drawn in different stroke shapes. We did **not establish an exact pixel template or authorial reuse** from either chart.
- [St Lawrence University, *Cuneiform numbers*](https://myslu.stlawu.edu/~dmel/mesomath/Numbers.html), an older educational chart demonstrating the same units/tens convention; no ciphertext operation.
- [Christine Proust, *Numerical and Metrological Graphemes: From Cuneiform to Transliteration*](https://cdli.earth/articles/cdlj/2009-1), published 22 June 2009; discusses metrological and numerical systems rather than a puzzle key. Its multiple sign-value contexts reinforce the need for an externally selected interpretation.

The only convention simultaneously fixed by the manuscript's own two rows and the historical sources is **ordinary left-to-right base-60 integer reading**. Under that rule the rows deliberately spell the already-known 1033 and 3301. These numbers are related by reversal in decimal, but the original text provides no selector telling a human how to apply that reversal to an unknown rune sequence, whether to reverse a byte key, or whether to use either value as a modulus, seed, offset, clock or plaintext.

## Six printed copies of the same source header: exact-raster and keyless cipher constraint (Agent 50, 14 November 2026)

The cuneiform-bearing **LP2 pp34–39** (archive JPEGs `51.jpg`–`56.jpg`) preserve the same cuneiform diagram at exactly the same pixel coordinates. This is stronger than similar drawing style: after decoding all six unchanged 2400×3600 JPEGs as RGB, their **entire first 600 rows across all 2400 columns** are **byte-for-byte identical**, SHA-256 of the RGB bytes `cd4eae89c89cab3e011e3fadc5742dff6d5baa8b94b014f0f11e4e6bbf680a32`. The isolated central glyph crop at rows 140–579 and columns 850–1599 is also identical, SHA-256 `9c64bdc85376cfd093e847e7883621a06ff2df4e1f118f9d555644b342c1d403`. The p33 introduction (archive `50.jpg`) has **different** pixels/placement and is excluded from this six-way result. A distinct, differently marked tiny cuneiform header in one of pp34–39 is therefore unavailable as a source-selected per-page bit, selector, or instruction. This says nothing about nonvisual keyed JPEG payloads.

**Cipher consequence motivated by identical keys, rather than inferred from style.** If a human took the repeated image to supply **one shared position-indexed reversible GP29 substitution clock**, reset to local position zero at the start of each of those six physical page text streams, then for *every* local offset present on two or more pages, any two matching printed ciphertext runes must also have matching plaintext runes. This equality invariant survives **all independently secret per-position 29! alphabet permutations**, including arbitrary nonadditive mappings. It requires no guess about the original artwork's content or the hidden substitution keys.

On the original `resources/liber-primus/lp2-corpus.json` pages **34–39**, the six rune lengths are **[261,271,238,228,228,240]**, total **1,466**. Counting all same-offset cross-page pairs yields exactly **124 matching rune pairs in 3,507 eligible pairs**, or **0.03535785572**. A source-native GP29-English positive would require substantially more same-position matches. Using the already pinned Gibran, Shakespeare and Emerson corpora, encode their English with the solved-LP1-calibrated GP29 spellings. In each, take every 31st consecutive **1,466-rune** source window and repartition it into precisely the six original printed-page lengths, with the same equality test:

| Native GP reference | Distinct scanned offsets (overlapping) | Minimum same-offset equal pairs | Windows at or below original 124 |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | **1,989** | **164** | **0** |
| Shakespeare source sample | **7,011** | **158** | **0** |
| Emerson essays | **10,425** | **168** | **0** |
| **Original p34–39 ciphertext** | **1** | **124** | |

This is **19,425 overlapping source windows**, not 19,425 statistically independent trials. A real 1,466-symbol native-GP Gibran plant encrypted under **271 completely independent position-specific affine bijections**, shared across all six pages and varying at every column, recovers all **1,466 original source symbols** on exact inverse and preserves the same-offset equality count exactly. Thus granting arbitrary position-specific secret substitution mappings cannot increase the original's cross-page 124 equalities toward any of the three native reference ranges.

**Decision:** The original repeated artwork selects a plausible *equal source key* hypothesis, but the real six text streams strongly contradict **the fixed, physically page-reset, same-local-offset bijective GP29 cipher with ordinary source-native English under the three finite controls**. Retire attempts to guess the key of such a shared-clock architecture from the reused art. This is conditional; no LP2 plaintext/key is recovered, and key state advancing continuously through pages, per-page salts, changing offsets, word-dependent ciphers, transposition or a non-native plaintext register are beyond the test. The cuneiform motif does not itself command a reset or any substitution alphabet. A source-original instruction choosing one of the surviving mechanisms is still required.

[Read-only complete CommonJS reproducer](../sims/lp2_cuneiform_sixpage_sharedclock_keyless_sft.cjs) recomputes all source and control counts with exact positive inverse. Source RGB pixels were directly hashed from the original JPEG archive in the local Python/Pillow runtime; no manuscript transcriptions were modified.

## Bounded result and next decision

No independent pre-2014 source examined above offers a unique graphic/caption match with an additional explicit decoding rule. This is a **bounded search**, not a proof that no original diagram or mathematical procedure exists elsewhere. Following the issue's gate, retire **these conventional historical templates as a direct decoder**. Preserve the 1033/3301 source arithmetic as a verified clue and demand a new external instruction specifying exact original input and reversible operation before opening dependent rune-key work. Generic prime/phase/radix sweeps on the same two values have already been investigated elsewhere and are outside this issue.

The [source-aligned p33–39 page and title partition](../workplace/lp2-section-clock-ambiguity.md) remains the canonical input to any later, genuinely distinct route.
