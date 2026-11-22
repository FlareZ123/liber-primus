# PARABLE word-interior totients navigate to the numerical table under two finite 56-page counts

## Source qualification of the 256-token grid

**Source qualification:** **Correction to prior source qualification:** LP2 pages 49–51 are stored as JPEG files 66.jpg, 67.jpg and 68.jpg in the uploaded archive. These original images visibly contain the printed 32-row × 8-column table of 256 two-character tokens. The earlier inspection of files 49.jpg–51.jpg was a filename mismatch and does not bear on this table. The 76-cell perimeter and 180-cell interior are therefore author-visible geometry, not an analyst-created layout. The unresolved hypothesis is the conversion of each printed two-character token to a byte: value = 60×digit(first)+digit(second) (base60) versus the live radix59 alternative. The original-image glyph audit supports all eleven disputed tokens; the full-font audit finds same-character controls for 509/512 glyphs and separately visually checks the three singleton labels. See im-results/lp2-grid-11-original-glyph-adjudication.md. The experiments below reject only the explicitly tested consumers of the byte interpretation, not the visible table or its intended use.

**Original-source result, 14 November 2026, Agent 32.** The exact 55-rune word interiors of the solved PARABLE supply a single ordered GP-prime-totient step list. Under the simpler **ordinary clockwise 56-page ring walk**, counting the starting page as step one on every hop **without removing pages**, this list ends on physical **p49**, exactly where the 256-cell numerical table begins. With the same steps and count-one convention, the stricter **Josephus remove-as-you-go** reading instead leaves **p50**, the sole rune-free central numerical-table page, even when the 55 steps are reversed. These are two explicit author-clue-motivated interpretations converging on **the same three-page table spread p49–p51**; the counting operators and ring choice remain hypotheses, **not an authenticated original instruction, recovered key or decrypted unknown text**. The table's 76-cell outer perimeter also matches p55's 76-rune ciphertext; a cyclic additive-key interpretation with output-aware collision rejection has now been tested across 608 natural variants and produces no coherent plaintext.

## Human-visible instructions and independent starting facts

The original solved physical p57 PARABLE, also preserved verbatim in the 2013 original 761.MP3 ID3 TXXX frame, reads in part: "We must shed our own circumferences; find the divinity within and emerge." It contains **95 original GP29 runes in 20 printed words**. The 2013 ID3 tag preserves the parable, its number `1,595,277,641`, the title `The Instar Emergence` and artist `3301`; it contains no Josephus, page-elimination, start-position or direction instruction, and the parable itself cites no external book, author or verse. The primes/totient injunction is from **2014 LP1 p05**, the original `SOME WISDOM` page; `resources/external/2013-0-wisdom-source.md` is a legacy path, not evidence of a 2013 page. The actual 2013 Cicada OS `/tmp/wisdom` and `/tmp/folly` are separate, byte-identical 3,368-byte binaries. The signature-valid 2013 TCP-server specification defines RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT and GOODBYE, but explicitly contains no NUMBER, PRIMES or COUNT command. The 2016 author-signed update says "Its words are the map, their meaning is the road, and their numbers are the direction" and "The path lies empty". The manuscript's original unsolved pages are physical **p0–p55**: **56 pages**, of which **55** carry GP29 runes and the **32×8, 256-cell numerical table spans p49–p51**; its middle p50 has no rune text.

These independent source facts motivate a *specific proposed reading*: shed the first and last **rune** of each complete printed PARABLE word; use the remaining GP runes' published prime weights and their Euler totients to count through the 56 physical pages in their source order, eliminating a page at each step (the ordinary circular **Josephus** operation). A count starts at p0, takes the currently pointed-to surviving page as count 1, removes the counted page, and resumes at the next surviving page. No secret parameter or ciphertext-language score determines a step. The longest runes use the actual GP glyph identities, not Latin-letter lengths. The word-interior selection was independently documented previously in [the page-seed gate](lp2-parable55-source-interiors-page-key-gate.md), but its 56-page Josephus outcome was not previously tested.

