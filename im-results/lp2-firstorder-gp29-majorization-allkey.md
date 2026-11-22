# Original LP2 predecessor GP29: new top-twelve extension of prior all-secret gate

**Decision, Agent21, 13 November 2026:** For any direct reversible GP29-to-GP29 substitution with its entire changing state limited to the immediately previous **ciphertext rune**, the original 12,956 unsolved LP2 runes impose an exact, key-independent frequency upper bound on every possible plaintext. The restriction still holds when separate secret 29-symbol permutation tables are allowed for **each of nine source-visible visual chapters**, with either original page or whole-word resets. The strongest of those visual-chapter models can output no more than **1,269 copies of any single rune (9.79469%)** and no more than **9,006 occurrences among its 12 most common runes (69.51220%)**.

For comparison, an independently solved LP1 source-English GP transliteration has **406/3,287 E runes (12.35169%)**, and **2,552/3,287 occurrences of its twelve most frequent runes (77.63918%)**. Therefore the entire specified all-secret first-order cipher family is incompatible with plaintext possessing those ordinary authentic-Cicada English proportions over the 12,956 source positions. This does **not** imply a universal proof that all conceivable English distributions are excluded, and it recovers no unknown plaintext or authentic key. The exact unconditional conclusion is the numerical frequency bound.

