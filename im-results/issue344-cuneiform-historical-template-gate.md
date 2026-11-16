# Issue #344: historical Babylonian numeral diagrams and the p33–39 rubric

**Decision, updated 16 November 2026:** No independently selected read direction, alphabet, positional origin or decipherment operation was found in the bounded historical numeric references inspected here. The authentic two-row manuscript motif continues to read **(17,13)₆₀ = 1033** and **(55,1)₆₀ = 3301**. The 2014 Stage10 magic squares have also been tested as direct GP29 Hill matrices and repeating Vigenère keys on p33–39; all 36 fixed readouts remain ciphertext-like. No unknown plaintext or key follows from these numeric clues.

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

**Six-header quantized-DCT extension (Agent27, 15 November 2026).** The distinct six-page repeated-header series has since also been [tested by native OpenPuff](lp2-six-identical-cuneiform-headers-native-openpuff-medium.md): 6/6 original images at original printed order, A=`33011033`, JPEG Medium 1/5, 8,080-byte source capacity, GUI `corrupted stream`, zero output. This resolves only the fixed six-cover historical-password stego branch. The exact header coefficient finding below is independent of this password-driven negative.

**Original-source DCT evidence.** The exact-raster fact was strengthened by directly reading, without re-encoding, all original quantized JPEG coefficient blocks in the first 600 pixel rows of each `51.jpg`–`56.jpg`. Each of the five comparisons against `51.jpg` has **2,150,400 exactly identical Y/Cb/Cr coefficients**, or **10,752,000 equal comparisons in total**; the reference has 48,059 nonzero luma, 25 nonzero Cb and three nonzero Cr coefficients in those compared blocks, so the all-equal result is not an empty-region artifact. All five images differ in hundreds of thousands of luma coefficient entries in the independently tested lower printed-text region. This excludes *differential quantized-coefficient marks in the repeated top-header blocks*, including invisible marks that could survive as different quantized coefficients despite visually identical pixels. It does **not** rule out a static common watermark, cryptographically keyed steganography in text or other regions, or any payload on the differently placed p33 illustration. [Original-byte libjpeg SFT](../sims/lp2_cuneiform_sixpage_header_dct_sft.c), tested on the supplied unmodified 75-image archive.

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

## Word-aware shared-header reset: original carry-aware all-secret test (Agent40, 15 November 2026)

The six identical **top** cuneiform headers on pp34–39 could tell a reader to restart one shared GP29 key at the first **complete new printed word** rather than at the first rune on the page. This avoids forcibly restarting the keystream inside two chapter-spanning words. The original source transcription fixes the page-start carry fragments **p34 two runes** (p33 ends with one rune of the same word) and **p36 two runes** (p35 ends with three runes of the same word); the other four page beginnings are whole-word starts. Thus the only first-complete-word offsets for pp34–39 are **[2,0,2,0,0,0]**, giving shared-clock stream lengths **[259,271,236,228,228,240]**. The original printed punctuation and every GP rune are preserved.

If the same *arbitrary* bijective 29-symbol alphabet is used at any common relative position after these first-word resets, an identical original ciphertext pair at that position must decode to an identical plaintext pair for **all** of the secret 29! alphabets. This key-independent collision constraint requires neither a guessed numeric key nor a source-selected additive operation. It also covers a variable-position stream of otherwise unrestricted secret bijections, as long as their relative clocks and reset map are identical on every marked page.

| Original or source-native GP29 original-shape input | Same-offset equal pairs / 3,499 | Number of independent-start windows | Windows at or below original |
| --- | ---: | ---: | ---: |
| **Original LP2 p34–39, first-complete-word reset** | **142** | 1 | reference |
| Gibran control | minimum **157**, mean 214.28 | 1,989 | **0** |
| Shakespeare control | minimum **156**, mean 211.58 | 7,011 | **0** |
| Emerson control | minimum **168**, mean 219.59 | 10,425 | **0** |

Each control preserves the *six original physical page lengths and two original carry offsets*. The three independently held native-GP reference texts use the solved-source spelling-calibrated GP29 encoder, stride31, exactly as in the older immediate-page-reset test; the 19,425 windows overlap and cannot be treated as independent statistical draws. The original ciphertext has **142/3,499 = 0.04058302**, somewhat higher than the old immediate-page-offset's **124/3,507**, yet still below every source-native window examined. An independent full **1,466/1,466-rune** positive encrypts a complete source-native passage with **one arbitrary invertible affine GP29 alphabet per position relative to the new-word boundary**, shared across the six pages. It verifies that the exact plaintext is recovered and the 3,499-pair invariant survives the encryption. The two carried prefixes use separately preserved state; this is explicitly allowed, so their unknown treatment cannot repair the 3,499 core constraints.

**Decision:** Word-aware identical-header shared-key resets are also unpromising for *ordinary unchanged printed-word source-native English*, even granting position-dependent arbitrary secret alphabets. The earlier per-physical-page immediate reset negative continues to apply to its own distinct clock. Neither test rejects separately keyed pages, secret per-page salt, a nonlinear carry-dependent evolving state, hidden key skips, alternate segmentation or an intermediate code register. Crucially, the repeated 1033/3301 numeral emblem provides **no historically authenticated rule for selecting any one of those surviving operations or obtaining its state**. The p33 art is a *footer after a two-heading prelude*, whereas the next six headings are *running top headers*, so the seven-page chapter cannot be faithfully modeled as seven interchangeable page-start resets.

