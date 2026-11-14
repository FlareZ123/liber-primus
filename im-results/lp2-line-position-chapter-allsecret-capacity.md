# Source-visible line-reset GP29 alphabets: exact all-secret E-capacity gate

**Decision (14 November 2026, Agent46).** The unchanged 12,956 unknown LP2 runes cannot encode any of the 44 tested full-book GP29-native English reference passages under **one unknown, arbitrarily chosen 29-symbol bijective output alphabet for every repeated printed-line rune position**, even if **each of the nine original-image-visible chapters gets its own unrelated collection of such alphabets**. The proof is a source-only capacity upper bound, independent of every secret key; the passage comparison remains a finite language-register test. No original plaintext, key or full historical cipher is identified.

## Human-visible hypothesis and its serious alternative

A reader of the 2014 Liber Primus images sees repeated physical lines and nine red-marked chapter openings. Earlier Cicada stages already used line:character addressing, while the solved p56 uses a changing position-dependent modulo29 shift. A simple alternate mechanism would reset a moving GP29 alphabet to its initial state at every new **printed line**. A richer variant independently rekeys at the nine visible chapter starts, preserving the same position clock inside each chapter. These are motivated but **not authored instructions**.

The proposed entire family is

    C[chapter, line, j] = permutation[chapter,j](P[chapter,line,j])

where each output mapping is an arbitrary, unknown GP29 bijection; all columns and chapters are allowed unrelated keys. A line-reset Caesar/Vigenere pad is a strict subset. Printed words may wrap physical lines, so a line is a layout unit, not necessarily a word. A different line key, evolving state or alternative plaintext register is an independent surviving explanation.

This differs from the [independent line-alphabet gate](lp2-line-word-local-allsecret-bijection-gate.md), which allowed one arbitrary permutation per line and tested **within-line** equality. Here the same unknown alphabet is reused **across different lines at the same column**, and the invariant measures that cross-line reuse. It also differs from the [reused chapter-start keystream gate](lp2-global-original-visual-section-map.md), which aligns whole chapters continuously rather than resetting every printed line.

## All-key capacity: original 1,177 versus native controls at least 1,458

For any fixed chapter g and printed-line rune column j, let n[g,j,r] count original ciphertext symbol r at that location across all original printed lines. If a particular plaintext rune, e.g. E, is mapped to a unique ciphertext symbol by a bijection, that rune can occupy **at most max(r) n[g,j,r]** of those positions, regardless of the hidden bijection. Summing over disjoint groups and columns gives the exact global capacity

    M = sum[g,j] max[r] n[g,j,r].

This bound holds simultaneously for **every** choice among the 29! possible permutations per group/column and every possible key schedule in this repeated-line-position family. The independently observable equal-symbol-pair count across the same group/column slots is also unchanged by all these unknown permutations.

From the verbatim canonical p0–p55 runes and printed-line separators (physical p50 has no runes):

| Hidden-alphabet scope | Original same-rune pairs / eligible cross-line pairs | Rate | Maximum possible copies of any one plaintext rune |
| --- | ---: | ---: | ---: |
| One independent bijection per book-wide printed-line column | 126,508 / 3,638,562 | 0.03476868059 | **684** |
| One independent bijection per *visual chapter* × printed-line column | 17,600 / 503,168 | 0.03497837700 | **1,177** |

The nine exact chapter capacities, in original physical-page order, are **88, 114, 152, 158, 108, 130, 146, 226, 55**. The original has 594 printed rune lines partitioned into **33, 55, 79, 86, 46, 65, 80, 135, 15**, matching the separately established visible chapter rune lengths **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, 308**. The union is the unchanged original 12,956-rune tape, checked against the canonical numerical source, not an inferred transcription.

Controls normalize three previously used, locally retained English sources to GP29 with the repository's ordinary `QU→CW, V→U, K/Q→C, Z→S, ING→NG` rules. To test source spelling, a second complete control pass additionally collapses IO into the source-attested IA rune. In each mode we take consecutive **nonoverlapping full 12,956-rune windows** and impose the exact original 594 line lengths and nine chapter allocations. Counts of plaintext E are independent of this resegmentation.

| Reference | Full-book windows per spelling mode | Minimum E count, legacy IO | Minimum E count, source-attested IO |
| --- | ---: | ---: | ---: |
| Gibran | 4 | 1,468 | 1,474 |
| Shakespeare | 16 | **1,458** | 1,465 |
| Emerson | 24 | 1,489 | 1,510 |

