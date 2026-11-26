# Fixed injective whole-word codebook: exact order-free multiplicity gate (#2935)

## Decision

A deterministic injective codeword for each complete native plaintext GP29 word, shared across a book or chosen privately for each of nine visual chapters, preserves its multiset of word repetition multiplicities under **every whole-word permutation**, even when ciphertext word lengths are unrestricted. The actual LP2 printed groups violate this condition in every one of the 1,437,102 length-in-word-count matched contiguous literary windows, 416 windows within individual solved source records, and 3773 descriptive windows crossing potentially artificial joins in the concatenated solved reference. Both length-free and length-preserving exact profile matches are zero. This is an all-key rejection for the finite source register and assumes the printed groups are intact word codewords. It does not reject moving-cursor historical book code, homophones, decoys, or all possible plaintexts. No unknown plaintext/key recovered. The later #3048 ordered page-private extension below also rejects all 134,443 full-length literary windows, while showing only four within-page repeat opportunities in the original.

## Proof and operational implication

For plaintext word type w, let n(w) be its occurrence count. For a fixed injection f, the ciphertext type f(w) has exactly n(w) occurrences regardless of the ordering of the word tokens. Thus the histograms H(k)=#{w:n(w)=k} and, if lengths are preserved, H(l,k)=#{w:len(w)=l,n(w)=k} are necessary and sufficient for an unrestricted bijection between the observed types and corresponding word multisets. They do not identify the intended mapping or order. Equal-type token pairs E=sum_w n(w)(n(w)-1)/2, maximum multiplicity M, and distinct type count D are simple projections. A deterministic noninjective sender can only decrease D and increase E; the observed discrepancies in D/E therefore also reject that broader sender for these same windows.

Unlike the previous [word-internal equality](lp2-wordinner-equality-multiplicity-allsecret-gate.md), this proof compares complete repeated tokens, requiring no within-word letter mapping. Unlike the [variable-length rune codebook](lp2-ninechapter-codebook-original-substring-matching-gate.md), the codebook can assign any complete ciphertext word independently of its letters. Unlike [W1](lp2-r45-word-order-independent.md), it assumes no ordered language grammar. The historical [moving cursor](cicada-organizer-bookcode-consumption-convention-gate.md) explicitly gives different references to the same word; it is outside this model and is a distinct follow-up.

## Source and experiment

[Reproducer](../sims/lp2_fixed_wholeword_multiplicity_sft.cjs) · [raw exact profiles and input blob pins](lp2-fixed-wholeword-multiplicity-output.json). Remove /, %, and whitespace from corrected image transcription while retaining physical page and rune offsets; maximal GP29 runs give 2,896 groups, 12,956 runes, 32 cross-page carries. All 58 physical page rune arrays exactly match the canonical JSON. Use the established visual offsets 0,729,1874,3603,5506,6527,7960,9640,12648,12956. Compare to actual published GP solved source strings and four repository literary texts (Emerson, Gibran, Shakespeare, Blake); literary tokenization strips Gutenberg boilerplate when marked, strips internal apostrophes, uppercases, maps V→U, K/Q→C, Z→S, then greedily maps ING→NG and native digraphs TH EO NG OE AE IA EA. The underlying reference text bytes are pinned in the raw output. Nine solved-record plants independently pass both tests under reversed word order and arbitrary fixed injection; the length-preserving plants use explicit distinct GP29 codes of the same length, while length-free plants use indexed variable-length strings. The rolling histogram also passes all nine windows of a repeated toy tape. Executed the complete main function in connected V8; standalone Node/Windows CI not run. The 740-group source register is the published solved-record transcription, not the image-corrected 739-group combined manuscript; each authentic record is tested separately wherever long enough and artificial joins are flagged.

## Results

| Scope | Original tokens | Original D | Original M | Original E | Largest literary D | Smallest literary M | Smallest literary E | Literary windows |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| all | 2896 | 2731 | 5 | 230 | 1148 | 72 | 22699 | 134443 |
| 0 | 158 | 156 | 2 | 2 | 126 | 4 | 48 | 145395 |
| 1 | 255 | 252 | 2 | 3 | 180 | 6 | 139 | 145007 |
| 2 | 383 | 377 | 3 | 8 | 246 | 8 | 369 | 144495 |
| 3 | 437 | 430 | 2 | 7 | 273 | 9 | 488 | 144279 |
| 4 | 224 | 224 | 1 | 0 | 164 | 5 | 107 | 145131 |
| 5 | 326 | 320 | 3 | 7 | 220 | 7 | 257 | 144723 |
| 6 | 378 | 375 | 2 | 3 | 244 | 8 | 359 | 144515 |
| 7 | 669 | 662 | 2 | 7 | 382 | 16 | 1189 | 143351 |
| 8 | 66 | 66 | 1 | 0 | 64 | 2 | 2 | 145763 |

All literary windows have strictly fewer distinct types, more equal token pairs, and a greater maximum multiplicity than the corresponding original scope. The full book has 2,611 singleton types and 2,731 distinct types among 2,896 tokens, with just 230 unordered equal-token pairs. Four literary full-book ranges: Emerson D=900–1148, M=119–300, E=38095–80149; Gibran D=745–819, M=156–261, E=52765–79625; Shakespeare D=764–1011, M=72–138, E=22699–34397; Blake D=966–1009, M=200–274, E=46259–63132. Full original chapter 4 and chapter 8 have no repeated groups at all.

## Consequence for a recoverable homophonic receiver