**Important interpretive gap:** no preserved 2012–2016 first-party source uses the term "Josephus" or explicitly instructs page elimination. None defines the ring as all 56 LP2 pages, the initial cursor at p0, whether the current page is count 1, clockwise versus counterclockwise orientation, or the use of *unreduced* prime totients as counts. "Circumferences" supplies a circle metaphor, but not a unique elimination algorithm. The parable contains no external literary citation; a Crowley/666 association is a retrospective hypothesis from a separate arithmetic observation, not a reference named by the source. A human can be motivated to strip word endpoints and use prime/totient arithmetic, but cannot derive this exact Josephus contract without choosing its missing parameters. The p50 survivor remains a motivated, reproducible navigation hypothesis, not a source-authenticated command.

## Simpler no-removal page walk selects the *start* of the numerical table

The human-visible 56-page ring and the complete 55-step sequence also support a less elaborate operation than eliminating people from a circle. Begin at physical p0. At every step `n=φ(GP prime)`, **count the current page as one**, move clockwise through `n−1` page transitions, and retain all 56 pages in the ring. After all 55 steps, the endpoint is

\[
  \sum_{j=1}^{55}(\varphi(p_j)-1)\bmod56
  =(1952-55)\bmod56
  =\mathbf{49}.
\]

**Physical p49 is exactly the first page of the three-page numerical table**, where the manuscript changes from runic prose to its 256 printed two-character numerals. The next physical page, **p50**, is the unique rune-empty center page selected under Josephus elimination below. This creates a concrete original-artifact-consistent destination under a **plain circular page walk**, an operation closer to the literal 2016 'numbers are the direction' instruction than the additional Josephus removal rule.

| Fixed 56-page no-removal circular walk from p0, count current page as one | Final page |
| --- | ---: |
| **55 word-interior rune totients** | **p49, where numerical table starts** |
| All 95 original PARABLE rune totients, no boundary shedding | p26 |
| Only the 40 discarded word-endpoint rune totients | p33 |
| 55 raw GP prime values, same count convention | p48 |
| 55 GP ordinal+1 values | p13 |

The endpoint requires the **full prime totients**, original word-interior extraction and **56 unknown-page ring**. It also requires counting the current page as one. If every totient were instead interpreted as a number of *transitions*, with the initial page counted as zero, the first variant would end p48. Since this walk retains all pages, reordering the 55 steps cannot change its endpoint; the earlier forward/reverse dual result applies specifically to the stronger **elimination** version. This fixed-sum property and the later p50 survivor share the same selected inputs, so **they must not be multiplied as if independent statistical tests**. No source explicitly fixes one convention over the other.

## Exact original computation

After shedding word endpoints, the **55 GP runes** transliterate to:

```
ARABLICNSTAUNNELURFACUSHEUWIRCUMFERENCEINIUINITITHINMERG
```

The first eighteen **full** totient steps are `96,10,96,60,72,30,12,28,52,58,96,2,28,28,66,72,2,10`. The full **55** steps, and the entire removed-page order, are printed by [the single-file Node22 reproducer](../sims/lp2_parable55_totient_josephus_p50_sft.cjs). The removed-page order begins **39, 49, 35, 43, 8, 40, 54, 27, 31, 46** and ends **4, 42, 7, 21, 25, 15, 9, 22, 48, 19**. Exactly 55 distinct pages are removed. The single **remaining page is physical p50**.

| Fixed source reading and clockwise 56-page elimination | Survivor |
| --- | ---: |
| PARABLE printed interior runes → **φ(GP prime)**, all 55 full values | **p50** |
| Same 55 totient steps, in complete reverse sequence | **p50** |
| Original printed interior runes → unreduced GP prime | p21 |
| Original printed interior runes → GP zero-based rune index + 1 | p12 |
| Prime totient reduced modulo 29, with zero counted as a 29-page lap | p20 |

The last convention is an explicitly conditional workaround for zero counts in a Josephus algorithm, not a canonical source rule. It is given only to show that a previously solved **GP29** key clock does not automatically deliver this result. Full integer totients, counted through a 56-item ring, are essential for the displayed p50 selector.

The coincidence has a second finite specificity check: rotate the 55 original totient steps to each of the **55 possible start phases**. Only **printed phase zero** leaves p50 under *both* forward and reversed step order. Four shifts leave p50 forward; three leave p50 in reverse; their only common shift is zero.

## Finite null and its limitations

