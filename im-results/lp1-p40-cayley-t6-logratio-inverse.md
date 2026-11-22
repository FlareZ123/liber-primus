# LP1 MOBIUS / LP2 p40 T6 orbit-ratio inverse gate

**Status:** bounded source-constrained negative. No unknown LP2 plaintext, authentic key, complete cipher, or destination recovered.

## Human solve-path hypothesis

The earlier source bridge gives a plausible route a contemporary solver could notice: LP1 p05 visibly contains the word MOBIUS and its 5×5 prime square; LP2 p40 has an eight-rune red heading whose prime sum is 435 = 29×15 and whose final rune is GP index 8. The projective bridge fixes the affine map T(x)=27x+24=8−2(x−8) mod 29. The p05 MOBIUS sum cell 226 supplies the source-derived orbit seed 21. This defines a 28-cycle on every GP symbol except the fixed point H=8.

The 2016 Cicada wording that “words are the map” and “numbers are the direction” makes a word-local cycle-step encoding a plausible *hypothesis*: map each non-H ciphertext rune to its position in the T-cycle, then encode the transition as a step count along that cycle. For adjacent non-H runes this is a discrete logarithm of the multiplicative ratio after shifting the GP field by H=8. The relationship between the source bridge and the lag-six ciphertext feature was recognized retrospectively, so this is a motivated experiment, not evidence of creator intent.

## Frozen reversible model

Let O be the source-fixed orbit beginning at 21:

**[21, 11, 2, 20, 13, 27, 28, 26, 1, 22, 9, 6, 12, 0, 24, 5, 14, 25, 3, 18, 17, 19, 15, 23, 7, 10, 4, 16]**.

For x≠8, let e(x) be its index in O. With state s initially 0 (the orbit position of seed 21), the primary word-reset model emits

[
d_i = e(C_i)-s_i pmod{28},qquad P_i=O[d_i],qquad s_{i+1}=e(C_i).
]

Equivalently, away from word starts and fixed-point events,

[
d_i=log_{-2}!left(rac{C_i-8}{C_{i-1}-8}ight)pmod{28}.
]

At a canonical word start, reset s to 0. If C_i=8, emit H and reset s to 0. This is exactly invertible: the decoder reads the orbit position of P_i, adds it to the prior state, and recovers C_i. The alternative fixed-point convention swaps the zero-step output with the H-input output; H may either reset or leave the state unchanged. The continuous variant does not reset at word starts.

This is distinct from the existing additive-difference T6 gate, which forms C_i−C_(i−1) in the original field and then ranks that difference in the orbit. This test instead forms a *ratio of shifted field values* and takes its discrete logarithm. It is also distinct from direct powers of T and the previously tested previous-rune exponent-feedback family.

## Original-input result

The source parser and corpus agree on all **12,956** original runes, **2,896** canonical words, and **32** page-crossing words; the runeless numeric page 50 is excluded. The primary source-fixed model was tested along with the 15 narrowly defined alternatives: word reset versus continuous state, forward versus inverse cycle direction, two fixed-point/zero-step output conventions, and reset versus hold at H.

A Shakespeare Gematria-Primus trigram model was trained on the first 240,000 characters and evaluated on the following 60,000 held-out characters. Scores are mean natural log probability per rune; higher is better.

| Input | GP trigram nats/rune | IoC |
|---|---:|---:|
| Original ciphertext | −8.797657 | 0.0344784 |
| Primary T6 log-ratio model | −8.751997 | 0.0349810 |
| Best of all 16 fixed alternatives | −8.674805 | 0.0352830 |
| Held-out native Shakespeare GP | −2.401877 | 0.0586893 |
| Solved LP1 plaintext reference GP | −2.598028 | 0.0612588 |

The best of 16 gains only **0.122852 nats/rune** over raw ciphertext and remains **6.272928 nats/rune** below held-out native Shakespeare. The primary, clue-motivated word-reset direction is still **6.350120 nats/rune** below that control. All candidate IoCs lie between **0.0349810 and 0.0352869**, close to the uniform 1/29 baseline **0.0344828** and far below the native controls. No coherent plaintext appears.

All 16 models exactly invert the original 12,956-rune stream and recover a 300-word / 1,163-rune held-out Shakespeare plant after encryption by the inverse. These are implementation controls only: any deterministic bijective transducer can round-trip arbitrary ciphertext under its own inverse.

## Decision and scope

This is a finite negative for the simple source-fixed **T6 orbit log-ratio differential**: the p05/p40 28-cycle, seed 21, the multiplicative ratio of shifted symbols, direct cycle-step output, and the tested word/continuous and H fixed-point conventions. The result does not exclude an independently keyed or evolving cipher, a different source-selected output mapping, another state register, altered segmentation, or a layered/non-GP intermediate. Do not expand this family by scanning arbitrary phases, seeds, reset locations, or output permutations.

**Reproduction:** Node.js 22 CommonJS, no dependencies: [source](../sims/lp1_t6_orbit_ratio_inverse_sft.cjs). It reads the canonical LP2 parser/corpus, original LP1 plaintext reference, and held-out Shakespeare control. The run asserts exact source counts, the complete 28-cycle, original roundtrips, and native-GP positive controls. This remains supporting evidence, not an established decipherment.