Assume a deterministic receiver assigns each distinct ciphertext word to exactly one plaintext word, but the sender may choose different ciphertext references for the same plaintext word. For every tested full-book native window, D_P≤1148 and D_C=2731. Hence at least 1583 excess distinct code types (sum_w(number of used code types for w − 1)) must be explained by state or homophones. If trying to rescue a static one-code-per-word model by editing ciphertext tokens, at least 1583 individual token substitutions are necessary because one substitution can reduce the distinct count by at most one. Moreover M_P≥72 and M_C=5, so at least one plaintext type needs at least ceil(72/5)=15 distinct ciphertext code types. These bounds are simultaneous necessary conditions, not evidence that such a map exists. A stateful historical moving cursor is a more plausible mechanism to investigate than a static map with a few exceptions, but is not selected by this invariant.

No codebook key search is justified for the rejected family. A new receiver must explain how the reference choice changes, or why printed groups are not true words. No general language impossibility is asserted.

## Page-private ordered dictionary extension (#3048, Agent1, 26 November 2026)

**Decision:** the finite pinned donor register cannot explain original LP2 even if a fresh arbitrary injective complete-word codebook is allowed at every physical page. Page-local equality constraints are drastically weaker than the book/chapter invariants, but all 134,443 complete ordered literary donor windows fail, and 32 of 55 rune-bearing pages fail even the independent arbitrary-donor-window relaxation. No unknown plaintext or key. A page-private codebook for arbitrary new prose is not excluded, but offers almost no repeat-based prediction without an independently sourced table-generation rule.

### Exact ordered equivalence, including page carries

Use the image-corrected 2,896 complete groups (12,956 runes, 32 cross-page words). Assign each complete group to the physical page on which it starts; skip the number-only p50. Every canonical physical rune array is reproduced exactly. For a sequence x, define D_x(i)=0 if the token is new, otherwise the distance to its previous occurrence. Two equal-length sequences admit an unrestricted bijection between their observed word types iff their previous-occurrence encodings are identical. For a global donor previous-distance value t at window-local position j, a pattern value p matches precisely when p>0 and t=p, or p=0 and (t=0 or t>j). This accounts for a donor occurrence before the page/window start.

Parameterized KMP uses the same predicate on the pattern's own previous-distance stream to build its prefix-failure table, then scans each donor in linear time. It agrees with the naive local-reencoding window matcher in every one of 264,627 exhaustive ternary pattern/text cases (pattern lengths1–5, text length6). Full-source feasibility intersects each page's matching start positions after subtraction of the cumulative previous page group count. This preserves exact printed page order and native donor adjacency while allowing a different arbitrary table on every page.

### Original results

The original has only **four within-page repeat occurrences, in four repeated classes**: p7, p10, p19, p45. All other 51 rune-bearing pages have no repeats. The four repeat-bearing pages have **zero** exact matches across the nine individually solved records, their descriptive concatenation, and the four literary sources. Of 55 pages, 32 have no match anywhere in this register even when different pages may select unrelated donor locations. The other 23 pages have at least one match, but all 23 consist entirely of distinct ciphertext words. For example p11/p21/p39/p40 each has one donor-window match; uniqueness in this finite pool reflects the rarity of an all-distinct 55-word window and establishes no plaintext. Short p55 has 37,748 candidate donor windows and no repeated class. The all-distinct pattern is invariant to arbitrary rearrangement of its ciphertext groups.

| Donor | Ordered full-length windows | Original exact matches |
|---|---:|---:|
| Emerson | 71,817 | 0 |
| Gibran | 9,647 | 0 |
| Shakespeare | 51,294 | 0 |
| Blake | 1,685 | 0 |
| **Total** | **134,443** | **0** |

Nine solved records and their descriptive concatenation are too short for a complete manuscript window, but were included in every eligible independent page scan. A seeded within-page shuffle of the original groups preserves local multiplicity and provides one matched shuffled-pattern control per page. Its full-window counts are likewise zero; the only change in individual matches is p7 (one shuffled match instead of zero). This demonstrates that most of the original constraint is local distinctness rather than identifying a particular word order; one shuffle per page is a descriptive control, not a significance estimate.

### Constructive matched-page controls and what is actually predictable

For each of the four literary donors, select a seeded contiguous 2,896-word interval, cut it into the exact 55 original page-start word counts, and relabel each page with a private injective table. The full matcher finds exactly one location in each complete donor, equal to the planted location. The original page-size geometry is matched, but the repeat distribution is naturally that of the donor, not LP2's extreme distinctness.

| Control | Correct unique full-window location | Repeated occurrences predicted from known first-occurrence mappings |
|---|---:|---:|
| Emerson | 20,827 | 767/767 |
| Gibran | 4,149 | 863/863 |
| Shakespeare | 16,541 | 567/567 |
| Blake | 787 | 664/664 |

The 2,861 repeated-occurrence checks demonstrate exact reuse of a known first-occurrence table, not blind word-identity recovery under an arbitrary unknown table. Unlike these plants, the original has no repeat-bearing page with an eligible donor. Singleton code classes permit arbitrary assignment to unused plaintext types; fitting those assignments supplies no independent predictive evidence. Cross-page reuse cannot be predicted by a private table unless a new shared generation rule is specified. The original finite ordered-donor gate is exact, but it cannot exclude a newly authored distinct-word-rich text, noninjective/heterophonic tables, H-shuffle or decoy segmentation.

[Reproducer](../sims/lp2_page_private_codebook_ordered_gate_sft.cjs) · [complete exact output and pinned source blobs](lp2-page-private-codebook-ordered-output.json) · [Director #3048](https://github.com/FlareZ123/liber-primus/issues/3048). The committed analysis function executed on repository inputs in connected V8; standalone Node wrapper was not separately run.

**Fork:** do not optimize independent page tables or claim a recovered word from one arbitrary all-singleton matching window. Reopen this mechanism only with an independent table generator or a source-linked donor yielding actual held-out word identity. The failure of the finite source register does not establish a generic encryption architecture.
