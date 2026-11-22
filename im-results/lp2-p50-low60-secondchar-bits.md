# Low60 second-character parity is a selective intermediate feature

**Agent 13 independent exploration, 18 November 2026. Evidence class: intermediate original-ciphertext structure. No plaintext, key, or opcode recovered.**

The validated p50 leading-zero class contains 60 physical cells and 33 of the 86 original same-page adjacent-equal events. #1571 shows that this class is internally heterogeneous, while repeated raw values are not selectively favored over arbitrary groupings of the same complexity. This follow-up asks a smaller source-defined question: do the six binary digits of the printed low value carry transferable information inside the already selected class?

Under the conventional historical base60 participant reading, **bit 0 of the second printed digit** splits the 60 selected cells into groups with **29/1,809 = 1.6031%** versus **4/1,216 = 0.3289%** repeat rates. Under the unchanged nine visual-chapter leave-one-out scoring used by the p50 program, this two-rate model gains **+5.498023 nats** over one common low60 rate and is positive in **7/9** held-out chapters.

The documented drop-`f` base59-compatible reading gives a weaker but directionally related bit-0 split: **23/1,510 = 1.5232%** versus **10/1,515 = 0.6601%**, for **+2.193596 held-out nats**, again positive in **7/9** chapters.

This is an operand clue rather than a parser decision. The creator-authored p50 radix remains unresolved, and the two alphabets do not assign the same parity to every printed character.

## Frozen finite feature family

After the broader raw-byte bit observation suggested a possible parity effect, the confirmatory family was kept deliberately finite:

- only the 60 already validated leading-zero cells;
- only the second printed character;
- exactly six available binary digits, bits 0 through 5;
- exactly two source-compatible historical alphabets already present in the repository: the conventional 60-character alphabet and the drop-`f` 59-character alternative;
- unchanged global phase-zero clock, same-page adjacent-equal event, and nine visual-chapter holdouts;
- no threshold, phase, traversal, character-class, interaction, or bit-combination search.

Held-out gains over one common selected-class rate are:

| Feature | Gain, nats | Positive chapters |
| --- | ---: | ---: |
| base60 bit0 | **+5.498023** | **7/9** |
| base60 bit4 | +0.207895 | 5/9 |
| base60 bit3 | -0.053925 | 6/9 |
| base60 bit2 | -1.139588 | 5/9 |
| base60 bit5 | -1.186005 | 2/9 |
| base60 bit1 | -1.229195 | 5/9 |
| drop-f59 bit0 | **+2.193596** | **7/9** |
| drop-f59 bit3 | +0.837688 | 6/9 |
| drop-f59 bit4 | +0.207895 | 5/9 |
| drop-f59 bit2 | -1.160900 | 5/9 |
| drop-f59 bit5 | -1.186005 | 2/9 |
| drop-f59 bit1 | -1.841649 | 2/9 |

Bit 0 is the only member with a substantial predictive gain under both readings.

## Finite-family token-label null

To calibrate the post-observation bit choice without changing ciphertext, chapter folds, cell exposures, or the observed token multiset, each null trial randomly reassigns the 60 observed leading-zero token labels to the 60 fixed selected physical cells. It then recomputes all 12 bit features and retains the largest nine-chapter held-out gain.

With seed `0x33011313` and **20,000** trials:

- observed family maximum: **+5.498023 nats**;
- null mean maximum: **+1.646878 nats**;
- null 95th percentile: **+4.324451**;
- null 99th percentile: **+6.271286**;
- trials at or above observed: **364/20,000**;
- add-one familywise **p = 0.0182491**.

The parity feature is therefore selective within this exact finite family, while remaining weaker than a decipherment mechanism.

## Binary low60-even conjunction

A simpler book-wide selector follows from the same bit result: classify a position as repeat-permitting only when its p50 control cell is in the already validated leading-zero class **and** its second printed character has bit0 = 0. All remaining positions form one pooled complement.

Under the conventional base60 reading this compact selector has:

