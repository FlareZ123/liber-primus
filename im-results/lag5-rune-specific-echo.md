# LP2 lag-five fixed-rune echo: 29-rune corrected, word-conditioned evidence

**Classification:** strengthened independent control of a previously reported ciphertext structure. This is not a new plaintext, cipher key, or identification of the encryption scheme.

## Observation and relation to the known lag-six echo

The [external pnotisdev/cicada3301 analysis](https://github.com/pnotisdev/cicada3301/blob/main/results/analysis/echo_values.txt) reports 104 equality matches at lag five within LP2 ciphertext words, with a particularly strong concentration in rune \`ᛋ\` (index **15** in the Gematria Primus alphabet). Its observed \`ᛋ\` pair count is **11**.

The question here is whether this concentration survives a null that retains **each word's exact rune frequencies**, length, and adjacent doublet count. Such a control is more restrictive than independent uniform runes and preserves the manuscript's strong immediate-repeat depletion by construction. It also provides a **29-rune familywise correction** using separate train and test randomizations.

## Exact test

- Select the first 55 rune-bearing page records of \`resources/lp2-transcription.txt\`. Exclude the following two solved records, AN END and PARABLE. Combine line/page wraps without breaking words; preserve the canonical \`- . & $\` word delimiters. The unsolved corpus is 2,896 words / 12,956 runes.
- Within the **815 words of at least six runes**, there are **2,105** positions capable of comparing rune \`c_i\` with \`c_(i-5)\`.
- For each of 3,000 **training** null manuscripts: shuffle the rune indexes in each eligible word, rejecting any shuffle that changes that particular word's exact number of immediate equal adjacent runes. Accumulate the lag-five equality matches separately for all 29 rune identities and estimate 29 independent means and standard deviations.
- In 3,000 **disjoint testing** randomizations with the same constraint, compare the maximum standardized score over all 29 rune identities against the original manuscript's maximum. No training example contributes to its own calibrated test threshold. The generator is deterministic xorshift32, seed \`0x38a729bb\`.

## Results

| Statistic | Observed | Conditional null |
|---|---:|---:|
| All lag-five equal pairs, all runes | 104 / 2,105 eligible | Not the primary per-rune test |
| Lag-five \`ᛋ\` to \`ᛋ\` pairs | **11** | Train mean **2.0393**, SD **1.3127** |
| Standardized \`ᛋ\` excess | **+6.826 SD** | Largest of 29 observed rune scores |
| Next-highest observed rune score (\`ᛝ\`) | +2.734 SD | Train-scaled |
| Largest 29-rune score across 3,000 independent null manuscripts | **+6.826 SD** observed | **+5.363** was the largest null maximum |
| Any 29-rune null maximum ≥ observed maximum | | **0 / 3,000**; empirical familywise upper p **0.0003332** |
| Fixed-\`ᛋ\` test null mean | | **2.040**, 0 / 3,000 equal or above 11 |

The 11 \`ᛋ\` pairs occur in **11 distinct words** (no single word accounts for the signal). The full-repertoire permutation control ensures the effect cannot be explained simply by unusual \`ᛋ\` counts in those words. The conditioning on adjacent doublets also excludes a trivial consequence of the separate anti-repeat phenomenon.

## Expanded 174-hypothesis short-lag correction

As an additional check of selection across distances, an independent scan covered **all 29 rune identities at every lag 2–7**, a total of **174 specified cells**. Lag 1 was excluded because of the established immediate-doublet suppression; all lags through 7 have at least 731 within-word eligible positions. The same exact per-word rune-multiset and adjacent-repeat-preserving permutation was used, with a separate 3,000-sample training calibration and 3,000 independent test nulls, seed \`0x284ed557\`.

The strongest of all 174 original standardized scores is **still the lag-five ᛋ identity**: 11 observed, calibration mean **2.02333**, SD **1.31686**, z **+6.81672**. No 3,000 test null manuscripts had any of their 174 standardized scores reach this maximum; the largest null maximum was **6.55191**, giving a whole-specified-family empirical p **0.0003332**. This extends the fixed-lag 29-rune correction and reduces concern that an immediately adjacent short lag supplies an equally strong artifact. It remains conditional on the preselected range 2–7 and on the historical discovery of the signal.

Reproduction: [\`sims/short_lag_rune_identity_scan.cjs\`](../sims/short_lag_rune_identity_scan.cjs) (deterministic CJS, default 3,000 training + 3,000 test samples).

## Mechanism discriminant: no dense affine map fixing ᛋ

The privileged \`ᛋ\` symbol might be explained by a broader affine map that fixes its GP index 15. Every invertible map in this family has form \`U_a(x)=15+a(x-15) mod 29\` with \`a=1,...,28\`. To test this hypothesis without falsely counting the known S-to-S matches as support for *every* slope, the [fixed-point sieve](../sims/lag5_affine_fixedpoint_sieve.cjs) **excludes all pairs with either source or target equal to S**, then scores the remaining pairs separately for each of the 28 slopes. It uses the same strictly word-conditioned null and independent training/testing halves (2,000 each; seed \`0x64c99a85\`).

The best non-S map was \`a=16, b=7\` with **91** nonfixed matches against a null mean of **69.7345 ± 7.9770** (SD), a +2.666 SD excess. **249 of 2,000** test randomizations had a maximum across the 28 maps at least this high: familywise p **0.12494**, so the broad fixed-point affine explanation is **unsupported at available power**. The identity map \`a=1\`, excluding S, had 93 matches against mean 74.4035 (z=2.407), also below the familywise threshold.

This helps distinguish a **value-specific S recurrence** from a dense affine lag-five recurrence with S as fixed point. It does not exclude a sparse affine rewrite, a different class of map, or noncausal source-text structure.

## Interpretation and limitations

The independently published **lag-six relation** \`c_i=24-2c_(i-6) mod 29\` and the **lag-five identity relation concentrated on rune ᛋ** are separately significant under the same stringent per-word randomization principle (see [lag-six counterpart](lag6-conditioned-echo.md)). A plausible cipher-generation model must account for both, along with the global adjacent-repeat suppression and the observed word-length statistics.

The 29-rune correction applies to the 29 symbols at the **already selected lag five**. It does **not** correct the external discovery process across other lags, transformations, encodings and multiple investigations. The observation is compatible with a sparse word-aware rewrite (possibly using a privileged constant rune), but neither fixes which sites were deliberately modified nor reverses the key-dependent encryption layer. Do not treat either echo as plaintext.

## Reproduction and references

The runnable, deterministic CommonJS script [\`sims/lag5_rune_specific_echo.cjs\`](../sims/lag5_rune_specific_echo.cjs) uses only built-in Node.js libraries plus [the shared rune-preserving parser and shuffler](../sims/lag6_conditioned_echo.cjs). It prints input SHA-256, all leading rune scores and exact null exceedance counts as JSON. Expected headline values with the repository transcription and default seeds: top rune index 15, 11 observed, training mean 2.039333, SD 1.312676, \`z=6.8262567\`, zero of 3,000 family maxima meeting it.

Prior art: [pnotisdev echo-value measurements](https://github.com/pnotisdev/cicada3301/blob/main/results/analysis/echo_values.txt) and [mechanism simulator](https://github.com/pnotisdev/cicada3301/blob/main/work/mech25/sim25.py). Those prior observations are not claimed as original here; the word-specific constrained null, split-sample familywise calibration and independent implementation are the contribution.

**Next consequential experiment:** Build and test on held-out pages a single explicit repair rule that predicts where lag-five \`ᛋ\` duplications and six-position affine echoes occur without selecting the match sites after seeing ciphertext. If that mechanism also predicts the doublet deficit and yields a reversible key-consumption schedule, it could support actual decryption.
