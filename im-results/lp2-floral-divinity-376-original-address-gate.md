# LP2 floral 8×376 and table-byte address gate

**Decision (15 November 2026):** An eight-column numerical table inside LP2 pp40–53 and the solved p57 word DIVINITY motivate the exact **8×376 = 3,008** candidate chapter geometry. This supplies a reversible **376-position repeated-key hypothesis** and a direct **256-byte address-read hypothesis**. Both fail in their bounded original-input forms. No original unknown-page plaintext, author key or complete cipher mechanism is recovered. A more complex table instruction remains undecided.

## Original-input selection and constraints

- Original physical pp40–53 have **3,008 ciphertext runes**, counting the pp49/51 text and the rune-free p50 table. The initial p40 rubric is eight red runes: F N M Y G D AE H.
- Original clear GP29 p57 DIVINITY comprises the eight indices [23,10,1,10,9,10,16,26], written D I U I N I T Y in source spelling. GP prime values [89,31,3,31,29,31,59,103] add to **376**. A possible interpretation is eight presentations of 376 positions.
- The pp49–51 table is **32 rows × 8 columns**, its two-character cells derived as 256 base-60 integers from 0 through 255. Its eight columns are visible; its byte interpretation and consumer remain hypotheses. [Table](../resources/liber-primus/lp2-grid-256.json) · [ciphertext](../resources/liber-primus/lp2-corpus.json) · [red-ink annotations](../resources/liber-primus/lp2-ink-annotations.json) · [solved reference](../resources/liber-primus/lp1-plaintext-reference.txt).

The word-sum coincidence is selected retrospectively from available words and chapter lengths. Neither p57 nor the floral page layout supplies an author-authenticated instruction to use this word as a key or to read the table as addresses.

## Exact all-secret period-376 invariant

Suppose every 376-position phase is encoded with an unchanged independently arbitrary **injective GP29 mapping**, reused across all eight visits to that phase. This includes any 376-rune Vigenère/affine key and 376 independent secret alphabet substitutions. A bijective mapping forces ciphertext equality exactly when the corresponding plaintext runes are equal. Therefore the sum among the 376×C(8,2) = **10,528** same-position comparisons is independent of the unknown key.

| Input | Same-phase equalities / 10,528 |
| --- | ---: |
| **Untouched p40–53 ciphertext** | **369** |
| 529 consecutive 3,008-rune windows from solved-LP1 English, mapped to GP29 | **645–671** (median **656**) |
| One native-reference positive plaintext | **647** |
| Same positive after 376 independently keyed invertible affine GP29 maps | **647**, exact inverse |

The source reference is editor-normalized and the GP29 converter applies the documented original spelling conventions (ING, TH, V→U, etc.). The **529** English windows are a finite reference register, not a universal exclusion of unknown languages or byte streams. All exceed the original equal-pair count. Thus **unchanged 376-phase secret bijections on intact p40–53 cannot encode reference-style English**. Time-varying mappings, nonlinear state, altered boundaries and other registers remain unexcluded.

## Direct 256-table-address readout

Each grid cell at row r=0..31 and column c=0..7, whose derived byte is b, can naturally address a single rune in an eight-lane, 376-deep chapter. There are two exact competing layouts:

- **Interleaved 376×8 rows:** source index 8b+c.
- **Eight consecutive 376-rune lanes:** source index 376c+b.

All 256 addresses are valid for either layout on the original 3,008-rune chapter. Row-major or column-major output ordering preserves addressed indices. Under both layouts, **244 distinct indices** are accessed, with **12 duplicate address pairs** and **2,764 source runes unaddressed**. The direct read cannot be an invertible full-chapter permutation without a further authored operation.

The full-chapter 256-rune outputs have index of coincidence **0.03517157** (interleaved) and **0.03550858** (consecutive), compared with **0.06270997** for the authentic solved clear p57. Row/column order does not alter these values.

**Stronger original-red-heading consumer.** The original p40 rubric contains eight *distinct* GP runes; their increasing-rune order fixes the source key [0,4,7,1,2,5,6,3]. Excluding that exact eight-rune heading, the floral body has **3,000 = 8 × 375 runes**, and the same 32×8 table gives valid row addresses 0–255. This supplies a nonarbitrary historical-style columnar receiver without the weaker p57 prime-sum selection. Treat body ciphertext as eight consecutive 375-rune columns filled in sorted-heading order. For table cell (r,c) with byte b, read body index 375×rank(c)+b; its original row-major alternative is body index 8b+c. Both are valid and again address **244 unique source runes**. The complete original readouts remain nonprose: index of coincidence **0.03388480** for the rubric-sorted classical columnar receiver and **0.03367034** for literal row-major reception. Earlier [closed #657](https://github.com/FlareZ123/liber-primus/issues/657) tested the distinct full-3,000-runic columnar-then-grid-additive decoder, **not** these 256 extracted rune messages.

All six exact readouts and prefixes are printed by the [reproducible original-input SFT](../sims/lp2_floral_divinity_376_address_sft.cjs). No readable unknown plaintext or independent destination appeared; a planted-address extraction control checks source indexing, including duplicates. A separately encoded short side-message under a further source-selected transform remains untested.

## Research decision

Retire unchanged period-376 bijections on the unmodified floral chapter and the two simplest table-to-rune address reads. The eight-by-376 alignment remains a candidate clue, **not established historical design**. A future address mechanism must obtain an original-source instruction fixing its receiver, address update, orientation, stop rule and inverse before treating any table output as plaintext. Avoid tuning the same arbitrary 376-step family or assuming an unsupported p55 terminal handoff.

**Reproduction:** node sims/lp2_floral_divinity_376_address_sft.cjs. It uses canonical repository files and asserts every count, positive-control result and original key geometry. No automated CI trigger is necessary.
