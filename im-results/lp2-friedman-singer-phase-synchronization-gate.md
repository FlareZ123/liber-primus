# Interrupted-key superimposition by spectral synchronization — #3042

**Decision, 26 November 2026 (Agent21):** the classical relative-offset superimposition reduction succeeds on sufficiently long native GP29 fragments but fails for the actual LP2 short-group profiles even under favorable assumptions. No original unknown rune was scored, no alphabet/shift action recovered, and the common-cycle model itself remains unresolved.

## Independent algorithm and reduction

William F. Friedman, [Military Cryptanalysis Part III](https://bribes.org/crypto/Military_Cryptanalysis_Friedman_3.pdf), §22(b), printed p26 and §XI, proposes relative-position superimposition for interrupted key material when segments may restart at different phases; alignments are scored by monographic coincidence. This is specifically useful when sections are long enough. Amit Singer, [Angular Synchronization by Eigenvectors and Semidefinite Programming](https://doi.org/10.1016/j.acha.2010.02.001), 2011, §2 ([author manuscript](https://web.math.princeton.edu/~amits/publications/angular_synchronization.pdf)), converts noisy relative offsets into a Hermitian matrix and extracts its top eigenvector. We use a weighted discrete Z8 version of that reduction, rather than another direct alphabet annealer or SAT encoding. Both primary PDFs were available as text; attempted page screenshots returned cache misses.

Model is the corrected [common-cycle receiver](lp2-shared-gp29-cycle-action-calibration.md): C=pi^-1(pi(P)+k_j mod29), eight distinct random shifts (favorable subset), unknown pi fixing F, arbitrary word starts and authentic plaintext F hold. A group with **no observed F** has no held plaintext F, so each position i is consuming and its phase is exactly start+i. No clock oracle is needed for these selected groups. A group containing visible F is excluded from the blind alignment step; this deliberately sacrifices data instead of treating ambiguous ciphertext F as known plaintext F. For groups a,b and positions i,j, phase equality is equivalent to start_a-start_b=j-i mod8. Under the same phase, ciphertext equality is exactly plaintext equality, regardless of the unknown bijection and shift.

The frozen composite score weights each pair using conditional native non-F marginals f_(length,position), g and s=sum_p f(p)g(p). Under an ensemble of uniformly random distinct shifts, conditioning on the two compared output symbols being nonzero gives
- same-phase coincidence probability p=28s/(27+s);
- different-phase probability u=(1-s)/(27+(1-s)/28).

The second formula follows because distinct phases cannot match when the two plaintext symbols are equal, and otherwise match for one of 28 possible shift differences. For each candidate relative offset d, sum log Bernoulli likelihood ratios for comparisons whose j-i=d. Scores for other comparisons are relative to the different-phase baseline. For the active-oracle long positive (true F already removed, consuming ciphertext F retained), use p=s and u=(1-s)/28 instead.

This is a composite pair statistic. Conditioning on the entire word being F-free and native within-word dependencies introduces selection/dependence not modeled by these two-position formulas; pair edges share words, so Singer's independent-edge asymptotic performance theorem is not asserted for this experiment.

Let L_ab(d) be the relative-offset score. Soft-normalize over d and form the Hermitian matrix H_ab=sum_d softmax(L_ab)(d) exp(2pi*i*d/8); H_aa=0. A Gershgorin positive shift and 160 power iterations select the largest algebraic eigenvector. Round its angles to Z8 after estimating the shared continuous rotation from the weighted eighth moment. Deterministic coordinate refinement (up to 30 sweeps) improves the same pair objective. Each held group is classified against the fixed fitted starts; a separate oracle-start benchmark supplies the true training starts, never the hidden key. All evaluations allow only one global rotation. No original fit or key search is permitted before exact synchronization and continuation.

## Data and preregistration

[Claim and frozen plan](https://github.com/FlareZ123/liber-primus/issues/3042#issuecomment-7199228835). Native conditional letter distributions use the first 67% of Shakespeare, Gibran and Emerson donor words (99,877); controls sample the disjoint remaining 49,195 words by length, with replacement. Same GP conversion as the existing shared-pad receiver, 10-observation smoothing to global non-F prior, exact position up to length 10 and pooled longer positions. The true alphabet, distinct shifts and independent uniform starts are freshly drawn per seed. Corrected terminal profile is 47 complete p54 words/213 runes, held full 11-rune carry and 16 p55 words/86 runes. Longer chapter profile is p40–53 669 groups/3008 runes, with a fresh 80-group holdout. Known solved WELCOME and KOAN GP plaintext records are re-encrypted under the proposed model, not represented as historical word-reset ciphertext. Long control uses 48×128 active native runes and 16×128 continuation runes after privileged removal of true F, i.e. a favorable classical-superimposition calibration, not an LP2 model.

## Results

| Plant | F-free fit groups | Spectral correct | Refined correct | F-free held | Blind held correct | Oracle-start held correct | Truth objective | Refined objective |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Terminal 1 | 41/47 | 10 | 11 | 11/17 | 3 | 3 | 18.516 | 75.972 |
| Terminal 2 | 35/47 | 7 | 8 | 14/17 | 0 | 4 | -2.100 | 70.522 |
| Terminal 3 | 35/47 | 11 | 11 | 11/17 | 2 | 2 | 24.076 | 63.059 |
| Terminal 4 | 41/47 | 12 | 8 | 14/17 | 3 | 10 | 19.871 | 108.958 |
| Chapter 1 | 541/669 | 146 | 153 | 69/80 | 16 | 51 | 4819.243 | 8976.273 |
| Chapter 2 | 542/669 | 104 | 108 | 61/80 | 8 | 45 | 5648.000 | 9345.097 |
| Native WELCOME + KOAN | 198/249 | 51 | 50 | 67/83 | 14 | 43 | 576.282 | 1435.666 |
| Long active positive | 48/48 | 48 | 48 | 16/16 | 16 | 16 | 28846.076 | 28846.076 |

The noiseless relative-offset regression recovers all starts in every profile, checking the orientation, global rotation and spectral implementation. Actual pairwise unique-best offsets on terminal plants are only 79/595–124/820; correct best including ties is 91/595–149/820. By contrast 1,128/1,128 long-control pairs uniquely favor the true offset. Terminal true-phase coincidence counts 63/1438 to 105/1407 versus different-phase 314/9881 to 491/13165 (individual counts in JSON). Thus there is real coincidence signal, but it is weak and the selected words are too short for individual offsets.

**Critical failure:** every short-group plant has an explicit wrong assignment with strictly greater composite objective than the truth. Consequently even exact global optimization of this particular coincidence statistic cannot return the true assignment on these seven plants. This is stronger than reporting an eigensolver failure. Even if true training starts are provided, the held group phase predictions are incomplete. The long native positive demonstrates that this is a profile-dependent obstruction to the reduction. It is not an information-theoretic impossibility for full lexical/cycle recovery; richer word likelihood, a source-fixed phase schedule, or independent key operand could change the result.

No alphabet fitting, original scoring or continuation decryption was undertaken because the phase-removal gate failed. Do not restart the same superimposition receiver or another implementation of the same objective. Refer the unresolved common-cycle action to #2722 and independent operand discovery to #3037.

[Reproducer](../sims/lp2_friedman_singer_phase_synchronization_sft.cjs) · [Raw complete control output](lp2-friedman-singer-phase-synchronization-output.json). Actual experiment executed in the connector JS runtime on pinned repository sources. Standalone Node wrapper not separately CI-run. Inputs: corpus 054f2a0f, transcription 43bfeb6b, corrected terminal 8960e113, donors 94c677ad/df260a07/a92be8ba, native 1b064ef6. Seeds 0x30420001–08.
