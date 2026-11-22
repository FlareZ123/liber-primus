# Three-trit fractionated Morse: original-alphabet capacity gate

**Current original-cipher decision (18 November 2026).** Agent5's 15 November result for Director Issue #1041 excludes direct fixed-key three-trit fractionated Morse on 54 of 55 unknown rune-bearing LP2 pages by alphabet capacity. Agent14's 18 November original p55 tests add two distinct and explicitly bounded conclusions: the 17 printed p55 word boundaries cannot all correspond to the local conventional Morse double-separator under any secret 26-code assignment; and no complete p55 quotation from ten pinned reference files matches any secret fixed fractionated-Morse alphabet. **No unknown plaintext, authentic key, or final destination has been recovered.** The general free-running p55 case remains possible.

## Why this form is incompatible with the authentic source

Standard fractionated Morse first converts plaintext to a dot, dash and separator stream. It maps triplets of these three symbols through a fixed alphabet. A length-three ternary block has `3^3 = 27` possibilities; the conventional forbidden separator-only triplet reduces the usable alphabet to **26**. A keyed permutation cannot add new triplets. Even a nonstandard version admitting the otherwise forbidden triple has only **27** distinct ciphertext codes.

The canonical original-page GP29 rune-index corpus, `resources/liber-primus/lp2-corpus.json`, records **12,956 runes** on **55** unknown rune-bearing pages (p50 is numeric only). The complete book uses every one of 29 rune types; the independently fixed **per-page inventory** is:

| Distinct original rune types on one physical page | Page count | Physical pages |
| ---: | ---: | --- |
| 29 | 53 | p0–p48, p51–p54 |
| 28 | 1 | p49 |
| 25 | 1 | p55 |

Thus **54** individual unknown rune-bearing pages contain **more than 27 distinct ciphertext runes**. None could have been emitted by a deterministic fixed three-trit-to-rune substitution that assigns one cipher rune per code and preserves distinctions. A standard 26-code scheme is excluded on the same 54 pages, regardless of keyword alphabet. The shorter terminal p55, which contains 25 rune types, is **not** excluded independently by cardinality. The original p55 word-boundary and source-quote gates below instead restrict two distinct subfamilies.

This result requires no English model, state search, fitted key, period or visual guess. [Single-file original-corpus reproducer](../sims/lp2_fractionated_morse_capacity_sft.cjs) checks the exact source and triplet counts.

## P55: full secret-key word-boundary capacity obstruction

P55 is unusual: 76 runes use only 25 distinct GP29 symbols, so its alphabet is compatible with standard 26-code fractionated Morse. Its genuine **17 printed word lengths**, from the source transcription in resources/external/Liber Primus 57.txt, are 1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3. Concatenating these 17 words yields all 76 original canonical p55 indices without a discrepancy, including the first carried one-rune word. The 16 printed joins contain 14 distinct left-ending rune types and 13 distinct right-starting types.

Test the literal, human-readable model in which each printed ciphertext word corresponds to a single plaintext Morse word. Morse uses a double x as a word delimiter. Assume that no intervening plaintext letter trits cross a printed word boundary. Then one of three configurations must hold for the boundary-final GP rune L and next boundary-initial GP rune R: (1) L's codeword ends xx; (2) L's codeword ends x and R's codeword begins x; (3) R's codeword begins xx. These allow the delimiter to finish in the final trigram, straddle the printed edge, or begin in the first following trigram.

The **standard 26 triples** exclude xxx. Exactly **two** possible triples end xx (.xx and -xx), **two** begin xx (xx. and xx-), **eight** end x, and **eight** begin x. Every fixed secret injective codebook must respect these capacities. Enumerate the possible original ending-symbol sets of size 0, 1 or 2 assigned suffix-xx codes and the possible initial-symbol sets of size 0, 1 or 2 assigned prefix-xx codes. For every remaining printed join, both end-x and start-x categories become necessary. This covers **9,752 assignments** of the two special categories, with no guess at the cipher alphabet.

The **minimum necessary number of distinct rune types ending x is 10**, and independently the minimum number beginning x is **10**. Both exceed the corresponding **eight available codewords**. There are **zero** valid relaxed category allocations out of 9,752. The category search is deliberately generous and even allows code-sharing that a bijective alphabet would forbid, making the zero count a true all-secret impossibility. A 76-rune, 17-word positive control with a fixed injective 26-code alphabet and actual x|x delimiter placement survives this exact search (four possible relaxed category assignments).

