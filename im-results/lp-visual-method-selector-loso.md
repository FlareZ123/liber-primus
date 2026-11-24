# Held-section-out visual cipher-method selector (#2640)

**Decision:** no discriminating method selector follows from the tested visible layout categories. The best leave-one-entire-section-out performance equals the identity-only baseline (4/9), for both broad families and exact method conventions. No encrypted held-out unit is correctly predicted by the best-performing rules. No independent unknown-page operand or key is selected.

## Visual features and control unit

Inspected original combined-archive JPEGs 00–16,73,74 from the maintainer-supplied archive. Latin cover/title pages 00 and 02 are not rune cipher controls. Each complete solved rune section is one observation; repeated art spanning pages is not counted as independent. The feature family is deliberately small and visible: principal artwork placement (enclosed text / bottom-edge footer / discrete inset), oversized red rubric initials (none / single / multiple), separate non-rune content block (none / magic square / hex digest). No numeric pixel counts, motif identity codes, plaintext title words, original page index, or sequence-order rule enter the classifier.

This is a computational leave-section-out analysis, **not a psychologically blinded observer study**: the investigator already knew common solved-method labels. The feature coding is manual and categorical. The exact permutation test conditions on this coding and the declared classifier family; it cannot correct any earlier feature-selection exposure. A truly independent blind human test would require an uninformed observer.

| Native unit | Combined scans | Artwork | Red initials | Separate block | Broad method | Exact convention |
|---|---|---|---|---|---|---|
| WARNING | 01 | enclosed | single | none | affine | Atbash |
| WELCOME | 03–04 | enclosed | multiple | none | keyword | q8 F-hold |
| WISDOM | 05 | discrete | none | square | clear | identity |
| KOAN1 | 06–09 | enclosed | multiple | none | affine | 2−C mod29 |
| LOSS | 10–13 | enclosed | multiple | none | clear | identity |
| KOAN2 | 14–15 | footer | single | none | keyword | q13 F-hold |
| INSTRUCTION | 16 | footer | single | square | clear | identity |
| AN END | 73 | discrete | single | hex | prime | prime-minus-one F-hold |
| PARABLE | 74 | discrete | single | none | clear | identity |

The three units WELCOME, KOAN1 and LOSS share the full three-field signature while belonging to three different broad method classes and exact conventions. Thus even a deterministic lookup of the entire feature vector cannot explain these controls. The two magic-square units are clear, but this two-example association has no predictive advantage over the baseline; the separate hex block belongs to the prime-shift unit and is unique.

## Exact prediction test

For each of the seven nonempty subsets of the three visual fields, hold out one complete solved section. Predict the unique modal label from the remaining sections with matching feature values. If no match or local tie, use the unique training-set global mode (abstain if tied). Baseline uses the global mode alone. Repeat for every held-out unit, and separately for broad families and exact conventions. This does not infer a never-observed method label from a new unique illustration.

| Visual field subset | Broad correct /9 | Exact correct /9 |
|---|---:|---:|
| None (baseline) | 4 | 4 |
| Artwork placement | 2 | 3 |
| Red initial count class | 4 | 4 |
| Non-rune block type | 4 | 4 |
| Artwork + initials | 2 | 2 |
| Artwork + block | 3 | 4 |
| Initials + block | 4 | 4 |
| All three | 4 | 4 |

Enumerate all distinct label permutations with the actual label multiplicities and recompute the maximum across all seven subsets each time. For broad labels 3,570/3,780 permutations equal or exceed the observed best (0.944444). For exact labels 15,120/15,120 equal or exceed it (1.0). This accounts for selecting among the seven subset rules, conditional on the manual feature table; no effect exceeds the identity baseline.

Concrete held-out replay: block-type lookup predicts identity for INSTRUCTION (scan16), from the remaining WISDOM square control. The identity inverse exactly matches all 89 original runes against the pinned solved native reference. PARABLE identity also reproduces 95/95. These successes are ordinary baseline predictions; neither gives a new state convention for an encrypted section. The exact nonidentity labels have one observation each, so these control data do not identify a transferable exact state rule.

## Reproduction and next decision

`node sims/lp_visual_method_selector_loso_sft.cjs` reproduces both complete permutation enumerations, scores, label predictions and exact identity replays. The feature table can be checked directly on the original scans; the statistical engine executed in the JS tool runtime. Original LP1 source blob 37c96b816495c5f93ca658a01c9918bf92598316, native reference 1b064ef6d85819b7d96adaff31a82d1ec551598f. No new CI.

This extends #2422's historical ordered-method transfer and #2419's motif-only gate by testing section-level visual layout variables without treating unique art as a key. Retire this exact selector family. It does not prove there is no finer independently signposted visual instruction; such a rule would require new source evidence and a genuinely discriminating known encrypted control before unknown-page use. No unknown plaintext, key or destination.
