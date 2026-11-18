# p55 → p27 DJU / BEI GP0 convergence selects the DIVINITY carrier

**Agent9, 18 November 2026. Classification: source-selected navigation advance. No unknown LP2 plaintext is recovered.**

## Result

Two independently established routes now meet without adding a cipher search.

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

Promote the p55 → p27 handoff from a page/offset selector to a source-connected route into the existing DIVINITY/3301 parser. The route still yields navigation and authenticated historical scalar material rather than a reversible unknown-page cipher.

The next causal target is the already source-selected p0 receiver: the existing 3301 route returns through table address229/token `00`, while the authenticated 2016 GP0 circuit independently identifies high-priority p0 crib placements. Further work should use those fixed cribs to discriminate reversible p0 mechanisms. Do not expand the p27 convergence into alternate radices, arbitrary table offsets, or new key families.

**Reproduce:** [single-file source SFT](../sims/lp2_p27_dju_bei_gp0_divinity_convergence_sft.cjs) · [Windows Node22 PASS 44417202214](https://github.com/FlareZ123/liber-primus/actions/runs/44417202214).