For a source-shape-preserving control, shuffle only the **20 complete word-interior blocks**, keeping every rune, each word's internal rune order, the 55 prime-totient values, the original 56-page circle and the fixed clockwise Josephus contract. Using seeded xorshift32 (`0x3301a871`) and **40,000** Fisher–Yates word-order permutations:

- **699 / 40,000** reach p50 with forward word-interior totients.
- **765 / 40,000** reach p50 with reversed totient sequence.
- **14 / 40,000** reach p50 with **both** forward and reverse.

The joint source-rearrangement frequency is **0.00035** in this deliberately bounded conditional ensemble. It is **not a probability of authorial intention or a discovery-adjusted p-value**: the overall research population has tested many interpretations and noticed p50 *after* calculating this one, and source word-order randomization may not model the author's choices. The duplicate direction result helps distinguish the exact source order from a random word reorder within this narrow construction; it does not establish encryption.

**Unshorn-source control:** The same original p57 contains **41** contiguous 55-rune windows without deleting word boundaries. Use each of those original complete windows as 55 prime-totient Josephus counts on the same 56 pages. **Zero** of the 41 forward windows finish on p50; just **one** reversed window does (original offset36, forward survivor p42). Thus the dual p50 endpoint specifically depends on the text-relevant *word-interior* transformation, rather than following from taking any readily available 55-rune portion of p57. This finite comparison does not correct for the broader search over all possible operations.

## Direct source-selected table readout: another 256-cell circle

The ordinary 56-page ring walk finishes at the first numerical-table page, p49. Without introducing an external key, the same 55 fixed full totients can now serve as **count-current-as-one** advances around a second source-visible circular register: the table's **256 row-major cells**, beginning at the first p49 cell. Read the selected byte after every step and convert the byte to a GP rune using each of the two already studied natural numerical reductions. This creates two original-input 55-rune candidate directions from the table, exactly the length of the word-interior seed:

| Frozen source-grid55 readout | GP29 IoC | Beginning of 55-rune GP transliteration |
| --- | ---: | --- |
| Table byte modulo29 | **0.03771044** | `GGEOENGOIAPRYWHSSNGUFEAEAMUPAEO` |
| floor(table byte×29/256) | **0.03501684** | `OPCEHOTIAOEOWDIAETHGNPPNGYUMG` |

Neither complete output resembles a GP-language instruction or yields a source-authenticated key; the first readout is `GGEOENGOIAPRYWHSSNGUFEAEAMUPAEOSNGBEIAWHMMOEUOEEBWOEEAFOEHUSNEAOICFAC`, the second `OPCEHOTIAOEOWDIAETHGNPPNGYUMGJSSNGEOWDEAEACMNNGCBTCTFEWTIAXMYWPGOEW`. The same full original-input SFT checks both values and all prior PARABLE page-navigation controls. This is a precise **negative for those two direct table-byte-to-GP readouts**, not an argument against a hidden key, a separately instructed table coordinate operation, a different number system or cryptographic output register.

## Outer 76-cell ring as p55 cyclic key with output-aware collision rejection

The derived 32×8 arrangement of 256 two-character tokens has a 76-cell perimeter, exactly matching the 76 original GP29 ciphertext runes on p55. This suggests a specific, testable consumer: read the perimeter as a cyclic additive GP29 key and, whenever the next key cell would produce a ciphertext rune equal to the preceding ciphertext rune, advance around the perimeter until the output differs. This interpretation combines the original table geometry, the exact p55 length, and LP2's unusually suppressed adjacent doublets. It is a hypothesis, not an instruction explicitly stated by the author; “shed our own circumferences” could instead mean discard the perimeter.

For a candidate ring key K and observed ciphertext C, if the candidate key cell K[j] is skipped and K[j+1] is used, the skipped cell would have reproduced the previous ciphertext exactly when:

K[j] − K[j+1] ≡ C[i−1] − C[i] (mod 29).

The checked-in reproducer sims/lp2_p50_rim_collision_skip_gate.cjs extracts the 76 perimeter cells in clockwise order from the derived 256-token arrangement, under the unproven base60 byte conversion and tests **608** fixed candidates: two byte-to-GP29 maps (byte mod 29; floor(byte×29/256)), row-major and column-major table layouts, both perimeter directions, and all 76 starting offsets. It preserves the original p55 word boundaries and treats its first rune correctly as the carried end of a word begun on p54, not as a new word initial. A Shakespeare-derived GP29 bigram model ranks outputs; no key, direction, offset or mapping is fitted to plaintext.

