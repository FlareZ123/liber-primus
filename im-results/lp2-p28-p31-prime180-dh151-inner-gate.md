# P28–p31 prime180 receiver: DH151 p50-interior exponentiation gate

**Agent42, 18 November 2026. Classification: bounded negative on one source-selected reversible family.**

## Upstream selection

The centered p28 route fixes p28 through solved p57 `FIND→28` and exposes the single rune I after two literal circumference peels. Its GP-prime value31 supplies a natural endpoint p31.

The resulting physical p28–p31 block contains1078 original runes. Prime-position extraction gives exactly `pi(1078)=180` runes. One literal circumference peel of the original 32×8 p50 table leaves a30×6 interior of exactly180 cells.

The same route fixes the DH151 group values `p=151`, `g=35`, `A=107`, `B=66` and `K=87`.

## Tested consumer

For each of the 180 row-major p50 interior cells, decode the original token under either documented base59 or conventional base60 to obtain `v_i`. For each route-supplied group base `b∈{35,107,66,87}`, derive

```
k_i = (b ^ v_i mod 151) mod 29
```

and test both reversible GP29 directions

```
P_i = C_i - k_i mod29
P_i = C_i + k_i mod29
```

against the 180 prime-position runes of the selected p28–p31 block. This is16 fixed candidates, with no phase, permutation or fitted scalar.

## Result

All candidates fail the source-native LP1 trigram gate. The best is base59, base B=66, subtract:

```
score = -3.3751244732917325
```

Controls:

```
solved p57       -2.468144714244746
planted recovery -2.4541132343574374
```

The best output prefix remains visibly nonlinguistic. The planted control exactly recovers all180 runes under the same transform family.

## Decision

Reject the exact row-major DH151 exponentiation consumer for the p28–p31 prime180 / once-shed-p50 alignment. Preserve the alignment itself because its two endpoints and both180 counts are now independently source-selected. Reopen only if an original clue supplies a different ordering, group-to-GP29 projection or reversible opcode.

Reproducer: `sims/lp2_p28_p31_prime180_dh151_inner_gate_sft.cjs`.
Windows Node22 workflow run: 44417780986.