[Passing source plus 5,623 native-window CI run 43380890708](https://github.com/FlareZ123/liber-primus/actions/runs/43380890708) · [Complete CommonJS SFT](../sims/lp2_firstorder_gp29_capacity_sft.cjs) · [Prior 16-symbol source-alphabet capacity gate](lp2-alternative-register-source-gate.md#12-november-2026-source-visible-chapter-alphabet-capacity-test-480).

## Original source and the competing chapter maps

Use the unchanged 55 rune-bearing physical pages p0–p55 of `resources/liber-primus/lp2-corpus.json` (numeric-only p50 has no rune). The complete 12,956-rune stream is checked exactly against the authoritative physical transcript's **2,896 printed whole words**. All original page and word boundaries are treated as visible segmentation choices, with no fitted resets or hidden key information.

Two independently source-addressable nine-interval maps are deliberately tested rather than conflated. The **top-level physical visual chapters**, beginning at pages `[0,3,8,15,23,27,33,40,54]`, have original rune cuts `[0,729,1874,3603,5506,6527,7960,9640,12648,12956]`. A distinct **nine red-heading derivative text partition**, using internal red headings on p15 offset9 and p33 offset91 and no separate final p54–55 chapter, has cuts `[0,729,1874,3612,5506,6527,7960,8051,9640,12956]`. All nine of its initial red offsets are explicitly checked against `resources/liber-primus/lp2-ink-annotations.json`. The physical visual map is the more plausible human-visible top-level segmentation and also gives a *more generous* bound.

The source does **not** command this predecessor-state substitution, a per-chapter secret table, or a page/word reset. These are all-secret architectural tests, not a proposed authentic decoder.

## Exact all-key proof

Fix one permitted chapter and a specified reset schedule. At position i, assume `C[i] = pi_s(P[i])`, where `pi_s` is an arbitrary unknown bijection of 29 symbols, and `s` is exactly the immediately preceding **ciphertext** rune (or a special source-boundary sentinel). A given state must use the **same** bijection at every one of its occurrences within that chapter. Let `N[s,c]` count observations where ciphertext output c follows state s.

For **any** selected set of k distinct plaintext rune types, their ciphertext images under `pi_s` are exactly k distinct values within each state. Therefore their combined original plaintext occurrence count cannot exceed the sum of the k largest observations in that state's row `N[s,*]`. Sum this inequality over all states and independent chapters. The resulting capacity `B[k]` is a tight maximum for each fixed k when the per-state bijections are free. No key enumeration, word-frequency heuristic, original plaintext assumption, or English score is needed. Reversible models with unknown initialization still obey this bound only when their initialization/reset sentinel and state definition are exactly as stipulated. A different hidden state is outside scope.

| Frozen original state family | Maximum top 1 | Maximum top 2 | Maximum top 12 |
|---|---:|---:|---:|
| Single shared table, entire stream | 717 | 1,365 | 6,769 |
| Single shared table, page reset | 719 | 1,368 | 6,784 |
| Single shared table, whole-word reset | 695 | 1,318 | 6,671 |
| Nine red-heading text tables, continuous | 1,253 | 2,285 | 8,886 |
| Nine red-heading tables, page reset | 1,256 | 2,296 | 8,911 |
| Nine red-heading tables, word reset | 1,226 | 2,246 | 8,767 |
| **Nine top-level visual chapter tables, continuous** | **1,267** | **2,303** | **8,982** |
| **Nine visual chapter tables, page reset** | **1,269** | **2,314** | **9,006** |
| **Nine visual chapter tables, word reset** | **1,237** | **2,260** | **8,852** |

The authorial LP1 comparison is source-specific: the checked-in solved, editorial-normalized reference is encoded using the fixed GP29 multigraphs and established K→C, V→U and Z→S spelling; its 3,287-rune sample has an E frequency of 12.35169% and top-twelve frequency of 77.63918%. Applied proportionally to the 12,956-rune unknown corpus, that would imply approximately **1,600 E** and **10,059 top-twelve** positions, respectively, both strictly above the most permissive original-source bound. This comparison illustrates what types of plaintext are excluded; it is not a claim that the unknown pages have those exact statistics.

## Independent historically linked full-length English control

A second source with actual historical relevance to Cicada's earlier rounds is the public-domain **1906 English edition of William Blake's *The Marriage of Heaven and Hell***, already frozen in `resources/external/blake-marriage-1906-gutenberg45315.txt` (Git blob SHA-1 `fc503b01bbedbec4e0c8b3d1ded311bed8e28874`). This control was selected by the known LP1/2012 Blake quotation history, not by a partial match to unknown ciphertext. The same frozen GP29 multigraph priority and original K→C, V→U, Z→S normalization are applied. The existing standard normalizer excludes a literal editorial bracketed insertion `[the]`, producing exactly **18,578 GP29 runes**, with **2,346 E** and **14,369 of the top twelve**; global frequencies are approximately **12.627% E and 77.344% top twelve**.

Slide a complete **12,956-rune window** across every possible source offset. The exhaustive **5,623** contiguous, exactly original-length GP-Blake windows give:

| Statistic | Smallest of all 5,623 windows | Largest | Required original-cipher maximum |
|---|---:|---:|---:|
| E count | **1,607** | 1,665 | **1,269** |
| Twelve most abundant rune count | **9,974** | 10,061 | **9,006** |

**0/5,623** source-native windows satisfy either first-order capacity condition, even with nine independent visual-chapter secret tables and fixed page resets. This matched-length all-window test is stronger than extrapolating a short LP1 average. It establishes a second, finite corpus exclusion of a historically motivated English style. It cannot exclude unknown English prose written with an unusually low E concentration or flatter unigram distribution, nor any cipher with richer state. The exact 1906 input and complete sliding control are checked by the same [passing native source CI](https://github.com/FlareZ123/liber-primus/actions/runs/43380890708).

## Independent two-history countermodel and controls

The exact same count method permits a source-ciphertext state of **two** previous ciphertext runes instead of one, with two fixed start sentinels. For a whole-stream shared state table it yields **842 observed states** and bounds top1 **2,021**, top12 **12,034**; at each physical page reset the corresponding numbers are **865 states**, top1 **2,041**, top12 **12,044**. Both permit the authentic LP1-like language frequencies. This is a genuinely distinct rival architecture that survives this bound, **not evidence that it is correct**. Independent per-chapter two-history tables are even less constrained.

The SFT checks exact original source stream integrity and every stated chapter-start rune offset, and builds each complete `N[s,c]` table without fitting a secret key. It also runs a full 12,956-rune artificial **reversible first-order affine-permutation positive plant** with 30 source-independent state maps, verifying the planted plaintext after inversion and showing each planted top-k count lies below the theoretical maximum for its generated ciphertext. This control confirms the arithmetic and inversion, not an unknown-page decryption. The original-source GitHub Actions run executes all these assertions on Node 22.

## Prior first-order GP29 source work and the new limit

The existing [12 November first-order GP29 29!-secret predecessor gate](lp2_chapter_predecessor_allsecret_capacity.md) already derived key-independent one- and two-letter bounds under nine independently keyed visual chapters. It established **1,310** possible copies of any one plaintext rune and **2,344** of any two with all **55 physical page-opening symbols independently unconstrained**, then rejected **653,512** p0-length native-source windows by exact per-state bijection. The source and state architecture are prior work. This separate contribution is the previously unreported **full top-k majorization**, especially **B12=9,006** under the *same* fully unconstrained 55-page-head model, plus an alternative nine-red-heading segmentation and a fifth, Blake-specific set of **5,623** full-length windows. Top-twelve Blake counts never fall below **9,974**, so all fail this new bound.

The fixed sentinel variant shown above gives the stricter top-one **1,269** count, and its source-independent first-order model is a *subset* of the fully unconstrained free-page-head model. Thus its top-one value must not be mistaken for the general upper bound of **1,310**. Even granting an independent word-start flag at every original transition enlarges the all-secret B12 bound to **10,086**, so the top-twelve exclusion does not cover that richer state. The earlier report's exact original p0 comparison remains the stronger finite-corpus check for the word-boundary-flag case. Models with two-rune history, changing secret clocks, and non-native GP text are also outside scope.

## Decisive research implication

The original LP2 ciphertext is inconsistent with **all** native-GP29, one-symbol direct-substitution ciphers of this first-order fixed-state family **for any plaintext whose highest rune concentration exceeds the relevant source-bound threshold**, including the authentic solved-LP1 English proportions. This strengthens the previous 16-symbol source-register bound: the present result allows a full 29-symbol alphabet and unrestricted secret permutations of it, yet still excludes source-native English-like output.

A plausible direct-symbol solution must either specify additional changing state (second previous rune, an independently keyed clock or more), use another plaintext representation (including compression or variable-length coding), or explain a substantially flatter-than-solved-LP1 original plaintext distribution. None of those escapes is an author-selected inverse by itself. Future work should demand a source clue specifying the richer state/key and a held-out original prediction, rather than fitting free permutation tables to the already-observed ciphertext.