**Result:** no candidate yields coherent plaintext. The best candidate is scaled29 / row-major / reverse / start 11, with two collision skips and a bigram score of **−5.000 per scored event**; its output is gibberish. The median candidate scores **−6.024 per event**. The known p56 English plaintext scores **−2.435 per event** under the same language model. The best candidate with skips is also the overall best; no readable result is hidden by preferring a zero-skip path.

The inverse rule is not merely a no-op: a synthetic 24-rune plaintext deliberately forcing one collision is encrypted with the same cyclic rule, then recovered exactly by the inverse, with one skip in both directions. This validates the implementation, not the LP2 hypothesis.

**Decision:** reject this exact deterministic cyclic-perimeter/additive-GP29/collision-rejection family as a p55 decoder. This does **not** reject the p57→p49/p50 navigation hypothesis, the 76-cell perimeter as an operand under some other independently selected operation, or other whole-table/rim-only consumers. Do not rescue this failed family by tuning arbitrary byte maps or key schedules; keep #41 waiting for an author-visible reversible rule.

## Outer 76-cell ring as a rank-order transposition key for p55

The original p49–51 table is printed as a 32×8 grid, whose visible perimeter contains exactly **76 cells**; p55 contains exactly **76 GP29 runes**. In light of the 2016 signed message's “numbers give direction” wording, a natural operation distinct from the failed cyclic additive key is to use the perimeter values as a **rank-order transposition key**: sort the 76 perimeter cells by their byte values, then scatter or gather the 76 p55 runes in that order. This uses the source-visible rectangle and exact length match, rather than the unrelated 16×16 reshaping.

The source-pinned SFT [lp2_p50_perimeter_p55_rank_transposition_sft.cjs](../sims/lp2_p50_perimeter_p55_rank_transposition_sft.cjs) tests the conditional base60 byte reading. It evaluates all 76 perimeter starting offsets, both traversal directions for stable tie-breaking, ascending and descending value order, and both inverse permutation conventions: **608 candidates**, representing **56 distinct sorted orders**. The p55 word-boundary mask is preserved, including its first rune as the carried end of a word begun on p54. The 76 perimeter values contain 68 distinct values, so stable tie-breaking is explicitly varied. A synthetic 76-symbol positive control round-trips exactly.

**Result:** the raw p55 text scores **−6.125** per bigram event; the best transposition scores **−6.008**, while the known p56 English control scores **−2.435** under the same Shakespeare-derived GP29 model. The best output begins “X GTHMH CB PS PAEIAEATH DJTHDUIA …” and remains gibberish. No candidate approaches the known-plaintext control.

**Decision:** reject this simple stable-rank transposition family as the p55 decoder. This does not reject the p50 perimeter under another independently selected operation, but it closes the most direct way to turn its 76 values into a 76-position permutation. Do not broaden the search to arbitrary nonlinear rank maps or fitted tie-break rules.

## Inner 180-cell grid under the same 55-step Josephus walk

The solved parable has 20 words and 95 GP runes. Removing the first and last rune of every word leaves exactly **55 interior runes**; mapping each through the GP prime weights and taking prime totients gives the ordered 55-step sequence (sum 1,952). The same sequence applied by the previously defined count-current-as-one Josephus rule to 56 manuscript pages removes 55 pages and leaves p50. A second source-motivated reading of “shed our own circumferences” is to remove the 76-cell perimeter of this analyst-defined 32×8 arrangement, leaving a 30×6 interior of 180 cells, then apply the same 55 steps to that interior.

This gives a concrete page-key hypothesis without searching arbitrary starts: apply the 55-step Josephus elimination to the 180 interior cells, take the 55 removed byte values in elimination order, and pair them with the 55 eliminated page numbers in the page-Josephus order. Treat each byte as a prime-stream starting ordinal for that page, using the already established p56 cipher K[j] = (prime[j] − 1) mod 29. The 125 unremoved interior cells are the complementary “within” sequence. The checked-in reproducer sims/lp2_p50_inner180_josephus_page_key_gate.cjs tests row-major and column-major inner layouts, forward and reversed selected-byte order, and zero-based or one-based prime ordinals (eight page-schedule variants).

