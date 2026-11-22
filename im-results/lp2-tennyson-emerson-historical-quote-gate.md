# Source-selected Tennyson and Emerson quotation test (Director #635)

**Decision (12 November 2026):** Neither independently preselected version of Tennyson's *The Lady of Shalott* matches an original LP2 long quotation for twelve consecutive printed GP word lengths, and Emerson's *Essays, First Series* had already been exhaustively tested across all 2,896 original unsolved words with a maximum of nine. No unknown LP2 plaintext, historical cipher key, or original-cipher inverse is recovered. This closes only the **verbatim source reuse with original printed word boundaries** route for these witnesses.

## Why these two texts

*The Lady of Shalott* is tied to the original 2012 Cicada "second chance" Waterhouse image. The 2012 second-chance book code itself is widely documented as using Blake's *Marriage of Heaven and Hell*, so **the image's literary subject must not be promoted to proof that Tennyson's poem was the historical book-code key**. Tennyson is nevertheless a concrete, pre-LP2, author-associated candidate, rather than an arbitrary corpus after rune scoring. Emerson's *Self-Reliance* is in the original 2014 literary material, and the surviving [Gutenberg Essays First Series edition](../resources/control/emerson_essays_2944.txt) already received a complete whole-book screen in [the independent GP word-length census](lp2-wordlength-literary-crib-census.md). That scan's original maximum was nine in **both** ING normalization conventions, so no 12/13/14/34-word original quote can be intact in that exact edition. Do not repeat the full-source Emerson computation.

The two Tennyson source editions are separately frozen **before** testing the original quotation tapes:

| Source | Exact immutable witness | Words |
| --- | --- | ---: |
| Tennyson, 1832/1833 original poem | [Complete 1832 witness](https://github.com/kjhealy/mptc/blob/6e784a2f90d22b0735a63417bda513349d5be416/files/examples/shalott_1832.txt), Git blob `2856e7777a09d306a7bbd53051a41579fe6aed82`; [local source copy](../resources/external/tennyson-lady-of-shalott-1832-mptc.txt) | 1,052 |
| Tennyson, standard revised 1842 text | [Early Poems, Project Gutenberg 8601](https://github.com/GITenberg/The-Early-Poems-of-Alfred-Lord-Tennyson_8601/blob/master/8601.txt), Git blob `f8b91a01e538f0d5c6400a4da728a27a46b4aff7`, poem body `[135593,141652)`; [local body copy](../resources/external/tennyson-lady-of-shalott-1842-gutenberg8601.txt) | 1,003 |

Their version differences are significant, so collapsing them into a single unlabelled Tennyson source would be a defective test. The 1832 version and 1842 revision are also independently displayed by the [University of Toronto's Representative Poetry Online](https://rpo.library.utoronto.ca/).

## Original frozen test

The [runnable standalone source-locked SFT](../sims/lp2_tennyson_quote_source_sft.cjs) reads the canonical LP2 runic transcription, derives **2,896 original printed words/12,956 runes**, preserves page/line carry, and verifies all seven preannotated quotation intervals against their original rune SHA-256 hashes. Their exact original word counts are **[4,5,2,14,13,34,14]** (405 total runes). The two source versions are normalized under both GP English conventions with and without ING contraction. The test also accepts and locates a planted 34-word source passage, includes a fixed wrong-order shuffle, and leaves every original rune and printed word boundary unchanged.

### Results

| Original quotation index | Printed words / runes | Tennyson 1832 longest contiguous lengths (ING / no ING) | Tennyson 1842 longest contiguous lengths |
| ---: | ---: | ---: | ---: |
| 0 (pp6–7) | 4 / 18 | 3 / 3 | 3 |
| 1 (p22) | 5 / 19 | 3 / 3 | 3 |
| 2 (p40) | 2 / 12 | 2 / 2; five exact short placements | 2; three exact short placements |
| 3 (p40) | 14 / 58 | 5 / 5 | 4 |
| 4 (p42) | 13 / 68 | 4 / 3 | 4 |
| 5 (pp42–43) | 34 / 160 | 5 / 5 | 5 |
| 6 (p53) | 14 / 70 | 5 / 5 | 4 |

**Complete long quote matches: 0** across either edition, either GP convention, and all four original 13+ word quotations. In the 1832 edition the largest partial match occupies only **21 original GP runes** (five words); the 1842 maximum is **19**. The five-word match in p42–43's 34-word span begins inside the span, not at a quote boundary, and has no justified original-cipher equation. The 1842 fixed shuffled source obtains **eight** matching internal words at that same long quotation, underlining how weak postselected subthreshold partials are.

No candidate even approaches the prospectively specified **twelve consecutive words and 40 true original GP runes**. Consequently no original punctuation-profile test, substitution-key fit, re-encipherment or adjacent-page prediction is authorized. This is an exact-source decision and is **not** a general exclusion of Tennyson themes, all textual editions, paraphrases, hidden-word boundaries or other ciphers.

## Complete exact original-cipher family test: all seven quotation spans

An extended test applies the exact original-cipher rune-pattern invariant to **every complete quotation**, not only the 12+ word spans. For each source and GP convention, it enumerates every **unmodified contiguous source passage with precisely the original printed word-length sequence**, then tests whether a single *arbitrary secret* one-to-one substitution over all 29 GP runes could map that source plaintext onto the **complete original ciphertext quote**. This permits 29! unknown secret alphabets, with no recovered/fitted key, because a valid substitution must preserve the equality pattern of all rune positions. For all seven original quotes, exact source lengths and secret alphabet feasibility jointly yield:

| Frozen source | Exact source full-quote word-length candidates for q0…q6, ING | Same without ING | Exact full-quote secret alphabet survivors |
| --- | --- | --- | --- |
| 1832 *Lady of Shalott* | `[0,0,5,0,0,0,0]` | `[0,0,5,0,0,0,0]` | **0** |
| 1842 *Lady of Shalott* | `[0,0,3,0,0,0,0]` | `[0,0,3,0,0,0,0]` | **0** |
| Emerson *Essays First Series* #2944 | `[22,5,570,0,0,0,0]` | `[22,6,578,0,0,0,0]` | **0** |

Thus even shorter q0 (4 source words/18 original runes) and q1 (5 source words/19 original runes) lack a fixed substitution witness: 22+5 or 22+6 Emerson length-compatible passages collapse to **zero** under the complete original repeated-rune pattern and necessary injectivity constraints. The only source-compatible two-word matches, q2, likewise collapse to zero. Every other original quotation already fails the prior exact full-length test.

The extended [CommonJS original-input SFT](../sims/lp2_tennyson_quote_source_sft.cjs) enumerates all seven windows across all three source versions and both GP spellings with fixed per-window counts; an arbitrary-secret 14-word source passage is planted as a positive control. **This closes exact verbatim source reuse of any of the seven original quoted passages under every stationary monoalphabetic GP29 bijection** for these specific historically selected editions, without guessing the secret alphabet. It cannot exclude a position-dependent stream cipher, reordering, changed word partition, paraphrase or different literary source.

## A stronger original-cipher invariant on the two-word p40 quotation

The original p40 **quotation 2** is exactly 12 runes in two source-printed words of lengths **3 and 9** (canonical rune offsets 9,715–9,727). Its ciphertext GP indexes, without any edits, are:

`[28,13,20,23,3,20,10,14,28,21,18,4]`

Two repeated positions provide an exact original-cipher **plaintext-invariant** under **any one-to-one, stationary 29-rune substitution**, even if every substitution mapping were secret. Cipher index 28 repeats at positions 0 and 8, while index 20 repeats at positions 2 and 5 (zero-based). Therefore an intact proposed plaintext quotation must use the **same GP-native token at both 0/8 and 2/5**. This test avoids selecting any Caesar shift or substitution key by scoring.

The two original Tennyson editions and the complete already-pinned **77,932-word Emerson Essays First Series #2944** were scanned only for **source-contiguous 3/9-word pairs**, under each of the same two GP transliteration conventions. Outcomes:

| Historical witness | Native 3/9-word pairs (ING / no ING) | Pairs with required equality 0=8 | Pairs with required equality 2=5 | Pairs satisfying both |
| --- | ---: | ---: | ---: | ---: |
| Tennyson 1832 | 5 / 5 | 0 / 0 | 0 / 0 | **0 / 0** |
| Tennyson 1842 | 3 / 3 | 0 / 0 | 0 / 0 | **0 / 0** |
| Emerson Essays #2944 | 570 / 578 | 21 / 21 | 21 / 22 | **0 / 0** |

Full **secret bijective alphabet-map survivors are zero** in all six cases, even before imposing the other ten letter-identity/distinctness constraints. The same [SFT](../sims/lp2_tennyson_quote_source_sft.cjs) derives the target from original ciphertext, checks those equalities, runs a positive plant with a wholly unknown bijection and rejects a planted equality violation. This also covers the 2-word quotation for which exact word-length scans had several short full matches. Thus **none of those printed Tennyson or Emerson passages is that exact p40 quotation under any fixed monoalphabetic GP29 substitution**, regardless of which secret alphabet permutation a solver supplies.

The invariant is narrowly scoped. Position-dependent polyalphabetic, letter-transposing, stream-encoding, altered-word-boundary or paraphrase routes can violate these equalities; those remain undecided. No new plaintext or key follows. Since each source's long quotations already failed the frozen wordlength gate, the complete source-selected **verbatim word-preserving monoalphabetic branch** is closed without adding fitted layers.

## Spacing-independent recovery gate: no long quotation matches under any unknown alphabet

The original printed spacing itself is now known to lack the normal prose word-length dependence ([original grammar](lp2-original-wordlength-grammar-mi.md), [line-reversal obstruction](lp2-boustrophedon-line-wordlength-invariant.md)). Consequently it is important to ask whether the source texts could still directly supply **contiguous plaintext rune substrings while their spaces were changed**. We have made that separate, stronger test, while retaining exact rune order and granting a freely unknown one-to-one **stationary GP29 alphabet**.

Delete *all* printed word boundaries from each pinned original literary source after its native GP29 transliteration. For every original quotation's entire unaltered 12–160 rune cipher interval, slide over **every** source GP-rune position. A candidate survives only when **every repeated-rune equality and every distinct-rune inequality of the original ciphertext** is consistent with one unrestricted 29-rune bijection. This finite test has no fitted source location, source-specific alphabet or English score and is a genuine original-cipher necessary condition.

| Pinned historical source | Flat GP rune count with ING / without | q0, q1, q3–q6 (all 18–160 runes) | Short q2, 12 runes, pattern-only survivors |
| --- | ---: | ---: | ---: |
| Emerson *Essays First Series* | 323,083 / 324,630 | **0** | **85 / 84** |
| Tennyson 1832 *Lady of Shalott* | 4,236 / 4,266 | **0** | **0 / 0** |
| Tennyson 1842 *Lady of Shalott* | 3,900 / 3,927 | **0** | **1 / 1** |

The single Tennyson 1842 short-quote equality-pattern survivor begins at flat GP offset **3,359** (3,383 without ING), *inside the last letter of “FROZEN”*, yielding the contiguous GP spelling **“N SLOWLY AND HE”**. Its 12-rune equality pattern happens to match the ciphertext's two repeat positions under some arbitrary partial one-to-one alphabet mapping. The source gives **no instruction to delete spaces, use the 1842 revision, select that offset, or choose the ten mappings**; the original printed 3+9-rune word partition disagrees. In Emerson a much longer source produces 85 similar short survivors, demonstrating how easy it is for this 12-rune all-secret pattern to occur without a real decryption. This survivor is **not authenticated plaintext**.

**Decisive exclusion:** For these three exact editions, the source cannot supply any of the **other six original complete quotation segments as verbatim order-preserving GP text under any fixed secret monoalphabetic substitution, even if every plaintext space is deleted or reassigned**. The only short pattern survivors are unconstrained and have no independently specified key or selection. The test does not exclude position-dependent keys, changes to ciphertext rune order, nonverbatim quotes, alternative external texts or genuinely different original-cipher constructions.

The consolidated [source-locked SFT](../sims/lp2_tennyson_quote_source_sft.cjs) checks every position of every full quotation under both GP orthographies and asserts every outcome above, in addition to the preserved original word-boundary test and source-native positive controls.

## Full original-text reversible cipher consumer: the selected poem as a running key

The pre-LP2 Tennyson image link also makes one cheaper **actual decipherment** attempt possible independently of the quotation equality tests: use each complete historically pinned poem as a **source-selected, periodic GP29 running key** to decode the entire **12,956 original unknown runes**. This is an executable reversible inverse, rather than a fitted similarity statistic. It models the possibility that the text serves as a cryptographic key even though no unsolved quotation directly reproduces it.

The [same runnable SFT](../sims/lp2_tennyson_quote_source_sft.cjs) freezes the poem starting at its **first genuine rune**, under each of the two legitimate GP conventions, with no fitted key offset, length or alphabet. The exact 1832 poem provides 4,236 or 4,266 GP key runes; the 1842 poem provides 3,900 or 3,927. For each key, it decodes all 12,956 original ciphertext symbols with the three standard reversible rules **C = P + K, C = K − P, C = P − K (mod 29)**, allowing source-key phase to restart at just three clearly defined original manuscript scopes: **whole book, each physical rune page or each of nine original chapters**. The 36 fully specified inverses therefore cover 2 poem witnesses × 2 GP conventions × 3 arithmetic rules × 3 reset clocks. Physical runeless p50 is omitted from the page reset sequence, while later pages retain their true physical numbering. No language score, guessed shift or unknown plaintext is used to select parameters.

| Input and decoder | Whole decoded 12,956-rune GP29 index of coincidence |
| --- | ---: |
| Original unmodified unsolved ciphertext | **0.03447840** |
| Best of all 36 frozen Tennyson source-key inverses | **0.03450661** |
| Worst of all 36 Tennyson inverses | **0.03446568** |
| Independent solved LP1 source-native English GP plaintext plant | **0.06120936** |

The best-of-36 comes from **1842, ING contraction, C=P+K / C=K−P (both share IoC), key reset every physical page**. The independently sourced LP1 native-English plant is encrypted with the literal 1832 Tennyson stream, then recovered **exactly at every rune** by the same direct inverse, attaining its original 0.06120936 IoC. This checks that the inverse can in fact recover GP-native English and will not silently declare a successful decoder random. Every unmodified original candidate instead has essentially uniform-alphabet IoC, consistently near the original ciphertext itself. No candidate yields an English-like distribution or authentic unknown-page text.

This rejects the **36 direct original zero-offset Tennyson periodic additive/Beaufort running-key models**, with the specified original clock scopes and native GP spelling. It does not reject a key hidden at another source location, arbitrary offsets, unrelated poem editions, nonlinear mixing, a different plaintext register, or alphabet-changing mechanisms. There is no source instruction licensing a longer brute-force offset search, so none was performed.

## Reproduction and research consequence

Run `node sims/lp2_tennyson_quote_source_sft.cjs` in the repository root. The source files, original LP2 inputs, hashes, matched positions, wrong-order control and source-native planted-positive test are included. The existing Emerson [whole-book SFT](../sims/lp2_wordlength_literary_crib_sft.cjs) independently explains and reproduces its nine-word maximum.

**Retire direct quotation reuse from these exact original-source editions.** A new literary key investigation needs a printed selector of an operation, coordinates or a different source-native signal before numerical fitting to the unknown GP text.