[Original-input, self-contained CommonJS positive/negative SFT](../sims/lp2_cuneiform_wordaware_sharedclock_sft.cjs); exact original and all 19,425 control counts were also independently executed in the tool JavaScript runtime before committing the SFT. This is a bounded architectural exclusion, **not recovered unknown plaintext or a historical encryption instruction**.

## 2014 Stage10 magic squares as direct GP29 keys (Agent38, 16 November 2026)

**Human-solve-path motivation.** The recovered 2014 OpenPuff payload contains three matrices in the order 5×5 / magic sum 3301, 7×7 / magic sum 1033, and 5×5 / magic sum 1033. The contemporaneous Stage10 form preserved in the repository labels its three inputs with those same order/sum pairs. LP2 p33–39 is a seven-page chapter carrying the repeated 1033/3301 cuneiform motif and exactly 1,680 runes; 1,680 is divisible by both 5 and 7. A solver who recognized the historical square values could reasonably try them as direct cipher keys over the 29-symbol GP alphabet.

**Frozen Hill operation.** Each matrix was reduced entrywise modulo 29. The entire p33–39 stream was processed continuously in fixed blocks of the matrix order, with no padding, page reset, phase, or fitted offset. For each square, the four conventional interpretations were tested: inverse-matrix decryption with column vectors, inverse-matrix decryption with row vectors, and the two corresponding direct-matrix readouts (if the printed square itself were the decoder). All three matrices are invertible modulo 29: determinants are 10, 2, and 3 respectively. Exact chapter-length planted vectors round-trip through every matrix/inverse pair in both row and column layouts.

| Historical square | det mod 29 | K⁻¹C (column) | CK⁻¹ (row) | KC (column) | CK (row) |
|---|---:|---:|---:|---:|---:|
| 5×5 / 3301 | 10 | 0.03439264 | 0.03444936 | 0.03467980 | 0.03428912 |
| 7×7 / 1033 | 2 | 0.03467483 | 0.03442738 | 0.03418063 | 0.03447985 |
| 5×5 / 1033 | 3 | 0.03452239 | 0.03439051 | 0.03434088 | 0.03446071 |

**Frozen repeating-key operation.** Each square was also flattened row-major and column-major as a repeating GP29 Vigenère key. Two direct number encodings were used: entrywise reduction modulo 29 (key lengths 25, 49, 25) and fixed-width base-29 digit expansion (widths 3, 2, 2; key lengths 75, 98, 50). Both subtraction and addition readouts were tested continuously across p33–39, without F-skip, reset, or fitted offset. The 24 outputs are summarized below.

| Historical square | Repeating-key lengths | IoC range across four readouts | Maximum single-rune count |
|---|---:|---:|---:|
| 5×5 / 3301 | 25, 75 | 0.03418489–0.03472447 | 68–81 |
| 7×7 / 1033 | 49, 98 | 0.03434939–0.03474928 | 69–78 |
| 5×5 / 1033 | 25, 50 | 0.03431819–0.03465782 | 69–85 |

The untouched 1,680-rune chapter has IoC **0.03436002** and a maximum single-rune count of 71. Across all **36** Hill and repeating-Vigenère readouts, IoC remains **0.03418063–0.03474928**; none develops the concentration expected of ordinary GP29 English or readable text. The 95-rune clear p57 reference has IoC 0.06270997 (a short within-manuscript sanity reference, not a calibrated language null).

**Decision and limits.** Retire only the direct continuous GP29 Hill and repeating-Vigenère transfers of these three historical matrices to p33–39. The historical form asks participants to submit magic squares; it does not say to use them as Hill matrices or Vigenère keys, does not specify modulo 29 or base-29 digit expansion, and does not define an LP2 receiver. This negative does not rule out a different matrix operation, a separate key, another section, or a non-GP intermediate register. No unknown plaintext, key, or final destination was recovered.

Reproducer: [lp2_2014_magic_square_hill_gate.cjs](../sims/lp2_2014_magic_square_hill_gate.cjs). Source inputs: [recovered 2014 magic squares](../resources/cicada2014-openpuff-magic-squares.txt), [historical Stage10 form and response witness](../resources/external/cicada2014-onion6-magic-form-and-response.json), and [canonical LP2 rune corpus](../resources/liber-primus/lp2-corpus.json).

## Bounded result and next decision

No independent pre-2014 source examined above offers a unique graphic/caption match with an additional explicit decoding rule. This is a **bounded search**, not a proof that no original diagram or mathematical procedure exists elsewhere. Following the issue's gate, retire **these conventional historical templates and the direct 2014 magic-square Hill/Vigenère transfers as direct decoders**. Preserve the 1033/3301 source arithmetic as a verified clue and demand a new external instruction specifying exact original input and reversible operation before opening dependent rune-key work. Generic prime/phase/radix sweeps on the same two values have already been investigated elsewhere and are outside this issue.

The [source-aligned p33–39 page and title partition](../workplace/lp2-section-clock-ambiguity.md) remains the canonical input to any later, genuinely distinct route.
