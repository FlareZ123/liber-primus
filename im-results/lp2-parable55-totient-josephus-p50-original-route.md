# PARABLE word-interior totients navigate to the numerical table under two finite 56-page counts

**Original-source result, 14 November 2026, Agent 32.** The exact 55-rune word interiors of the solved PARABLE supply a single ordered GP-prime-totient step list. Under the simpler **ordinary clockwise 56-page ring walk**, counting the starting page as step one on every hop **without removing pages**, this list ends on physical **p49**, exactly where the 256-cell numerical table begins. With the same steps and count-one convention, the stricter **Josephus remove-as-you-go** reading instead leaves **p50**, the sole rune-free central numerical-table page, even when the 55 steps are reversed. These are two explicit author-clue-motivated interpretations converging on **the same three-page table spread p49–p51**; the counting operators and ring choice remain hypotheses, **not an authenticated original instruction, recovered key or decrypted unknown text**.

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

## Cryptanalytic decision

These two finite interpretations share a concrete possible human route: the simpler circular walk ends on **the first numerical-table page p49**, and the Josephus elimination leaves **the unique rune-free middle page p50**. Together they direct attention to the same **256-cell table** already analyzed in [the complete GF29 factorization](lp2-grid-complete-gf29-factorization.md). It also gives an entire deterministic ordering of all other original pages, which may matter for a page-level reading or key schedule. The one known page-selection output is independent of the **12,956 still encrypted runes**. The new route does not by itself dictate how to decode the table, assign its bytes to words/pages, or break those ciphertexts.

**Highest-value next decision:** find a *second* original author-visible instruction connecting the selected p50 numeric table and/or the 55-step removed-page order to an actual reversible operation. Lock that consumer before reading its unknown-page output. Useful consumers must make independent predictions using the established p56 plaintext or a truly withheld unknown interval; a direct textual result must be shown on untouched original ciphertext and re-encipher exactly. Prior failed direct table-to-plaintext, arbitrary phase, ring interpolation and source-polynomial quotient attempts remain negative for their respective contracts. The p50 selection does not rescue any previously rejected decoder by itself.

**Source/reproduction:** [original GP29 page indices](../resources/liber-primus/lp2-corpus.json), [original punctuation and page57 word transcription](../resources/lp2-transcription.txt), [original 2013 audio source inventory](audio761-original-id3-frame-inventory.md), [2014 LP1 p05 primes/totient source (legacy `0_wisdom` path)](../resources/external/2013-0-wisdom-source.md), [signature-valid 2013 TCP-server specification](../resources/external/2013-tcp-server-signed-source.md), [2016 signed message record](../resources/cicada2016-4gq25.md), and [full read-only CJS positive/original/conditional-shuffle test](../sims/lp2_parable55_totient_josephus_p50_sft.cjs).
