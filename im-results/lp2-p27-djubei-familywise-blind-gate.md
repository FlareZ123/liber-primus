# P27 DJU/BEI GP0 convergence familywise gate and frozen blind NEXT failure

**Agent7, 19 November 2026. Director #1709 completion. Status: the source-selected prime_echo/FIND handoff to p27:28 survives; the downstream DJU/BEI GP0→p50 convergence is retired as an authored navigation/state transition after its required blind continuation failed.**

## Question

The realized p27 table contains an attractive two-step convergence. DJU and BEI are independently selected by the terminal prime_echo handoff. Their whole-word GP0 sums address p50 tokens whose base59/base60 outputs land in p27 words with GP0 sums40 and55; those two p50 cells both print `1K`, sending both branches into the same p27 carrier. Earlier work counted this against only the 51 realized adjacent p27 pairs.

Director #1709 required two gates before treating that as authored navigation: charge the complete pre-result family under table-preserving nulls, then freeze the exact typed rule and make a blind source-selected continuation if the familywise gate survived.

## Frozen family

The downstream family charges all **51** adjacent p27 pairs, output types `literal/base59/base60`, all three unordered output-type pairs, step count **one or two**, and p27 receiver classes `start/end/singleton/interior`. Two nulls preserve the exact p50 token multiset: a whole-table permutation and a stricter within-physical-p50-page permutation.

The broad familywise event asks whether some output-type pair, at one or two steps, sends both branches to p27 word boundaries and gives the same receiver word under both output types. The stricter two-step event additionally requires the corresponding first-hop containing words to stay the same across output types.

## Familywise calibration

| event | global token multiset | per-physical-page token multiset |
| --- | ---: | ---: |
| any charged one/two-step common boundary target | 2,922 / 100,000 = **0.02922** | 2,246 / 100,000 = **0.02246** |
| any two-step stable-intermediate common target | 1,397 / 100,000 = **0.01397** | 1,332 / 100,000 = **0.01332** |
| source-selected DJU/BEI, one/two-step common target | 51 / 100,000 = **0.00051** | 29 / 100,000 = **0.00029** |
| source-selected DJU/BEI, strict stable-intermediate target | 24 / 100,000 = **0.00024** | 26 / 100,000 = **0.00026** |

Plain two-step boundary convergence by itself is common: **0.17806** globally and **0.21871** page-preserving. The charged family therefore passed the Issue's familywise gate and triggered the prospective requirement.

## Frozen blind continuation

Before inspecting the next source pair, Issue #1709 comment **6996107525** froze the exact base59/base60 two-step rule, corresponding stable first-hop words across radices, boundary hits at the first receiver step, a shared second-step p27 receiver, and canonical forward reading order as the literal **NEXT** selector. DJU/BEI are p27 word indices5/6, so the untouched holdout was fixed as indices7/8 before its words or outputs were named.

## Holdout result

The held-out pair is `AEF / P`, with starts **34/36** and GP0 sums **25/13**.

| radix | first hops | first-hop classes | containing-word indices | second p50 addresses | second outputs | target |
| --- | --- | --- | --- | --- | --- | --- |
| base59 | 195 / 4 | interior / interior | 44 / 1 | 166 / 194 | 246 / 157 | left invalid; right word39 |
| base60 | 198 / 4 | interior / interior | 44 / 1 | 166 / 194 | 250 / 159 | left invalid; right word39 |

The prediction fails before convergence is evaluated. All four first hops are **interior** positions, violating the frozen receiver-boundary condition. No common target exists.

## Decision

Follow the predeclared negative fork of Director #1709. Preserve historical prime_echo boundary300, the intact repeated pair DJU/BEI as the p55→p27 handoff, independent FIND→p50[42]→28 as the exact p27 start selector, and the realized DJU/BEI arithmetic as reproducible intermediate evidence.

Retire DJU/BEI GP0→p50 convergence as an authenticated navigation/state-transition rule, the claim that it source-selects the 79/80 carrier, and any argument that uses this convergence itself to authenticate the downstream DIVINITY→red13 chain. Downstream p27, p28, red13, TUNNELNG, shell, or DIVINITY relationships may remain live where they have independent source selection.

## Reproduction

- SFT: [`sims/lp2_p27_djubei_familywise_null_sft.cjs`](../sims/lp2_p27_djubei_familywise_null_sft.cjs)
- Workflow: [`.github/workflows/agent7-p27-djubei-familywise-null.yml`](../.github/workflows/agent7-p27-djubei-familywise-null.yml)
- Windows Node22 blind-holdout run: [44431692597](https://github.com/FlareZ123/liber-primus/actions/runs/44431692597)
- Frozen blind prediction: Issue #1709 comment 6996107525

The SFT rebuilds p27 words from the canonical transcription and derives every table lookup from the original p50 token grid. The deterministic permutation seed is fixed in the source.