Thus **0 of 44** original-length English passages in either spelling mode falls below the original **1,177** upper bound. Their chapter-position collision rates also all exceed the original **0.034978377** (minimum **0.05822906**, for the legacy-IO native sample), independently agreeing with the capacity obstruction. These 44 are different segments from three literary sources, not 44 independent authors or proof about all GP English.

## Minimum additional page-boundary rekeys: seven

A source-visible nine-chapter split is not the only possible reuse clock. To grant the hypothesis a fairer case without inventing sub-line reset coordinates, allow further independent positional alphabets at **any original physical-page boundary inside each chapter**, with the nine chapter boundaries still mandatory. Dynamic programming maximizes the E capacity over **every** contiguous partition of the 55 rune-bearing source pages into k secret domains. The exact recurrence searches all legal end pages and composes the nine independent chapter frontiers; it does not choose reset positions by plaintext scoring.

| Independent page-contiguous line-position key domains k | Highest possible copies of a single plaintext symbol |
| ---: | ---: |
| 9 (only visible chapter starts) | 1,177 |
| 10 | 1,231 |
| 11 | 1,279 |
| 12 | 1,326 |
| 13 | 1,368 |
| 14 | 1,410 |
| **15** | **1,451** |
| **16** | **1,490** |

The strongest possible 15-domain secret partition still cannot represent even **1,458** E runes, the least E-rich of the 44 GP-English controls. **At least 16 separate positional-alphabet domains, i.e. at least seven additional otherwise unselected intra-chapter page breaks, are necessary** under this architecture and register. This bound grants the *most favorable of all hidden page-boundary choices*, not the nine author-marked boundaries alone. At k=16 the E-count obstruction disappears but no plaintext or cipher emerges; the stronger equality and word constraints would still need independent tests. The source-derived p15 4×4 square also has sixteen cells, but nothing in the original links those cells to page breakpoints, and their numerical coincidence is not a key selector.