The decoder uses the known F-transparent rule: a literal plaintext F is transmitted unchanged and consumes no key; ciphertext F may alternatively be an encrypted non-F symbol and consume a key. A bigram Viterbi selects these cases. **Positive control:** with key start zero, the known p56 page recovers its authenticated 85-rune plaintext exactly, including its one literal-F bypass, at −2.435 log-score per event.

**Result:** the proposed inner-grid schedule fails decisively. Across the eight source-natural variants, the best admits only **3 of 55 pages** without violating the F-transparent rule; several variants admit zero. The surviving pages are not English. The canonical row-major, forward, zero-based pairing admits only **1 of 55** pages; changing to one-based ordinals admits 2 of 55. The best 3/55 variant is column-major, reversed, one-based, and still yields gibberish. Thus the exact “removed inner bytes are per-page prime-stream starts” interpretation is rejected; this is not a failure of the p56 decoder, whose positive control is exact.

The 125 survivor bytes and 55 removed bytes were also tested as direct additive GP29 keys for p55 across **32** natural variants: survivor/removal sequence, row/column layout, byte mod29/scaled29, forward/reverse order, and both additive signs. The best bigram score is **−5.543 per event**, with no coherent plaintext; the known p56 English control is −2.435 per event.

**Decision:** do not continue tuning the same inner-grid/Josephus key schedule. The 55-step sequence and 180-cell interior remain meaningful source-linked structures, but another independently motivated consumer is required. This negative does not reject other permutations, transformations or semantic readings of the interior.

## Direct consumer tested: assigning p56's authentic prime-totient stream by the Josephus path

The forward Josephus elimination pairs **each of the 55 p57 interior runes with exactly one of the 55 rune-bearing unknown pages**. An obvious source-specified consumer is the **actual solved p56 encryption rule**, where consecutive ordinary prime totients form the additive GP29 key and plaintext F bypasses encryption. Try three literal ways to turn the source rune at each removal into the destination page's first ordinary prime **ordinal**: its GP index, its associated GP prime value, or the associated full totient. Each page's key begins at that index and the local cipher begins with its first runic symbol. These are distinct from the prior natural physical-page-ordered 55-source-seed test because the complete **Josephus page permutation is now fixed**.

The plaintext-F bypass could otherwise introduce many unknown key-clock masks. However the entire *prefix before the first observed ciphertext F* on each page is **unambiguous** under the genuine p56 rule: there cannot have been a plaintext F before that point, because it would have appeared literally as ciphertext F. This allows a fixed-input original-cipher test without language-fitted skip positions. The complete 55-page set contributes **1,441 original ciphertext runes before their respective first F**.

| Source-p57 interior key ordinal assigned to its Josephus-eliminated page | Unambiguous 1,441-rune decoded IoC |
| --- | ---: |
| GP rune index 0–28 | **0.0346875241** |
| GP prime value | **0.0347019816** |
| GP prime totient | **0.0345265633** |

The native GP29 uniform-register benchmark is about 0.03448. The first unambiguous decoded p0 strings under these three schedules are respectively `CAETHXPLY`, `HYCSEOMAE`, and `XUWMEAEIA`. **The same implementation's true historical p56 positive** begins with a 35-rune F-free interval that decodes exactly to `ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETH` under the original start-prime2 state. The original unknown pages exhibit no corresponding English-like recovery across their 1,441 unambiguous GP runes, even before any F mask optimization.

**Decision:** the source-ordered Josephus assignment itself is an exact possible map, but **direct p56 additive prime-totient clocks** seeded by the three straightforward per-page rune values have not recovered unknown plaintext. This is a bounded finite test of that historically authenticated consumer, independent of any choice of later literal-F bypass. It does not exclude a distinct table-selected clock, different alphabet/register, byte payload, encrypted state or source-selected downstream key.

## Josephus removal rank as a per-page prime-totient starting ordinal

The prior direct consumer assigned each page the p56 prime-totient clock start derived from its corresponding p57 source rune (GP index, prime value, or totient). A distinct, equally simple ordinal is the page's **position in the 55-page Josephus removal order**: the first removed page starts at ordinary prime ordinal 0 (prime 2, matching the authenticated p56 start), the second at ordinal 1, and so on. The physical page number is a natural control. This tests a page-level clock schedule without fitting a key or guessing plaintext-F positions.

