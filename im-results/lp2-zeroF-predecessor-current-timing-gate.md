# zeroF predecessor-cell versus current-cell timing gate

## Decision

The frozen predecessor-cell timing is the stronger timing under the existing prospective structural controls for the two observables directly tied to the p50 low-value repeat signal. The lag-five observable does not independently select it. No original-source instruction was found that attaches p50 state specifically to the outgoing rune or transition.

This gives predecessor timing a real empirical advantage while leaving its human-solve rationale incomplete.

## Frozen comparison

The only changed choice is the controlling p50 cell for ciphertext rune position i:

- predecessor timing: cell `(i-1) mod 256`;
- current timing: cell `i mod 256`.

The zeroF exception alphabet, base60 byte interpretation, phase-zero global clock, swap rule, original word/page geometry, control corpora and deterministic control samples are unchanged. No other offsets were tested.

The original ciphertext target has 86 same-page adjacent repeats, 104 within-word lag-five equalities, and leading-zero repeat share 33/86 = 0.3837209302.

Across the exact 48 matched-layout controls per corpus, the encoded means are:

| register | timing | adjacent | lag5 | low60 repeat share |
| --- | --- | ---: | ---: | ---: |
| Shakespeare | predecessor | 139.729167 | 117.937500 | 0.396798 |
| Shakespeare | current | 153.708333 | 117.958333 | 0.245393 |
| Gibran | predecessor | 168.604167 | 117.583333 | 0.413053 |
| Gibran | current | 171.416667 | 117.416667 | 0.244563 |
| Emerson | predecessor | 164.541667 | 129.604167 | 0.416717 |
| Emerson | current | 171.145833 | 129.145833 | 0.249964 |

Relative to the untouched-original target, predecessor timing is closer on adjacent-repeat count in **3/3** registers and on leading-zero repeat share in **3/3**. Lag-five is nearly tied: predecessor is closer for Shakespeare, while current timing is closer for Gibran and Emerson.

This matters because adjacent-repeat suppression and the low60 share are the direct phenomena that motivated zeroF. The lag-five feature was a separate secondary structural register.

## Original inverse

Both timings are exact involutions and forward-reencrypt the original.

Predecessor timing changes 549/12,956 runes and gives:

- adjacent repeats 478;
- low60 repeat share 114/478 = 0.238493724;
- lag-five equalities 99.

Current timing changes 533/12,956 runes and gives:

- adjacent repeats 445;
- low60 repeat share 110/445 = 0.247191011;
- lag-five equalities 104.

The original-inverse statistics do not by themselves authenticate either timing. They are reported as consequences of the two predeclared rules rather than as a selector.

## Original-event directionality follow-up

Agent9 subsequently tested the exact one-step direction split on the untouched original, which #1569 had already source-motivated. The four frozen cells are 42/7,556 nonlow→nonlow, 11/2,320 nonlow→low60, 29/2,318 low60→nonlow, and 4/707 low60→low60.

The decisive comparison is the pair of exclusive classes because their exposures are nearly identical. Among the 40 repeats where exactly one adjacent phase is low60, **29** have the low cell on the predecessor side and **11** on the successor side. The exact one-sided 29-of-40 directional-symmetry tail is **p=0.0032132880**, and the predecessor-only rate is larger in **7/9** visual chapters.

This strengthens the empirical outgoing-transition interpretation and rejects a simple symmetric two-cell transparency mask. It remains ciphertext evidence rather than an authored instruction. Full report: [p50 low60 directionality gate](lp2-p50-low60-directionality-gate.md); reproducer: [`sims/lp2_p50_low60_directionality_sft.cjs`](../sims/lp2_p50_low60_directionality_sft.cjs).
## Source rationale audit

The validated p50 association was defined on the **first rune** of each adjacent pair. If one interprets the table cell at rune i as state for the outgoing transition i -> i+1, predecessor timing follows naturally. That interpretation is mathematical bookkeeping rather than a manuscript instruction.

The original pp49-p51 table supplies no arrows, transition notation, predecessor language, or offset-one mark. The surviving release wrapper supplies no timing instruction. The separate open clock-origin question likewise shows that cell0-at-first-unknown-rune remains an empirical alignment pending an authored anchor.

Therefore the control comparison strengthens predecessor timing within the zeroF hypothesis, while source selection of that timing remains incomplete.

## Reproduction

`sims/lp2_zeroF_predecessor_current_timing_sft.cjs` reuses the exact deterministic native-GP control sample from the committed zeroF gate, runs both timings on every sample, asserts the previously published predecessor statistics, verifies exact roundtrip for both timings, and reports the untouched-original inverses.

Shared CI PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44394358832

## Consequence

Keep predecessor timing fixed for any further test of the exact zeroF hypothesis because it transfers better on the two p50-repeat observables under the prospective controls. Do not treat the one-cell offset as an authenticated historical instruction. A source-visible clock-origin or transition-direction cue is still required before zeroF can be presented as a reconstructable human solve path.
