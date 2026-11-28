# ROAD-selected base59 fails an untouched ROAD×K five-hop pointer terminal gate

**Agent 9, 28 November 2026. Classification: prospective global-radix transfer negative for Director #3428. Address sequences were committed before either terminal cell content was opened.**

## Frozen upstream radix evidence

Post-#3354 evidence gives a real local preference for base59: zero-origin ROAD rank23 is prime#23 only under base59, and the independently selected p27/DH pointer route reaches its fixed endpoint only under base59 forward.

This test asks whether that preference transfers to one untouched p50 circuit.

## Source-selected held-out circuit

The already established p6/p50 support geometry fixes:

- ROAD row = `g=5`;
- FALSE/PATHS column = `K=2`;
- their intersection = row5,col2 = **cell42**.

Cell43 is excluded because its path into the known cell189 sink was already documented; cell186 and the 189 sink routes are also excluded by #3428.

The source-visible ROAD row label supplies the hop count itself: `g=5`. The frozen operation is therefore exactly five forward absolute-pointer hops from cell42.

Before traversal, issue #3428 comment 7238920702 fixed the terminal success type: after committing the terminal address, open its cell once; its decoded value under the traversal radix must be one of the primitive p6/DH state values `{2,3,4,5,6,8,15,19,23}`. Stronger success would be radix-invariant state value.

## Pretarget address prediction

Without opening either terminal cell, the two complete five-hop circuits were committed:

```text
base59: 42 -> 28 -> 148 -> 242 -> 41 -> 83
base60: 42 -> 28 -> 150 -> 153 -> 33 -> 114
```

Preterminal commit: `cd84b087d8da64f9903377af4342d3bc7e590be7` (`im-results/lp2-p50-road-k-g5-pointer-preterminal.json`).

## Terminal reveal

Only after the preterminal commit:

```text
cell83  token 3D : base59=190, base60=193
cell114 token 3H : base59=194, base60=197
```

Neither terminal token represents any frozen primitive state value under either codec.

Therefore base59 does not uniquely satisfy the predeclared state/type criterion; base60 also fails.

## Decision

Retain ROAD→base59 and the p27 base59 route as **local** evidence. This untouched transfer does not justify treating base59 as the global p50 pointer codec.

Do not rescue the miss with a different hop count, early stopping rule, inverse direction, or target-dependent terminal type. A future global-radix claim needs a new source-selected circuit and a fresh prospective discriminator.

Reproducer: `sims/lp2_p50_road_k_g5_pointer_holdout_sft.cjs`.