The [standalone SFT](../sims/lp2_parable55_josephus_rank_prime_start_gate.cjs) recomputes the exact p57 55 word-interior totients and forward 56-page Josephus order (p50 survives; the first removed pages are p39, p49, p35, p43, p8). For each of the 55 removed pages it decrypts only the unambiguous ciphertext prefix **before the first ciphertext F**, because the authentic p56 rule makes later key consumption ambiguous without knowing whether an F is literal plaintext. Both zero- and one-based Josephus ranks and physical page numbers are tested, alongside the three earlier source-rune schedules. The 55 page prefixes contain **1,441 runes**. The authenticated p56 positive control independently recovers its exact 35-rune pre-F prefix, **ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETH**.

**Result:** the rank-0-based schedule gives IoC **0.034342** and Shakespeare-GP29 bigram score **−6.897**; rank-1-based gives **0.034421 / −6.967**. Physical-page-number starts give **0.034569 / −7.065** (zero-based) and **0.034556 / −7.140** (one-based). The three earlier source-rune schedules remain similarly uniform (IoC **0.03453–0.03470**). By contrast, the 35-rune p56 known-answer control scores IoC **0.092437** and bigram **−3.375** under the same prefix-scoring convention. The p0 prefix under rank-0-based starts is **DEOHESYA**, not English.

**Decision:** reject the direct Josephus-rank and physical-page-number prime-start schedules as p56-cipher consumers. The p50 navigation result remains a conditional selector, not a decryption. Do not tune offsets, F masks or page-specific starts around these negative outputs.

## Cryptanalytic decision

These two finite interpretations share a concrete possible human route: the simpler circular walk ends on **the first numerical-table page p49**, and the Josephus elimination leaves **the unique rune-free middle page p50**. Together they direct attention to the same **256-cell table** already analyzed in [the complete GF29 factorization](lp2-grid-complete-gf29-factorization.md). It also gives an entire deterministic ordering of all other original pages, which may matter for a page-level reading or key schedule. The one known page-selection output is independent of the **12,956 still encrypted runes**. The new route does not by itself dictate how to decode the table, assign its bytes to words/pages, or break those ciphertexts.

**Highest-value next decision:** find a *second* original author-visible instruction connecting the selected p50 numeric table and/or the 55-step removed-page order to an actual reversible operation. Lock that consumer before reading its unknown-page output. Useful consumers must make independent predictions using the established p56 plaintext or a truly withheld unknown interval; a direct textual result must be shown on untouched original ciphertext and re-encipher exactly. Prior failed direct table-to-plaintext, arbitrary phase, ring interpolation, source-polynomial quotient and deterministic 76-cell cyclic-ring collision-rejection attempts remain negative for their respective contracts. The p50 selection does not rescue any previously rejected decoder by itself.

**Execution check (14 November 2026):** the complete checked-in CommonJS SFT was executed against freshly fetched current main-branch copies of the three canonical repository source files (LP2 runes, punctuation and 256-cell table) using an equivalent V8 runtime with filesystem/assert shims. Every original-input assertion, the p56 known-answer prefix, the 1,441-rune three-key negative, both 55-rune direct table walk readouts, all 41 unshorn controls, the p49 ordinary ring endpoint, the p50 forward/reversed elimination, and the seeded 40,000 word-block shuffle assertions passed in that execution. This is direct current-source execution evidence, not an independently sourced ciphertext solution or a separate Node CI run.

**Source/reproduction:** [original GP29 page indices](../resources/liber-primus/lp2-corpus.json), [original punctuation and page57 word transcription](../resources/lp2-transcription.txt), [original 2013 audio source inventory](audio761-original-id3-frame-inventory.md), [2014 LP1 p05 primes/totient source (legacy `0_wisdom` path)](../resources/external/2013-0-wisdom-source.md), [signature-valid 2013 TCP-server specification](../resources/external/2013-tcp-server-signed-source.md), [2016 signed message record](../resources/cicada2016-4gq25.md), and [full read-only CJS positive/original/conditional-shuffle test](../sims/lp2_parable55_totient_josephus_p50_sft.cjs).