The self-contained original-source proof and positive control are at [p55 Morse boundary SFT](../sims/lp2_p55_fm_wordboundary_capacity_sft.cjs), with [Windows Node 22 PASS CI](https://github.com/FlareZ123/liber-primus/actions/runs/44339258211).

**Limit of this result:** the strict printed-word-to-plaintext-word alignment is a hypothesis. A free-running fractionated-Morse stream may insert its double separators inside any printed ciphertext word. A separately reset or independently padded wordwise cipher, a longer trit code, an escape mechanism, or a nonstationary codebook is also outside this conditional bound. This result supplies no plaintext and does not provide a historical source instruction selecting Morse.

## P55: exact historical-source quote match with every hidden fixed alphabet

A second direct original-cipher attack tests whether all 76 original p55 runes represent an unchanged passage in ten reference texts. For any fixed injective alphabet, every pair of identical ciphertext runes must correspond to the same Morse triple, and every distinct ciphertext rune must correspond to a different triple. The exact equality relation eliminates the secret alphabet without any 26-factorial key search. All text offsets, three trit phases, both p55 directions, and all contiguous p55 starts are covered.

The ten donors are the first 300,000 characters of Shakespeare, three books of Crowley's Book of the Law, two pinned Blake transcript versions, both Tennyson Lady of Shalott texts, the 2014 KJV Passion Gospels extract, and the native LP1 solved-text reference. The maximum original matching interval is **21 of 76 runes** (Shakespeare). Every other donor reaches 20 or fewer. No complete original p55 quotation exists within these finite, normalized reference files under the stated exact fixed-code model.

A source-held-out, independently keyed and injected 76-rune English control with 25 used cipher symbols is recovered in full, including its exact donor phase and offset. The [all-key source-quote SFT](../sims/lp2_p55_fractionated_morse_quote_sft.cjs) passes [Windows Node 22 CI](https://github.com/FlareZ123/liber-primus/actions/runs/44337775441).

These short compatible intervals are expected when p55 has 25 distinct cipher glyphs; they are not decrypted plaintext. This excludes only **verbatim** source passages within the named ten donors, with ordinary English A-Z to standard Morse encoding. It does not exclude a passage authored specifically for Liber Primus, a source absent from this finite donor set, a further cipher layer, or a free-running keyed Morse cipher without an independent quote selector.

## Historical selector and boundary of the exclusion

The archived 2013 signed file often named `2013-01-rune-table-morse.asc` is a misleadingly named historical **whitespace binary ASCII** carrier. Its actual four space/tab-only data lines contain 552 bits, interpreted as 69 ASCII bytes; the recovered message names `emiwp4muu2ktwknf.onion`. The already reproducible [historical source audit](lp2-punctuation-2013-original-binary-selector-gate.md) establishes that event and explains that its signed message does not cryptographically authenticate trailing whitespace. It does not select Morse trits for LP2.

LP2's 138 small four-dot marks, five three-dot marks and larger red ten/thirteen-dot marks are image-visible punctuation categories, with no first-party instruction to read them as Morse dots/dashes/separators or to place triplet boundaries. Their shape or count does not supply a historical Morse key.

**Outside the bound:** A homophonic 29-rune output alphabet sharing triplet codes, explicit escape symbols, position-dependent codebooks, length-four ternary grouping, genuine 5-bit Baconian codes, variable-length Morse fields or an intermediate non-rune alphabet could avoid this cardinality argument. Each needs independent instruction defining its code assignment and page/word clock. Do not rescue the excluded direct scheme with fitted exceptional symbols, or promote an arbitrary such extension without an original-source selector.

**Research decision:** Retire direct standard three-trit fractionated Morse as a whole-manuscript decoder, and the exact print-word-aligned p55 fractionated-Morse subtype. Retire complete original p55 quotations from the named ten donors under a fixed hidden fractionated-Morse alphabet. The free-running p55 case remains mathematically eligible but historically unselected; further expansion requires an authenticated original clue specifying a codebook, source passage, word clock, or reversible transform. Do not repeat unmotivated parameter or quote sweeps.
