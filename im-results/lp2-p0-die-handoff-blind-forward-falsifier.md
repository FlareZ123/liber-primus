# p0 27×27 I ASK→DIE handoff: first blind forward application fails

**18 November 2026, Agent6. Independent continuation test. Classification: decisive falsifier for one post-hoc handoff as a reusable parser.** No unknown LP2 plaintext is inspected or recovered.

## Upstream hypothesis

The external p0–2 27×27 model conditionally recovers `I ASK` after a selected prefix. A later locally audited handoff was discovered after `DIE` was already public. From `I ASK`, that handoff selects the published `DIE` geometry without consulting its plaintext:

1. next source-center `n0 = current source-center n0 + GP(trailing three plaintext runes)`;
2. next ciphertext-start `n0 = sum(current ciphertext rune indices) + 1`;
3. next source radius = current ciphertext block length;
4. next ciphertext length = one three-rune key period;
5. diagonal row sign follows the source-center row displacement;
6. the original source-center rune self-crib breaks the remaining center-operation tie.

The local audit already warned that the two arithmetic equalities were unique to the known `I ASK→DIE` transition on the published route and were found retrospectively. The clean validation test was therefore to apply the same rule stack **one step farther, before inspecting any next plaintext**.

## Positive implementation control

The standalone SFT first replays the known transition from unchanged p0–2 source coordinates:

- `I ASK` source center `(12,13)`, `n0=310`;
- trailing `A S C/K` GP weight `163`;
- derived next center `310+163=473 -> (18,14)`;
- current ciphertext `Y X X NG = 26,14,14,21`, sum `75`;
- derived next start `76 -> (3,22)`;
- one key period and downward row sign give end `(5,24)`.

The implementation then checks the external Reports 17, 18 and 19 formulas. **All three accept this known I ASK→DIE geometry**, so the forward failure below is not caused by a mismatched formula implementation.

## Blind forward prediction from DIE

Freeze the already-public `DIE` block and do not inspect any proposed next plaintext.

Known current state:

- source node `(18,10),(18,14),(18,18)`, center `(18,14)`, `n0=473`;
- plaintext `D I E`, GP weights `89+31+67=187`;
- ciphertext `B H D = 17,8,23`, sum `48`;
- ciphertext cells `(3,22),(4,23),(5,24)`.

The same handoff therefore predicts, mechanically:

- next source-center `n0 = 473+187 = 660 -> (25,12)`;
- next ciphertext-start `n0 = 48+1 = 49 -> (2,22)`;
- next source radius `3`;
- next ciphertext length `3`;
- source-center row displacement is downward, so the predicted diagonal ends at `(4,24)`.

No source axis, key, dictionary word, or next plaintext is needed to test the three independent continuation filters.

## Frozen Reports 17–19 all reject the blind prediction

### Report 17: next key-center column

For current DIE center `(18,14)`,

`n3 = 27(27-14)+18 = 369`.

The predicted next center has column 12, so

`369 XOR 12 = 381 = 3×127`, with Möbius value **+1**.

Report 17 accepts only XOR value zero or Möbius value at most zero. **The predicted center is rejected.**

### Report 18: three next-ciphertext geometry bits

Using only the fixed DIE source node and ciphertext, the published formulas predict

`(vertical-sector, negative-Möbius-end, start-right) = (1,0,1)`.

The handoff-derived segment `(2,22) -> (4,24)` has observed bits

`(1,1,0)`.

**All but the first bit disagree, so Report 18 rejects the predicted segment.**

### Report 19: next-start distance class

With previous beginning `I ASK (5,17)` and current DIE beginning/leftmost `(3,22)`, the published Report 19 predicates require the **far** class.

The handoff predicts start `(2,22)`, Chebyshev distance **1** from both DIE beginning and leftmost cell. It is therefore near both.

**Report 19 rejects the predicted start.**

## Decision

The post-hoc arithmetic handoff that uniquely selected `DIE` from `I ASK` fails **all three independently frozen continuation filters on its first genuinely blind forward use**. This is stronger than merely observing that the formulas were rare on the retrospective route.

Retire that handoff as a reusable p0 parser. It may still describe a one-off fitted relation at `I ASK→DIE`, but it supplies no justified continuation and should not be used to select another English word, source node, or ciphertext segment. A future rescue requires a new first-party source cue that explicitly changes the rules at the DIE boundary, or a different precommitted parser that succeeds on withheld original ciphertext.

This result does **not** by itself falsify the earlier source-derived 27×27 center self-crib or the conditional I ASK endpoint. It removes one proposed way of turning the post-I-ASK branch into a predictive continuing decoder.

## Reproduction

- SFT: [`sims/lp2_p0_27square_die_handoff_blind_falsifier_sft.cjs`](../sims/lp2_p0_27square_die_handoff_blind_falsifier_sft.cjs)
- Windows / Node 22 workflow: [44397515242](https://github.com/FlareZ123/liber-primus/actions/runs/44397515242)
- Consolidated p0 audit: [`lp2-p0-27square-center-selfcrib-weather-candidate.md`](lp2-p0-27square-center-selfcrib-weather-candidate.md)
- External fixed formulas: Reports 17–19 in the cited 27×27 repository.
