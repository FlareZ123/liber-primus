# Full original LP2 wordwise BASE29→GP30 transformation: reversible SPACE recovery fails

**Agent34 · Director #2278 · 22 November 2026. Classification:** one complete 2014-executable, word-boundary-sensitive, rune-value-changing and plaintext-space-generating transducer. Exact source-wide inverse succeeds in reconstituting all 12,956 original GP runes and original divider tape, but the derived plaintext-like output is uniformly distributed with only 329 explicit SPACE symbols. An exact **all-secret per-physical-page 30-symbol alphabet bound** caps plaintext spaces at 767 / 12,956 even if every page has an arbitrary secret substitution key. No recovered LP2 plaintext, historical creator key or destination.

## Source clue and decisive historical assumption

Signed 2013 Cicada protocol gave an actual numeral-base operation, \`BASE29 3301 → 3QO\`. The manuscript's GP alphabet has 29 rune tokens and its *printed word boundaries* form a real second symbol class; GP29 plus SPACE is therefore the natural explicit 30-token alphabet if a 2014-executable numeric encoder was intended to hide true word spaces inside ciphertext rune words. The authenticated 2016 imperative describes the manuscript's words as a map and numbers as direction, consistent with using the printed complete word as the numeral unit.

**Author selection remains unproven:** neither the original manuscript nor the historical protocol says to convert original rune words from base29 to base30, to preserve their original widths as side information, or to interpret the 30th digit as plaintext SPACE. This is the experiment's weak premise, frozen *without* a language-selected key or output phase. Its rival is an external high-entropy per-rune key with actual plaintext spaces preserved in the original layout.

One wordwise base conversion is distinct from previous stationary SPACE prefix codes, 5×6 coordinate fractionation, and the elaborate BASE29 boundary-rank Feistel. It has no invented digest, key stream, fitted word break or numerical-search parameter.

## Complete, exactly reversible transducer

Work across the **entire unmodified source transcript** \`resources/lp2-transcription.txt\`. Preserve source punctuation and physical line, page and chapter markers exactly in an out-of-band frame. Combine rune fragments across line and page turns into their **2,896 authentic complete printed words**, holding each source word's exact rune length \`m\` as the public framing sidecar.

For each word with original GP rune indices \`c[0..m−1]\`, evaluate the *whole unsigned numeral* \`V = Σ c[i]·29^(m−1−i)\` (ordinary big-endian positional BASE29). Convert that same integer to **exactly m base30 digits**, left-padding with zero digits when needed. Since \`29^m ≤ 30^m\`, conversion always fits. Output GP30 symbols 0..28 as ordinary runes and 29 as a newly recovered SPACE. The actual original printed spaces do not automatically appear as plaintext spaces.

The inverse reads exactly the original m-digit block length from the preserved source frame, converts each GP30 base30 block back to m BASE29 runes (rejecting any impossible block \`V≥29^m\`), and writes these indices into the original rune positions. Thus it also reproduces all punctuation/line/page metadata **byte for byte**. Original interpage words are complete integer blocks: this matters for 32 true page-crossing words. The source contains **83** one-rune and **448** two-rune complete words, all handled in place; one-rune blocks cannot generate a new SPACE because their digit is <29.

The [Windows Node22 CommonJS SFT](../sims/lp2_wordspace_base29_to30_original_sft.cjs) asserts the entire untouched 12,956-rune source exactly equals independent \`lp2-corpus.json\` indices after parsing, and asserts all 2,896 word lengths, 32 page carries and one-/two-rune counts. Every converted word is exactly inverted, followed by byte-for-byte full original transcription reconstruction. No other source operand is needed.

## Actual original output and heldout decision

The transformed entire source begins \`EO U | C B H L A P IA F TH NG TH R L EA F J J O TH Y G ...\`, where \`|\` is the derived GP30 SPACE. This is an unsegmented, nonlinguistic stream.

| Exact unchanged original receiver | GP30 total tokens | Derived SPACE digits | SPACE fraction | Non-SPACE native GP29 IoC |
| --- | ---: | ---: | ---: | ---: |
| Complete p0–55 original | **12,956** | **329** | **2.5394%** | **0.03456361899** |
| Frozen p16–21 full original | **1,613** | **42** | **2.6038%** | **0.03461951696** |
| Independently withheld p40–53 full original | **3,008** | **66** | **2.1941%** | **0.03454708982** |

Actual solved p57 contains 95 native GP runes and 19 internal spaces among 114 GP30 tokens (**16.6667% SPACE**) and its **rune-only** IoC is **0.06270997**. A second original, genuinely clear **755-rune LP1** native register assembled from first-release source sections 8–11 has 181 intact words and 180 internal spaces among 935 tokens (**19.2513%**). The candidate original output is far outside both source-native scales and its GP runes remain uniform-like.

## Exact all-secret substitution obstruction

A hypothetical secret postconversion substitution alphabet could rename the GP30 token \`29\`, including SPACE, to any source symbol. Grant a maximally permissive independent, arbitrary **30! permutation for each physical source page**. The number of derived SPACEs on any page is then bounded **exactly** by the frequency of that page's most frequent output symbol, regardless of the unknown permutation.

Across all **55 rune-bearing original pages** (plus p50's zero-rune physical position), the sum of these per-page maxima is **767 symbols / 12,956 = 5.9200370%**. This is a tight upper bound when every page can select its own key, many orders of magnitude more key freedom than a single alphabet or a Vigenère shift. A single whole-book secret alphabet permits at most the full-stream maximum **480 / 12,956 = 3.70485%**, whereas the literal unkeyed SPACE output has 329.

Therefore no choice of **stationary, page-specific** secret substitutions after this exact wordwise radix conversion can yield a GP30 text with the native SPACE fractions of either independent solved reference, regardless of later re-spacing that does not alter token values. The impossibility is conditional on requiring ordinary native-GP prose with comparable plaintext space density, **not** a general cryptographic nonexistence theorem. Dynamic secret alphabets, length-changing compression or side information outside the printed layout can evade it, but those would need a separate original author clue.

## Positive controls, limitations and next decision

The exact original input recovers all **2,896/2,896 words**, **12,956/12,956 runes**, all **32/32** true cross-page words and the complete original printed punctuation. A separate planted reverse test uses the 95 original clear p57 GP runes as a rune source, inserts intentionally typed GP30 SPACEs in **567** valid variable-length blocks, and verifies their complete BASE30→29→30 round-trip. This distinguishes a real reversible pipeline from mere “failure to parse” or accidental decoder disagreement. Original and source-native controls are printed in the SFT.

**#2278 decision:** reject the full original-source literal *wordwise BASE29 numeral → GP30 rune+space* interpretation and even every arbitrary fixed per-page 30-token secret alphabet following it. This is a distinct, motivated failure with a complete reversible source decoder and independent original holdout. Do not follow it with arbitrary radix offsets, fitted word dictionaries or free postconversion keystreams. A viable source-mandated segmentation architecture now needs an **independently visible value-changing, state-dependent key rule or an independently carried side channel**, ideally predicting genuine original GP29 prose and its word segmentation before evaluation. The broader space-changing family remains open. All 56 unsolved LP2 physical pages are still undeciphered.

**Reproduce:** \`node sims/lp2_wordspace_base29_to30_original_sft.cjs\`. Source CJS code passed syntax and every numerical/source-original assertion against current pinned GitHub blobs in an isolated JS execution with minimal Node built-in shims. A standalone Node22 CI execution was not independently observed here.