- selected state: **29/1,809 = 1.6031%** repeats;
- complement: **57/11,092 = 0.5139%** repeats;
- nine-chapter held-out gain over one common book-wide rate: **+10.374652 nats**;
- positive held-out chapters: **7/9**.

Under the drop-`f` reading the analogous selector has:

- selected state: **23/1,510 = 1.5232%**;
- complement: **63/11,391 = 0.5531%**;
- held-out gain: **+6.833298 nats**;
- positive held-out chapters: **7/9**.

The conventional selected-state repeat rate is close to the low end of the author's established clear-GP section rates, while the complement remains far below the aggregate clear-GP baseline. This is compatible with a repeat-permitting versus repeat-suppressing state, though it does not prove a key-hold mechanism.

### Corrected finite-family calibration

Because the favorable bit state was chosen after inspecting parity direction, the conjunction receives its own larger correction family. Each null trial permutes the 60 observed low60 token labels across the 60 fixed low60 physical cells, preserving ciphertext, physical-cell exposures, chapter structure, and the exact token multiset. The statistic is the maximum held-out gain across:

- 6 bit positions;
- 2 documented alphabets;
- both bit states as the selected low60 subset.

This is **24** selectors per null book.

With seed `0x33011314` and **10,000** trials:

- observed maximum: **+10.374652 nats**;
- null mean maximum: **+6.491097 nats**;
- null 95th percentile: **+9.546734**;
- null 99th percentile: **+11.310878**;
- exceedances: **213/10,000**;
- add-one familywise **p = 0.0213979**.

The conjunction survives the enlarged post-choice correction. It remains an intermediate diagnostic because the p50 numeric alphabet is not creator-authenticated and no reversible operation has been selected.

Reproduction: `sims/lp2_p50_low60_even_conjunction_sft.cjs`.

## Unseen printed-table-page transfer

The chapter holdouts reuse the same 60 physical p50 cells in every fold. To ask whether parity is a transferable property of the printed low digit rather than a feature tied to already-seen cells, a second holdout trains on two of the three original table pages and predicts the third.

Using only leading-zero cells and one two-rate parity model:

- conventional base60 bit0: **+4.142355 nats** summed over the three source-page holdouts, positive on p50 and p51; individual gains are **−0.087661, +0.852980, +3.377036**;
- drop-`f` bit0: **−0.108779 nats**, positive on only one of three pages.

Across the full 12-feature family of six bits under each documented alphabet, conventional base60 bit0 is the strongest source-page transfer feature. A 10,000-trial token-label permutation null takes the maximum across all 12 features in every trial:

- observed family maximum: **+4.142355 nats**;
- null mean maximum: **+1.509556**;
- 95th percentile: **+4.341709**;
- exceedances: **581/10,000**;
- add-one familywise **p = 0.0581942**.

This source-page test weakly favors the conventional base60 ordering over the drop-`f` alternative, while remaining just outside the project's conventional 0.05 calibration threshold. Treat base60 as the preferred working parser for the parity diagnostic, not as an authenticated creator-selected radix.

A literal ASCII-code parity control fails: inside the same 60 low cells it scores **−1.618456 held-out nats**, so the effect is tied to the historical numeric ordering rather than the printed glyph's ASCII least significant bit.

Reproduction: `sims/lp2_p50_low60_parity_tablepage_holdout_sft.cjs`.

## Hold-state consequence: negative

The strong repeat contrast suggests one natural mechanism-level interpretation: the selected parity state could mean **hold an additive key/state**, so ciphertext equality there would preserve plaintext equality. That interpretation predicts more than a delta-zero spike. After removing every repeat event, the remaining 28 ciphertext-difference frequencies at the selected cells should also resemble authentic clear-GP plaintext transition differences more closely.

The test freezes the six clear LP1 GP sections already used by the project's original-author doublet baseline (991 eligible pairs, 28 repeats). It removes delta 0 from both the reference and p0-p55 comparison, applies Jeffreys smoothing to the 28-way clear-GP difference law, and scores per-rune cross entropy.

For conventional base60:

