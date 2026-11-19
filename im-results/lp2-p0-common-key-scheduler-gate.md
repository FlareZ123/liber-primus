# p0 AND/THEIR common-key-scheduler gate

**Decision: bounded negative.** The source-selected p0 receiver geometry is real and the two local inverses are reproducible, but the available evidence does **not** define one deterministic source-selected DH/H/state-to-key scheduler. The AND key does not transfer to a second independently source-selected AND receiver; a different state-family and the opposite additive sign are required there. Do not merge the local key families into a continuous stream or promote the candidate plaintexts as established.

## Source-fixed inputs and receiver selection

The authenticated 2016 cleartext contains both `ROAD AND THEIR NUMBERS` and `SEEK AND YOU WILL BE FOUND`.

- `GP0(NUMBERS)=83`; original p50 cell 83 is `3D`. Its base-59/base-60 values are 190/193; with the established one-based receiver convention these select p0 rune starts **189** and **192**. The original printed words at those starts have lengths **3** and **4**, matching the preceding authenticated words **AND** and **THEIR**. This selector does not use their plaintext values.
- `GP0(THEIR)=34`; p50 cell 34 is `3H`. Its low base-60 digit is 17, exactly `p-a=23-6`, the first coordinate of the proposed THEIR key. This is useful source support for that coordinate, but it does not select the entire four-coordinate key template.
- `GP0(AND)=56`; p50 cell 56 is `4E`, whose base-60 value is 254. Under the existing zero-origin route this selects a second complete three-rune p0 word at **254**, independently of the 189/192 pair. The target AND is present in the authenticated `SEEK AND` clause. The receiver and prediction were frozen in [the precommit](../workplace/20261119-agent3-p0-common-key-scheduler-precommit.md).

The p28 source-derived DH state used by the existing analyses is
`p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3`.
Thus `H(p,e)=[20,26]`, `H(p,a)=[17,0]`, and the state pool used in the finite families is `[g,a,b,A,B,K,e]=[5,6,15,8,19,2,3]`.

## What the two original local families establish

**AND at p0 189..191.** The ciphertext is `[0,6,9]`. The 84-member family `[x,H(p,e)[j],y]`, with distinct `x,y` from the seven-value state pool and `j∈{0,1}`, has one hit against the authenticated three-rune source vocabulary: `[g,p+e,b]=[5,26,15]`. Subtraction modulo 29 gives `[24,9,23]` = **AND**, and forward addition reproduces the original ciphertext. This is a constrained local inverse, not yet a general key schedule.

**THEIR at p0 192..195.** The ciphertext is `[19,12,20,9]`. The 98-member family `[H(p,x)[j],p,K*y,y]`, with `x,y` from the same state pool and `j∈{0,1}`, has one authenticated four-rune hit: `[p-a,p,K*g,g]=[17,23,10,5]`. Subtraction gives `[2,18,10,4]` = **THEIR**, and forward addition reproduces the ciphertext. The competing **PATHS** inverse is also exact: plaintext `[13,24,2,15]` requires residual key `[6,17,18,23]`. That residual is outside the fixed THEIR family because its second coordinate is 17 rather than the family-mandated `p=23`. Therefore the family distinguishes THEIR from PATHS *once the family is fixed*; the evidence does not independently select that family over other possible key grammars.

The two keys share the use of the DH state and `H`, but not one fixed slot rule: the three-rune family uses `H(p,e)[1]` between `g,b`; the four-rune family uses `H(p,a)[0]` followed by `p,K*g,g`. The p50 `3D` selector fixes the AND/THEIR receiver pair, while the `3H` cell partially supports the THEIR first coordinate. No source instruction found so far selects the change from the first template to the second.

## Frozen second AND receiver: transfer fails

The additional source-selected receiver at p0 **254..256** has original ciphertext `[19,4,21]` and printed length 3. Its source selector and target were fixed before this run's raw receiver read; the upstream SEEK/READ OUT report had already published the values, so this is a reproducible cross-route test, **not a blind holdout**.

The precommitted ROAD/NUMBERS key `[5,26,15]` fails at this receiver under both signs:

| Operation | Resulting GP values | Reading |
|---|---:|---|
| `C - [5,26,15]` | `[14,7,6]` | XWG |
| `C + [5,26,15]` | `[24,1,7]` | AUW |
| Target | `[24,9,23]` | AND |

The same 84-member `[x,H(p,e)[j],y]` family has **zero** AND hits at this receiver when both signs are charged. A distinct READ OUT tail family `[x,x,y]` over the same seven state values and both signs has exactly one hit: `[g,g,K]=[5,5,2]` with **addition**. It gives AND, and the inverse forward operation reproduces `[19,4,21]` exactly.

Consequently, the same authenticated target AND has two source-selected p0 receivers with different key templates and opposite signs:

- p0 189..191: `[5,26,15]`, subtraction, selected within the 84-member `[x,H(p,e)[j],y]` family.
- p0 254..256: `[5,5,2]`, addition, selected within the distinct 98-member `[x,x,y]` READ OUT-tail family.

This is not a common scheduler. A source-visible rule mapping the p50 selector to the choice of family, state slots, and sign has not been supplied. Adding a per-receiver exception would evade the gate rather than solve it.

## Decision and research consequence

1. Retain the **NUMBERS → p0 189/192** geometry as a source-supported receiver selection.
2. Retain the AND and THEIR inverses as reproducible, local candidates. The THEIR family excludes the PATHS residual within its own fixed grammar, and p50 cell `3H` independently supports its first key coordinate.
3. Do **not** claim a common key scheduler, a reusable seven-rune stream, or established plaintext for these unknown p0 words. The distinct SEEK/AND receiver demonstrates that the ROAD/NUMBERS AND key family is not transferable.
4. Retire the shared-scheduler hypothesis unless a new first-party clue fixes the family choice, key-slot order, and sign before receiver values are examined. Do not rescue it with extra state fields, per-word exceptions, or alternate radix choices.
5. The failed OPENPGP direction-cycle key remains a separate rejected candidate; it was not used to select this holdout.

This is a bounded negative about the proposed shared scheduler, not a proof that no conceivable source-derived function exists. The strongest next step is to seek a first-party instruction that selects a single key-generation grammar across the distinct p50 receivers, rather than expanding target-conditioned key searches.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_p0_common_key_scheduler_gate_sft.cjs
```

The script reads the canonical GP corpus, original p50 grid, 2016 signed cleartext, and p0 transcription. It asserts both source selectors, the 84/98-member local families, the THEIR/PATHS distinction, the frozen second-AND transfer failure, and exact forward reconstruction.

Related evidence:

- [ROAD/NUMBERS state bridge](lp2-road-numbers-readout-state-bridge.md) and [SFT](../sims/lp2_road_numbers_readout_state_bridge_sft.cjs)
- [SEEK/READ OUT DH-tail receiver](lp2-seek-and-readout-dh-tail.md) and [SFT](../sims/lp2_seek_and_readout_dh_tail_sft.cjs)
- [p0 AND/THEIR word-sum bridge](lp2-p0-andtheir-word-sum-dh-bridge.md) and [SFT](../sims/lp2_p0_andtheir_wordsum_dh_bridge_sft.cjs)
- [p28 DH line6 reconstruction](lp2-p28-dh-line6-source-reconstruction.md)
- [OPENPGP direction-cycle key gate](lp2-openpgp-direction-cycle-key.md)
