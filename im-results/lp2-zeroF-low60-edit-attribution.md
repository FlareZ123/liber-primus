# zeroF edit attribution: most edits and normalization come from the non-low60 mod8 branch

**Decision, Agent 13, 18 November 2026.** Director Issue #1558 attributes every edit made by the frozen zeroF transform to the p50 control class that caused it. The independently validated low60/leading-zero class produces **144/549 edits = 26.23%**. It controls **3,036/12,955 = 23.43%** of eligible transformed positions. Its edit-rate enrichment over the other cells is only **1.1616×**.

The remaining **405/549 edits = 73.77%** come from zeroF's less-supported nonzero `byte mod 8` branch. That branch also accounts for **311/392 = 79.34%** of the transform's net increase in same-page adjacent equalities. This result downgrades zeroF as a causal consequence of the validated p50 low60 clue. Its structural behavior depends mainly on the branch whose eight-symbol exception alphabet and mod8 selector still lack independent source selection.

No plaintext, key, or historical cipher is recovered.

## Frozen rule and accounting

The committed zeroF rule is unchanged:

- position `i` is controlled by p50 cell `(i-1) mod 256`;
- a printed leading-zero cell selects GP `F`;
- every other cell selects one of `[F,TH,EO,NG,OE,AE,IA,EA]` by `byte mod 8`;
- the current rune swaps with the previous ciphertext rune and the selected exception;
- global rune 0 remains unchanged.

The original p0–55 stream has 12,956 runes. Therefore 12,955 positions have a predecessor-cell control.

| Frozen class | Controlled positions | Edits | Edit rate |
| --- | ---: | ---: | ---: |
| low60 / leading zero | 3,036 | **144** | **4.7431%** |
| non-low60 / mod8 branch | 9,919 | **405** | **4.0831%** |
| total | 12,955 | **549** | 4.2374% |

Low60 cells have a modest per-position edit enrichment, while their edit share remains close to their exposure share: **26.23% of edits** versus **23.43% of controlled positions**.

## Original adjacent-repeat events

The source has 86 same-page adjacent-equal events under the frozen predecessor-cell clock.

| Control class | Original repeat events | Repeat-owner positions edited |
| --- | ---: | ---: |
| low60 | 33 | **32/33** |
| non-low60 | 53 | **49/53** |
| total | 86 | **81/86** |

The low60 class retains its independently established enrichment among original repeat events, with 33/86 events in only 3,025/12,901 eligible pair opportunities. The zeroF edit mechanism itself is much less concentrated: most edits occur outside that class.

## Which branch drives zeroF's repeat normalization

The frozen inverse changes total same-page adjacent equalities from **86 to 478**, a net increase of **392**. Using the same pair ownership rule:

- low60-controlled pairs rise from **33 to 114**, net **+81**;
- non-low60 pairs rise from **53 to 364**, net **+311**.

Thus the non-low60 branch supplies **79.34%** of the net adjacent-equality increase. The decoded adjacent-repeat rates end up close across the two classes:

- low60: 114/3,025 = **3.7686%**;
- non-low60: 364/9,876 = **3.6857%**.

This is the clearest causal accounting for the structural effect. The validated low60 clue contributes, while the larger part of the normalization arises from the unsupported `byte mod 8` exception selector.

## Decision

The frozen zeroF transform remains an interesting structural normalizer and already passed its separate specificity controls. Its causal path from the validated p50 low60 clue is weaker after this attribution. Mechanism work should prioritize independent source support for the eight-symbol nonzero exception alphabet and `byte mod 8` selector before treating zeroF as a historically plausible layer.

The existing direct inverse remains nonlinguistic, and the solved-p56 holdout still rejects a universal book-wide zeroF layer. This accounting adds no reason to tune zeroF's phase, marker set, orientation, or exception mapping.

Reproduction: `sims/lp2_zeroF_low60_edit_attribution_sft.cjs`.
