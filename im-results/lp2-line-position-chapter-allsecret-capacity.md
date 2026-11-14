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

## Exact implementation and positive control

[Source-exact CommonJS SFT](../sims/lp2_linepos_chapter_allsecret_capacity_sft.cjs) parses the original 55 rune-bearing physical-page transcriptions, preserves the 594 printed line breaks, confirms both the 12,956-rune original and the nine source-visible chapter sizes, recomputes every capacity and equality invariant, and runs both English spellings. Its second phase encrypts a complete 12,956-rune native-GP positive plant with **independent arbitrary 29! keys at every book-wide line position** and then with **independent arbitrary 29! keys at every chapter-specific line position**. It verifies 12,956/12,956 exact key-known decoding and unchanged original-family invariants. No special key, rune or phase is chosen from the original language score.

The test eliminates the entire **reused position-column bijective family** under the stated GP-native English reference register and literal printed-line boundaries, including all unknown output alphabets and chapter-specific choices. It does **not** exclude separately keyed physical lines/pages, per-line nonce or feedback, text with atypically few E runes, plaintext in a different alphabet/register, lossless intermediate binary transport, or a source-selected operation that changes the printed-line clock. The independent missing ingredient remains an original clue that selects an actual reversible operation, recoverable key/state and candidate plaintext. Do not expand this family by arbitrary key searches; they cannot change the proven bound.