A concrete maximizing 16-domain partition ends groups on physical pages **2, 7, 10, 14, 16, 22, 26, 28, 32, 34, 37, 39, 45, 48, 53, 55**. These are *optimization output*, not alleged authorial marks. The [single-file SFT](../sims/lp2_linepos_chapter_allsecret_capacity_sft.cjs) asserts the entire 9–16 frontier, enumerates the three-page chapter brute force as an independent DP control, and passed on [Windows Node22, manual workflow 43571960532](https://github.com/FlareZ123/liber-primus/actions/runs/43571960532).

## Independent Latin and Old English registers

A ciphertext exclusion limited to modern English would miss two plausible authorial registers: the manuscript's Latin name and its historically Anglo-Saxon/Futhorc rune vocabulary. Two already independently pinned GP29-native source corpora therefore supply further *whole-tape* controls, with no new output alphabet or secret key selected from the ciphertext.

| Independently GP29-encoded source | Nonoverlapping 12,956-rune windows | Minimum E runes | Minimum chapter-position equal-pair rate |
| --- | ---: | ---: | ---: |
| Latin Vulgate New Testament (39,835 source words, 204,802 GP29 runes) | **15** | **1,381** | **0.07400113** |
| Corrected source-native Old English *Beowulf* (48,012 GP29 runes) | **3** | **1,480** | **0.05619992** |

The Vulgate control reads the exact checked-in base29 encoded GP rune words using the documented `0123456789ABCDEFGHIJKLMNOPQRS` digits. The independent Old English control reads the corrected checked-in `sourceGpBase29` with its own explicitly declared 29-character `positiveControlAlphabet`; the fixed source count **5,630 E among 48,012 GP runes** is asserted. These formats differ, and substituting one alphabet for the other would produce false results. Both streams are overlaid on the **unchanged original nine chapter and 594 line lengths**.

Thus **0 of 62 full-manuscript windows** across modern English, Old English and Latin falls below the original **1,177** E capacity. At most thirteen independent page-contiguous line-reset alphabet domains can represent only **1,368** E, so Latin controls require **at least fourteen** such domains (five extra unmarked resets). Old English controls require **at least sixteen**, as for the original 44 modern-English controls. These are finite comparisons with pinned literary corpora, not statements about every conceivable Latin or Old English manuscript. No authentic plaintext or ciphertext key emerges.

## Printed-word-shape-preserving English controls

As a stricter alternative to taking contiguous native-English excerpts, preserve **every one of the original 2,896 printed word lengths**, including the manuscript's cross-line and cross-page word carries. At each original word site, independently sample a word of exactly that GP29 length from the corresponding Shakespeare, Gibran, or Emerson control after the source-attested IO→IA normalization. This keeps the **original 12,956-rune total, 594 printed-line lengths, and all nine chapter boundaries** without inferring any plaintext segmentation from ciphertext. A fixed LCG seed `0x3301aa6d` reproduces 500 complete books per author.

| Native GP29 word pool | Complete source-shaped book plants | Smallest E count in any book |
| --- | ---: | ---: |
| Shakespeare | 500 | **1,451** |
| Gibran | 500 | **1,454** |
| Emerson | 500 | **1,464** |

Every one of the **1,500** books exceeds the original 1,177-E chapter-column capacity, and every matching-position collision rate is above the original 0.034978377. This rejects the possibility that the earlier full-book control failure was merely due to failing to match the manuscript's unusual word-length distribution. The **1,451** minimum is just below the least-E 1,458 contiguous source passage, but it remains above the exhaustive 15-domain page-reset limit of **1,451** only at equality: the word-shaped controls strictly exclude the original **nine-domain** model, while the **at least sixteen-domain** statement remains calibrated to the 44 contiguous-English or the three Old English passages. It would overstate the word-matched result to say all 1,500 independently prove sixteen domains necessary; one sampled word-shaped book might meet the optimistic 15-domain E capacity exactly.

All 1,500 matching-word trials, the 62 contiguous English/Latin/Old-English passages, the exact original-source capacity dynamic program and both 12,956-rune secret-key positive plants passed on **Windows / Node.js 22** in [read-only CI run 43572671518](https://github.com/FlareZ123/liber-primus/actions/runs/43572671518).

## Original red-thirteen-dot punctuation as a second key reset

The manuscript supplies a stronger human-visible restart cue than bare printed lines: **27 red 13-dot terminal marks on unknown pages p0–55** (the remaining 3 of the complete 30-marker annotation inventory are on independently solved p56/p57). Grant the line-alphabet hypothesis a *literal additional reset immediately after each red13* while still resetting at every printed line and at the nine visible chapter starts. Eleven of those 27 marks actually interrupt a rune-bearing physical printed line; the remainder coincide with existing line endings and do not alter the clock. The fixed original now has **605 source-visible key-clock segments**, rather than 594 lines.

The recomputed exact all-secret cross-segment equality invariant is **17,647 / 503,465 = 0.03505109591**, and the maximum single-plaintext-rune capacity is **still precisely 1,177**. Thus even allowing those original red13 interrupters to start new position-indexed keys does **not** relax the English, Old English or Latin capacity obstruction. This is a motivated source-specific variant of the same no-go family, with all marker sites taken verbatim from the existing original-JPEG ink annotations; it does not select a nonstationary cipher or permit other independent secret resets. The SFT now verifies the 27 original-unknown-page marks, 11 interior linebreak sites, exact 12,956-rune preservation and marked equality invariant; [Windows Node22 successful run 43573873564](https://github.com/FlareZ123/liber-primus/actions/runs/43573873564).

## Exact implementation and positive control

[Source-exact CommonJS SFT](../sims/lp2_linepos_chapter_allsecret_capacity_sft.cjs) parses the original 55 rune-bearing physical-page transcriptions, preserves the 594 printed line breaks, confirms both the 12,956-rune original and the nine source-visible chapter sizes, recomputes every capacity and equality invariant, and runs both English spellings. Its second phase encrypts a complete 12,956-rune native-GP positive plant with **independent arbitrary 29! keys at every book-wide line position** and then with **independent arbitrary 29! keys at every chapter-specific line position**. It verifies 12,956/12,956 exact key-known decoding and unchanged original-family invariants. No special key, rune or phase is chosen from the original language score.

The test eliminates the entire **reused position-column bijective family** under the stated GP-native English reference register and literal printed-line boundaries, including all unknown output alphabets and chapter-specific choices. It does **not** exclude separately keyed physical lines/pages, per-line nonce or feedback, text with atypically few E runes, plaintext in a different alphabet/register, lossless intermediate binary transport, or a source-selected operation that changes the printed-line clock. The independent missing ingredient remains an original clue that selects an actual reversible operation, recoverable key/state and candidate plaintext. Do not expand this family by arbitrary key searches; they cannot change the proven bound.
