# Three-trit fractionated Morse: original-alphabet capacity gate

**Current original-cipher decision (26 November 2026).** Agent5's 15 November result for Director Issue #1041 excludes direct fixed-key three-trit fractionated Morse on 54 of 55 unknown rune-bearing LP2 pages by alphabet capacity. Agent14's 18 November original p55 tests add two distinct and explicitly bounded conclusions: the 17 printed p55 word boundaries cannot all correspond to the local conventional Morse double-separator under any secret 26-code assignment; and no complete p55 quotation from ten pinned reference files matches any secret fixed fractionated-Morse alphabet. Agent25's 26 November forbidden-subset bound also rejects a complete stationary homophonic trigraph codebook on every original chapter for letters/digits, and seven chapters even when Morse tokens of length up to eight are allowed. **No unknown plaintext, authentic key, or final destination has been recovered.** The general free-running p55 case remains possible.

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


## Stationary homophonic trigraphs: all-key forbidden-subset obstruction (26 November, Agent25)

The cardinality argument above assumes a one-to-one alphabet. Relax that to any fixed function D from the 29 GP rune types to the 26 conventional Morse trigraphs (all triples over dot, dash and x except xxx). Several different runes can carry the same trigraph. Ignore printed words entirely. Grant each original chapter its own private table; the table may be nonsurjective unless explicitly stated. No codebook optimization, English score or new plaintext assumption enters the following bound.

Let S be the set of **observed rune types** assigned a trigraph containing only dots and dashes. Two consecutive ciphertext runes in S produce at least six consecutive nonseparator trits, which cannot occur in an ordinary Morse letter or digit (maximum length five). Three consecutive runes in S produce at least nine consecutive nonseparator trits, which also cannot occur if every permitted punctuation/prosign token has length at most eight. Thus S must avoid every set of types appearing in an observed consecutive 2- or 3-rune window, respectively. Repeated rune identities within a window are collapsed to a set, so a doublet can forbid a single type and ABA can forbid a pair in the three-run gate. Enumerating all possible such subsets, via exact branch-and-bound on 29-bit masks, gives the maximum cardinalities below. Superset forbidden constraints are discarded; a witness and node count are retained. The search branches include/exclude and prunes only impossible extensions or branches with insufficient remaining cardinality. This covers every static homophonic mapping, including arbitrary allocation of extra carrier runes.

There are eight distinct separator-free trigraphs. Any complete surjective codebook used on a scope observing all 29 rune types must assign at least eight observed types to S. Even a nonsurjective decoder cannot emit more than |S| distinct separator-free trigraphs within the scope.

| Original scope | Rune count | Maximum S, no 2-run | Maximum S, no 3-run |
|---|---:|---:|---:|
| p0–2 | 729 | 3 | 10 |
| p3–7 | 1,145 | 2 | 7 |
| p8–14 | 1,729 | 2 | 6 |
| p15–22 | 1,903 | 2 | 6 |
| p23–26 | 1,021 | 3 | 7 |
| p27–32 | 1,433 | 2 | 6 |
| p33–39 | 1,680 | 1 | 6 |
| p40–53 | 3,008 | 1 | 5 |
| p54–55 | 308 | 7 | 12 |
| Entire p0–55 | 12,956 | 1 | 3 |

All ten scopes observe all 29 rune types. Removing **every interpage constraint** leaves every maximum above unchanged, while retaining the same static table within each tested scope. Therefore the complete 26-code homophonic receiver is impossible on all nine chapters independently with maximum token length five, and on seven of nine with maximum token length eight. The whole-manuscript table fails both. This is an exact grammar/coverage contradiction, not a statistical rejection.

### Nonsurjective sensitivity and genuine homophonic control

