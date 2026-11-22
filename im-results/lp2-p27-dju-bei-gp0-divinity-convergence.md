# p55 → p27 DJU / BEI GP0 convergence: familywise unusual, blind continuation failed

**Agent9 arithmetic, 18 November 2026; Agent7 Director #1709 gate, 19 November 2026. Classification: reproducible intermediate structure. The independently source-constrained prime_echo/FIND handoff to p27:28 survives. The downstream DJU/BEI GP0→p50 convergence is retired as an authored navigation/state transition after its frozen blind continuation failed. No unknown LP2 plaintext is recovered.**

## Result and current status

The arithmetic below remains exact on the original source and p50 table. Director #1709 supplied the missing discovery-aware decision gate. Charging all 51 adjacent p27 pairs, all three already-used output types `literal/base59/base60`, all three unordered output-type pairs, one/two steps, and the inspected p27 boundary classes gives a familywise rate of **2,922/100,000 = 0.02922** under exact whole-table token-multiset permutations and **2,246/100,000 = 0.02246** when each physical p50 page preserves its own token multiset. The stricter two-step event with stable corresponding intermediate words is **0.01397** and **0.01332** respectively.

That calibration triggered the Issue's predeclared blind-continuation requirement. Before inspecting the next pair, the rule and selector were frozen in Issue #1709 comment 6996107525: canonical forward reading order selects the first complete adjacent pair immediately after DJU/BEI, which must satisfy the same base59/base60 two-step stable-intermediate common-target topology.

The blind pair is p27 words **7/8 = AEF / P**, starts **34/36**, with GP0 sums **25/13**. It fails at the first receiver-boundary gate: base59 gives first hops **195/4**, both interior; base60 gives **198/4**, both interior. No common target is produced. Under #1709's predeclared fork, the GP0 convergence layer is retired. The prime_echo repeated-pair handoff and independent FIND→28 selection remain intact.

## Historical arithmetic

Two independently established routes meet arithmetically without adding a cipher search.

1. Finite historical `prime_echo` exhaustion selects the p55 terminal boundary whose first intact repeated complete-word pair is **DJU / BEI**. Its only other adjacent occurrence is p27.
2. The replicated signed-2016 GP0 navigation grammar gives `FIND=42 → T[42]=28`, selecting the exact p27 rune offset where **DJU** begins.
3. Apply that already frozen grammar directly to the selected pair, keeping p27 as the independently selected receiver page:
   - `DJU` has GP0 sum **35**; original p50 byte `T[35]=39`.
   - `BEI` has GP0 sum **45**; original p50 byte `T[45]=107`.
4. On original p27, offsets **39** and **107** are both the final rune of a three-rune complete word, starting at offsets37 and105. Those two intermediate words have GP0 sums **40** and **55**.
5. The next identical operation converges exactly:
   - `T[40]=80`
   - `T[55]=80`

The two distinct source branches therefore meet at original p27 rune offset **80**.

## Why offset80 matters

Offset80 is not a free destination chosen after inspection. It lies inside the previously selected 12-rune p27 body word beginning at offset79. More precisely, it is **the first rune after shedding one outer rune from each end**, so it is the left boundary of that word's once-shed ten-rune interior.

That same source word already has two independently reported parable identities:

- whole-word GP-prime sum **562**, with `φ(562)=280=GP-prime(INSTAR)`;
- twice-shed eight-rune interior GP-prime sum **376=GP-prime(DIVINITY)`.

Thus the source-selected handoff pair now leads, through the replicated word-number/table-byte grammar, directly into the exact carrier on which the p27 circumference parser finds **DIVINITY**. The pre-existing parser then supplies the source-derived `3QO → 3301` historical BASE29 closure.

A concise causal chain is now:

`prime_echo boundary300 → p27 DJU/BEI → GP0/table convergence80 → shed carrier → DIVINITY → 3301`.

This removes the earlier gap where DJU / BEI selected p27 but had no source-typed continuation into the parser.

## Finite p27 control

The original p27 page has **52 complete words**, hence 51 adjacent pairs. For every adjacent pair, the exact same two-step grammar was applied:

`source word → GP0 address → p50 byte → containing p27 word → GP0 address → p50 byte`.

Only **2/51** adjacent pairs have both branches converge after the second step. One is a trivial first-step collision: both source words already return the same first byte and therefore select the same intermediate word. **DJU / BEI is the only adjacent p27 pair whose two distinct first bytes converge on the second step.**

It is additionally source-shaped that its first bytes39 and107 each land on the final rune of a three-rune intermediate word before the two intermediate GP0 numbers40 and55 converge at80. These properties were measured after the pair had already been independently selected, so they are supporting selectivity rather than a discovery-adjusted authorship probability.

## Cross-page return through p0 THE / WAY

Endpoint80 survives an independent signed-2016/p0 holdout. Authenticated source `THE` maps through p0 to exact next source word **WAY**, and WAY maps through p0 to80. The full 56-page × 42-adjacency census leaves p0 as the only source-order chain ending at80; p25's first-hop rival continues to65. Since80 was frozen by DJU/BEI before this census, the endpoint was not fitted. Together with `DIVINITY→3QO=3301→229/00→p0`, this closes the route back to the same p27 carrier. [Cycle](lp2-p0-the-way-p27-80-navigation-cycle.md).

## Decision

Preserve the exact DJU/BEI two-step convergence as intermediate evidence and as a reproducible table property. Do not use it as an authenticated handoff into the p27 carrier, DIVINITY interval, red13 receiver, or downstream 3301 parser.

The surviving source-constrained result is narrower:

`prime_echo boundary300 → intact repeated DJU/BEI pair → p27`

and independently:

`FIND=42 → p50[42]=0S → 28 → p27 rune offset28`.

Those two routes still identify p27:28. Any continuation beyond that point now requires a different first-party clue, a separately selected operation, or a new blind prediction.

## Reproduction

- Familywise/blind report: [`lp2-p27-djubei-familywise-blind-gate.md`](lp2-p27-djubei-familywise-blind-gate.md)
- Familywise/blind SFT: [`sims/lp2_p27_djubei_familywise_null_sft.cjs`](../sims/lp2_p27_djubei_familywise_null_sft.cjs)
- Windows Node22 blind-holdout PASS: [run 44431692597](https://github.com/FlareZ123/liber-primus/actions/runs/44431692597)
- Original arithmetic SFT: [`sims/lp2_p27_dju_bei_gp0_divinity_convergence_sft.cjs`](../sims/lp2_p27_dju_bei_gp0_divinity_convergence_sft.cjs)

The blind failure is a decision result. The SFT passes by reproducing the frozen prediction and recording that the prediction is false.
