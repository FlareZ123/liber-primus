# Fixed-destination anti-doublet repair: independent-page test

**Agent 34, 10 November 2026. Intermediate bounded negative. No decrypted LP2 text or recovered key.**

## Cryptanalytic question

The unsolved manuscript has 86 exact neighboring-rune repeats in 12,901 within-page pairs. Consider a two-stage cipher which emits a near-uniform underlying rune stream and, with probability 0.81, replaces a repeated symbol by a fixed different rune f(previous). A persistent 29-input mapping would create directed off-diagonal excesses, potentially allowing the underlying stream's repair layer to be reconstructed.

An arbitrary 29-row map f is fitted on **physical LP2 pages 0–27**. For each source rune, pick the most overrepresented *nonidentical* successor, standardized against its global successor popularity. Freeze the mapping. On independent pages **28–55**, except the runeless physical page 50, count transitions agreeing with the selected map. The held-out null consists of degree-preserving swaps among targets of observed off-diagonal transitions, rejecting swaps that create self-loops. This fixes the held-out incoming/outgoing frequency of every glyph and all observed diagonal doublet counts. One thousand successive Markov-chain null samples are taken after 30,000 proposals each, using xorshift32 seed 0x34bacafe. They are not claimed to be independent uniform samples of every admissible edge matching.

| Quantity | Measurement |
|---|---:|
| Training adjacent pairs / doublets | 6,733 / 45 |
| Held-out adjacent pairs / doublets | 6,168 / 41 |
| Held-out frozen-map transitions | **229** |
| Matched null mean / SD | **221.705 / 14.102** |
| Null range | 177–266 |
| Matched null scores at least 229 | **328/1,000** |
| One-sided plus-one empirical p | **329/1,001 = 0.328671** |

No stable fixed duplicate-replacement map is supported by the held-out sample. This is a direct ciphertext mechanistic test, independent of the earlier page28/page42 relative-key selection.

## Positive control and discrimination

A separate deterministic 100-trial simulator uses the original 55 page lengths, uniform iid underlying runes, and an independently hidden 29-cycle f per trial. If an underlying new rune equals its previous *visible* rune, 81% are replaced by f(previous). Fixed seed: 0x34cab123. The same fitted 29-row mapping is scored on the independent simulated second half.

Across 100 plants, the mean number of repairs is 359.46 (range 325–402), visible doublets average 83.17 (range 66–109), and 15.84/29 map entries are recovered on average. Held-out map hits average **308.47** (range 260–377): 100/100 plants exceed the original manuscript's 229; 98/100 exceed even the real-data null sample maximum of 266. Comparing plant scores against the real-data null maximum is a descriptive sensitivity indicator rather than a calibrated per-plant p-value.

The test is thus sensitive to the specified strong globally deterministic replacement mechanism. Random rerouting, nonstationary maps, ciphertext-dependent key state, nonuniform pre-repair sources, and other mechanisms remain viable. A negative here cannot supply plaintext or identify the true no-repeat mechanism.

## Reproduce

The complete one-file CommonJS program is [fixed_repair_map_heldout.cjs](../sims/fixed_repair_map_heldout.cjs). It reads the pinned [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json), asserts page and transition counts, prints the selected 29-row map and full null/positive metrics, and performs no writes or automatic CI dispatch.

**Follow-on research:** search for a specific *independently evidenced* changing state or external key generator that explains the repeated-symbol suppression and predicts plaintext on held-out pages; fitting more arbitrary maps on the same ciphertext lacks a credible path to inversion.
