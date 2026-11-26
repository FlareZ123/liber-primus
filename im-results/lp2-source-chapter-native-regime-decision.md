# Source-visible chapter regime selection — Director #2962

**Decision:** the documented native direct-cipher menu does not decipher any of the nine source-defined unknown LP2 chapters, even with independent operation choice at each chapter. The eleven additional source-motivated intervals also yield no unknown plaintext. Section borders may still delimit an unknown cipher or another representation; the evidence does not authenticate an opcode at a border.

## Source framing and experiment

The original JPEG contact sheet was inspected locally (archive image index = physical page +17). The visible changes at p0,3,8,15,23,27,33,40,54 distinguish manuscript chapters: rubric starts, new branch/wing/other illustrations and, at p15, the numeric square/spiral. These are the existing independent nine-chapter boundaries, not fitted change points. The p33–39 cuneiform group contains five red numbered items (same boundaries as the [literal verse receiver](book-of-law-running-key-gate.md#numbered-verse-reset-receiver-agent50-director-2885-26-november-2026)); p49–51 is a single panel interrupted by a runeless physical page; p55 has the terminal tree and is an incoming word carry from p54. The latter is a permissive possible reset, not a claim that p55 begins a new plaintext word. The repeated p40–55 illustration does not supply a known operator by itself.

The operation menu is frozen from actual solved Cicada text: clear GP29, canonical Atbash (28−P), additive historical DIUINITY q8 and FIRFUMFERENFE q13, and p56 successive prime-minus-one. For the three stateful operations, every plaintext F is emitted literally and does not advance the clock. Origin is fixed to phase/prime ordinal zero, with no invented key or reordering. At each physical rune the inverse enumerates both the literal-zero hold and nonzero consuming branches, when legal; DP state is (clock, previous two plaintext runes). The score is a native leave-one-record-out interpolated trigram model with add-one unigram and backoff strength 10. The unknown manuscript uses the seven archived LP1 plaintext records as training, never p56/p57. For each original chapter, select on its first physical page, then freeze operation, state and last two plaintext runes for its untouched continuation. Also run the same chapter starts after removing the previously established red rubrics (13,16,12,20,16,19,10,8,9). For small explicit intra-chapter units split once at a printed page carry where present or approximately in half, fixed before their scores. A separate full retrospective DP enumerates all legal F-mask paths under every fixed operand; this distinguishes a frozen-prefix path failure from no possible inverse at all. Every completed candidate exactly re-encrypts.

### Authentic positives

| Actual original control | Selected operation | Prefix correct | Untouched correct |
|---|---|---:|---:|
| LP1 warning | Atbash | 110/110 | 74/74 |
| LP1 WELCOME | DIUINITY | 303/309 | 206/206 |
| LP1 SOME WISDOM | clear | 94/94 | 63/63 |
| LP1 second KOAN | FIRFUMFERENFE | 191/191 | 128/128 |
| LP2 p56 | prime-minus-one | 51/51 | 34/34 |
| LP2 p57 | clear | 57/57 | 38/38 |

All six correct historical operations selected from their prefixes alone; all 543 withheld runes correct. Prefix 806/812 (six WELCOME F-ambiguity errors), with exact replay. Native held-out scores range −3.309849 to −1.987181 nats/rune. The true original controls thus establish that the manuscript *can* change direct operation between sections: p56 and p57 alone demonstrate this. They do not supply a rule that maps the unknown rubric or illustration to a particular operation.

## Nine unknown chapters

| Start | End | Whole length | Prefix-selected operation | Frozen held-out score | Full legal stateful operands (whole / body) |
|---:|---:|---:|---|---:|---:|
| 0 | 2 | 729 | Atbash | −5.050846 | 0/0 |
| 3 | 7 | 1145 | Atbash | −5.017266 | 0/0 |
| 8 | 14 | 1729 | clear | −5.069965 | 0/0 |
| 15 | 22 | 1903 | clear | −5.098657 | 0/0 |
| 23 | 26 | 1021 | clear | −4.895939 | 0/0 |
| 27 | 32 | 1433 | clear | −5.040746 | 0/0 |
| 33 | 39 | 1680 | clear | −5.043771 | 0/0 |
| 40 | 53 | 3008 | clear | −5.075558 | 0/0 |
| 54 | 55 | 308 | clear | −5.288100 | 0/0 |

**All 54 combinations of the three stateful native fixed operands × nine chapters × whole/body are algebraically impossible**, even with all F-hold ambiguities. Identity and Atbash remain mechanically reversible but nonprose. The body-only winners are identical to whole-chapter winners. A single operation selected using p0 alone is Atbash. On precisely the same 10,939 held-out chapter runes, the one-regime baseline scores −5.031681 while the more permissive piecewise receiver scores −5.052621: extra regime selection worsens the out-of-sample score by 0.020940 nats/rune. Neither is language. This is not evidence that the unknown historical cipher has one regime.

## Explicit finer intervals

| Interval | Length | Prefix choice | Held-out score / legal prefix of holdout |
|---|---:|---|---:|
| p33 to first red number | 845 | clear | −5.168350 |
| numbered 1 | 139 | clear | −5.014874 |
| numbered 2 | 91 | clear | −4.311331 |
| numbered 3 | 98 | Atbash | −5.231535 |
| numbered 4 | 96 | DIUINITY | 38/57 then impossible |
| numbered 5 | 129 | Atbash | −5.127105 |
| after numbered 5 to p39 end | 282 | prime-minus-one | 90/240 then impossible |
| p40–48 | 2408 | clear | −5.059894 |
| p49–51 panel text | 158 | Atbash | −4.757565 |
| p52–53 | 442 | Atbash | −5.057930 |
| p55 alone | 76 | FIRFUMFERENFE | 36/38 then impossible |

The three stateful prefix winners fail on held-out continuation. Full all-state inversion additionally shows no legal path for those same operands (max legal total length 77/96,132/282,74/76). Across the 33 finer interval/stateful-operand cases, only two reach the end: the fixed FIRFUMFERENFE inverse of numbered item3 and the panel text, with even retrospective optimal scores −4.900502 and −4.816460. Neither selected by its prefix; neither is a demonstrated plaintext. In particular, the p49–51 grouping recognizes the panel while leaving its numeric cells outside the GP tape: it is not a test of a key derived from those cells.

## Consequences for new keys and source-fixed regimes

The [existing exact all-key q8/q13 block receiver](lp2-periodic-fhold-allkey-blockwise-original.md) is a stronger arbitrary-key control: every one of the 72 full 179-rune windows scored below the native LP1 blocks, even granting independent arbitrary keys/phases. Map its frozen windows onto the nine independently defined rubric-free bodies, with counts 3,5,9,9,5,7,8,16,1; each contains at least one full window. Thus a chapterwise choice of q8 or q13 (even private keys/phases) cannot evade that existing localized failure by choosing a new chapter key. This is a calibrated language rejection, not a proof against all possible English strings; the earlier block bound does not cover all short numbered units.

Likewise the [all-435 one/two transparent-set prime clock](lp2-primeclock-all-single-pair-holds.md) already grants separate chapter origins up to ordinal3300: eight of nine bodies algebraically fail; the sole p54–55 retrospective candidate is nonprose and the prefix-selected key cannot continue. No need to rerun these families or create a new global key sweep. The source-visible regime hypothesis remains logically open for new, independently selected transformations, but merely changing the start or choosing among the documented direct operations is not a solve path.

**Director recommendation:** retire the exact native-menu piecewise transfer. Keep the visible chapter framework as a permissible segmentation for a new source-derived operation; do not infer a new cipher from the section graphics alone. A next substantive result must provide an independent operator/operand mapping, e.g. a decoded graphic/table instruction whose typed output fixes a receiver and predicts original text. The numbered sequence and event-tape issues are distinct and should not be subsumed. No original unknown plaintext, key or destination recovered.

## Reproduction

[CommonJS SFT](../sims/lp2_source_chapter_native_regime_sft.cjs) and [complete raw result](lp2-source-chapter-native-regime-output.json). Run `node sims/lp2_source_chapter_native_regime_sft.cjs` from repository root. Source blobs: canonical LP2 corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; Relikd native reference 1b064ef6d85819b7d96adaff31a82d1ec551598f; LP1 canonical ciphertext 37c96b816495c5f93ca658a01c9918bf92598316. The actual core executed in the connected V8 runtime with those repository inputs; standalone Node wrapper and CI not separately run. Visual selection from original supplied JPEGs and existing exact offsets; no external new artifact acquired.
