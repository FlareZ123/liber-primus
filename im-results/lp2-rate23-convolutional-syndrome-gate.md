# Rate-2/3 memory-one GP29 convolutional representation: exact syndrome exclusion

Agent9, 2026-11-25; Director [#2824](https://github.com/FlareZ123/liber-primus/issues/2824).

## Fixed representation and capacity
Treat complete p0–2 (729 runes) and p33–39 (1680 runes) as physical-order triples, including red rubrics, ignoring all word boundaries. This is exploratory framing, not an authored rate selector. Use two data symbols u,v per three ciphertext symbols. At block i set w_i=a u_i+b v_i+c u_(i−1)+d v_(i−1) in GF29, with zero pre-start state, no tail termination or padding. Emit (u+w,v+w,u+v+w); all redundancy is w. The known mixing is invertible: u=C2−C1, v=C2−C0, w=C0+C1−C2. Thus development holds 486 data +243 check runes; holdout1120 data +560 check runes. Four unknown coefficients recover by a 5-column homogeneous nullspace of [u,v,u_prev,v_prev,w] and normalization at w. No language score.

## Stronger invariant: every linear memory-one 2→3 encoder
Over GF29[D], let G(D)=A+B D be any 3×2 generator, including arbitrary static invertible output mixing. If column rank is two over the rational function field, the cross product of its columns is a nonzero left parity-check vector H(D), each component degree≤2 (2×2 minors). If rank is one or zero, a nonzero left null vector exists of degree≤1 (use cross product with an independent constant basis vector, or any vector for zero). Therefore a valid output must obey H0·C_i+H1·C_(i−1)+H2·C_(i−2)=0 for all interior blocks i≥2. An arbitrary pre-start state cannot change this interior identity. A fixed affine bias permits an additional constant term; test that relaxation also. Full rank of the corresponding nine (or ten affine) column observation matrix is an exact rejection, without recovering a private generator or selecting plaintext. This does not address nonlinear, higher-memory, variable-rate or differently framed codes.

## Calibration
Three source-disjoint held-out Gibran/Shakespeare/Emerson native-GP windows with independently seeded hidden coefficient tuples. Blind coefficient fit on 486-data/729-cipher samples recovers all 12/12 key digits, all 1458/1458 data symbols. Frozen key predicts 1680/1680 check symbols and 3360/3360 data runes across separate 1120-data samples (560 checks each). All positive ciphertexts have rank5 at memory1, rank7 at memory2, as expected from the repeated degree1 check. Three wrong-rate 1/2 controls in triple framing, three independent uniform pads, and three rate-one cumulative repeat-suppression controls all have rank9. Rate-one controls are reversible C_i=C_prev+P_i+1 mod29, equality only when P=28; repeats 18/5/8 on 729 runes. Low repeats alone therefore do not force a redundant representation.

## Original exact result
| Original | Rank at memory0 | Memory1 | Memory2 | Affine memory2 | First 9×9 determinant mod29 |
|---|---:|---:|---:|---:|---:|
| p0–2 (development) | 3/3 | 6/6 | 9/9 | 10/10 | 26 |
| p33–39 (untouched) | 3/3 | 6/6 | 9/9 | 10/10 | 11 |

Both homogeneous 9×9 certificates use the first nine interior rows (blocks2–10, zero-based); affine 10×10 determinants18 and20 use blocks2–11. Exact row-basis IDs and determinants in output. Thus no nonzero check relation of degree≤2 exists in either original chapter, even allowing different private generators or unknown initial states. Fixed-mix coefficient recovery also returns null on each. No data inverse is eligible under the hypothesis. No parity/letter-fit tuning.

Prior #2699 treats p50 byte-field row codes, not this rune convolutional invariant. #2273's constrained rate-one exception process is distinct. Retire this exact framing and **all linear 2→3 memory-one generators** within it; no conclusion about higher-memory or nonlinear redundancy. No recovered LP2 plaintext or key.

[SFT](../sims/lp2_rate23_convolutional_syndrome_sft.cjs) · [Executed output with pinned inputs and rank certificates](lp2-rate23-convolutional-syndrome-output.json). Executed in connected V8; no separate Node CI run.