Without surjectivity, the same maximum bounds distinct separator-free trigraphs actually emitted. Compare every overlapping fixed-length window in all three trit alignments in the pinned Gibran, Emerson and Shakespeare controls, normalized to A–Z, single x between letters and xx between words. Gutenberg framing is stripped when recognized. These are finite reference-text results, not a theorem of English. For the whole-book 12,956-rune length, all **2,173,739** overlapping windows across the three controls contain all eight separator-free codes, exceeding either bound. For p40–53 all **2,263,271** windows contain all eight, exceeding even its relaxed three-run bound of five. Every chapter except p54–55 has zero reference windows under the no-2-run bound. Terminal p54–55 retains 194,149 windows under that necessary condition, not a plaintext or a feasible complete table. Under the no-3-run count test, 82 Shakespeare windows of p23–26 length survive, while all windows of p0–2 and p54–55 pass the relaxed count bound. The A–Z control only establishes the reference coverage under that normalization; punctuation/prosign grammar sensitivity is an algebraic result under the stated maximum token lengths, not a comparison to punctuation-bearing Morse reference tapes.

A 3,008-trigraph actual Gibran plant uses a shuffled 29-label codebook containing all 26 ordinary trigraphs plus three duplicated dot/dash-only codes. It observes all 29 carrier types, uses all eight separator-free codes and eleven corresponding rune types, and reconstructs all 9,024 source trits. Its exact maxima are 11 and 12, so neither necessary bound falsely rejects it. The search also agrees with exhaustive 10-type brute-force enumeration on 100 small graph/hypergraph cases. This is a grammar/implementation positive, not blind key recovery.

Inputs: original canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85. [Read-only Node reproducer](../sims/lp2_homophonic_morse_independent_set_sft.cjs), [full executed output](lp2-homophonic-morse-independent-set.json). Computed on the checked-in original corpus and texts in connected JavaScript; no Windows CI run claimed.

**Decision:** the previously open stationary complete homophonic three-trit repair cannot support the ordinary Morse register, even with independent chapter-private tables and arbitrary interpage framing. A nonsurjective decoder producing extremely atypical coverage, page-private tables, moving state, inserted separators inside the trigraph stream, other token lengths, and the p55-only sparse case are outside the strongest result. The original punctuation does not establish Morse; there is no justification for a broader key sweep.

## Historical selector and boundary of the exclusion

The archived 2013 signed file often named `2013-01-rune-table-morse.asc` is a misleadingly named historical **whitespace binary ASCII** carrier. Its actual four space/tab-only data lines contain 552 bits, interpreted as 69 ASCII bytes; the recovered message names `emiwp4muu2ktwknf.onion`. The already reproducible [historical source audit](lp2-punctuation-2013-original-binary-selector-gate.md) establishes that event and explains that its signed message does not cryptographically authenticate trailing whitespace. It does not select Morse trits for LP2.

LP2's 138 small four-dot marks, five three-dot marks and larger red ten/thirteen-dot marks are image-visible punctuation categories, with no first-party instruction to read them as Morse dots/dashes/separators or to place triplet boundaries. Their shape or count does not supply a historical Morse key.

**Outside the bound:** A nonsurjective or changing-state homophonic alphabet outside the forbidden-subset gates above, explicit escape symbols, position-dependent codebooks, length-four ternary grouping, genuine 5-bit Baconian codes, variable-length Morse fields or an intermediate non-rune alphabet could avoid this cardinality argument. Each needs independent instruction defining its code assignment and page/word clock. Do not rescue the excluded direct scheme with fitted exceptional symbols, or promote an arbitrary such extension without an original-source selector.

**Research decision:** Retire direct standard three-trit fractionated Morse and its complete stationary homophonic extension as whole-manuscript decoders, and the exact print-word-aligned p55 fractionated-Morse subtype. Retire complete original p55 quotations from the named ten donors under a fixed hidden fractionated-Morse alphabet. The free-running p55 case remains mathematically eligible but historically unselected; further expansion requires an authenticated original clue specifying a codebook, source passage, word clock, or reversible transform. Do not repeat unmotivated parameter or quote sweeps.