- selected nonzero differences: 1,780;
- other low60 nonzero differences: 1,212;
- selected minus other clear-GP log-score advantage: **+0.021643 nats/rune**;
- 20,000 fixed-size random subsets of the 60 low cells reach at least this advantage **2,489** times;
- add-one upper-tail **p = 0.124494**.

For drop-`f`:

- selected nonzero differences: 1,487;
- other low60 nonzero differences: 1,505;
- advantage: **−0.032297 nats/rune**;
- upper-tail **p = 0.962602**.

Thus the selected parity state does not carry a broader plaintext-like transition law once the repeat statistic that discovered it is removed. The simple additive **key-hold** explanation is unsupported. Preserve the binary state as a repeat predictor and require a different source-selected mechanism for why it changes only the self-transition probability.

Reproduction: `sims/lp2_p50_low60_hold_transition_consequence_sft.cjs`.

## Clear-GP specificity gate

Director #1616 freezes the conventional-base60 **leading-zero AND second-character bit0=0** selector and asks whether its repeat enrichment is ordinary GP prose. A preregistered control test uses eight disjoint source-native physical-page controls: the six printed-clear LP1 pages p3, p8, p9, p10, p11 and p14, plus solved LP2 p56 and p57. Each page starts at phase0 with no optimization. Their selected state has **3/135 = 2.2222%** repeats versus **29/1,038 = 2.7938%** elsewhere, rate ratio **0.79540**, and **-0.822178** leave-one-page-out nats with **2/8** positive blocks. A separate seven-record solved-LP1 plaintext panel gives **10/374 = 2.6738%** versus **63/2,418 = 2.6055%**, rate ratio **1.02623**, and **-0.370780** leave-one-record-out nats with **1/7** positive.

The frozen unknown-LP2 benchmark is **29/1,809 = 1.6031%** versus **57/11,092 = 0.5139%**, rate ratio **3.11957**, and **+10.374652** held-out nats with **7/9** positive chapters. A deterministic synthetic positive with repeat probabilities 0.08 selected and 0.02 elsewhere recovers the intended direction at **2.66154x**, **+2.441747** held-out nats and **6/8** positive blocks.

The exact state therefore does not reproduce ordinary clear-GP repeat behavior in these controls. This strengthens its specificity to unknown LP2. It still supplies no cipher opcode, key or plaintext. Any successor decoder should keep this state frozen and require an independent source-selected reversible consumer.

Reproduction: `sims/lp2_p50_low60_bit0_clear_controls_sft.cjs`. Full decision: `im-results/lp2-p50-low60-bit0-clear-controls.md`.

## Interpretation and receiver decision

The result narrows the p50 state question in a way that raw-value equality did not. Within the already validated leading-zero class, the printed low digit contains a simple one-bit partition that transfers across chapters and beats multiplicity-preserving token relabeling after correcting for the tested bit family.

Director #1623 subsequently audited the missing reversible receiver against the original pp49–51 source, authenticated release material, the signed 2016 “numbers are the direction” clue, the clock-origin audit, and already completed concrete consumers. **No creator-authenticated clue binds this bit state to a named unknown-text sink, initial key/state, phase-zero cross-object origin, reversible update rule, or globally fixed numeral alphabet.** The signed 2016 direction clue is genuine but does not identify p50, bit0, or what either bit value commands. The parity class also differs on 24/60 low cells between the two documented numeral readings.

Accordingly, authoritative synthesis should no longer call bit0 a cipher operand. Preserve it as a **predeclared empirical surface diagnostic** and require a new independently source-selected reversible receiver before decoding work uses it. Do not create another Boolean/state-machine menu from the correlation itself.

Receiver decision: `im-results/lp2-p50-low60-bit0-receiver-selection.md`.

Reproduction of the underlying diagnostic: `sims/lp2_p50_low60_secondchar_bits_sft.cjs`, `sims/lp2_p50_low60_even_conjunction_sft.cjs`, `sims/lp2_p50_low60_parity_tablepage_holdout_sft.cjs`, `sims/lp2_p50_low60_hold_transition_consequence_sft.cjs`, and `sims/lp2_p50_low60_bit0_clear_controls_sft.cjs`.
