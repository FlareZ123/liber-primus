# Skip-drift harmonic periodogram for LP2

**Agent 20, 2026-11-10. Status: exploratory negative.** A candidate broad-period peak near 399 runes did **not** clear a matched family-wise null. No recovered key or plaintext. This analysis keeps the initially interesting peak visible with its proper uncertainty rather than promoting it as a discovery.

## Why widen each key-period test?

Earlier work has excluded many fixed-position periodic keys, while the 86/12,901 adjacent-repeat rate motivates a conditional output-rejection model. An encryption key that consumes an extra position whenever a repeated ciphertext rune would appear can drift relative to the observed text. A true key of period \(L\) need not cause enhanced coincidences exactly at ciphertext lag \(L\).

Model the number of extra consumed key positions over an observed lag \(d\) as \(S_d\sim \operatorname{Binomial}(d,s)\), taking \(s=0.81/29\) from the approximately 81% collision-rejection rate and the 29-symbol alphabet. The phases match when \(d+S_d=mL\) for an integer \(m\ge1\). This yields the exact assumed phase-match weight

\[
W_L(d)=\sum_{m\ge1}P(S_d=mL-d)-\frac1L.
\]

The \(1/L\) subtraction removes the uniform-phase floor expected after pointer drift has mixed around the cycle. The probability calculation uses log-factorials to evaluate each binomial term. The implementation includes terms within seven modeled standard deviations of the mean (and a small rounding margin). For the real data, the kernel is a **model-based proxy**, not a verified description of an actual Cicada key pointer.

For observed rune sequence \(C\), let \(H(d)=\#\{i:C_i=C_{i+d}\}\). The normalized score is

\[
Z(L)=\frac{\sum_{d=30}^{8000}[H(d)-(N-d)/29]W_L(d)}
{\sqrt{\sum_{d=30}^{8000}(N-d)(1/29)(28/29)W_L(d)^2}}.
\]

We compute this for every integer \(L=29,\ldots,1600\) on all 12,956 unsolved rune symbols, joined in page order. This tests 1,572 candidate periods and 7,971 lag bins. A terminal Z-value should **not** be interpreted as an unadjusted standard-normal significance claim: the long-lag equality counts and overlapping kernels are dependent, and the period is selected from many options.

## Empirical calibration and evidence

An on-demand [successful GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/42745245959) executes the entire scan, a planned-length synthetic encryption control, and 60 fixed-seed null repetitions. The null retains the actual 55 physical rune pages and their within-page symbol frequencies and adjacency patterns, while independently circularly rotating each page to disrupt long-range cross-page phase coherence.

| Statistic | Observed |
| --- | ---: |
| Best exploratory candidate | period **798**, score **3.6303** |
| Closely related harmonic | period **399**, score **3.6192** |
| Other nearby candidate | period **799**, score **3.5435** |
| Median of 60 null full-scan maxima | **2.9196** |
| 95th percentile of null full-scan maxima | **3.7631** |
| Largest null full-scan maximum | **4.2908** |
| Family-wise upper-tail empirical \(p\), +1 correction | **0.11475** |

The actual 399 and 798 peaks are suggestively related by a factor of two, but the family-wise test gives no reliable evidence of a repeated key. Inspection after selection found small positive signs at period 399 in both halves of the corpus, but such a descriptive split does not provide a new independent replication.

**Positive control.** The same detector was run on a newly generated **length-399 repeating additive key**, with otherwise independent random GP key symbols chosen to avoid adjacent equal values, iid plaintext from the independently measured solved-LP1/LP2 rune prior, and 81% collision-triggered key-pointer skipping. The ciphertext has exactly the real corpus length. The true injected period 399 scored **5.7047**, while the strongest peak was the nearby period **400**, score **9.1656**. The one-symbol offset of the best synthetic peak shows the limits of approximating the dependent rejection process with an independent binomial skip-rate proxy. This positive control demonstrates meaningful power for a planted periodic key, though not universal recovery at the exact period.

## Interpretation, caveats, next action

The periodogram adds a genuinely skip-tolerant *family-wide* spectral diagnostic to the research toolkit, and it does not support an LP2 period under the tested global continuous key and skip model. The calibrated peak at 399/798 should **not** be used to infer a key or fill in plaintext. A further exploratory parameter search over rejection rates would require its own family-wise calibration.

Limitations: the null independently rotates entire physical pages, potentially missing phase phenomena confined to a page or section; the 0.81 rejection rate and iid skip assumption are hypotheses; the balanced-period correction is approximate for arbitrary unbalanced key alphabets; the synthetic test was a single planted key. The original source has 55 rune-bearing pages plus one numerical-only page. The scan does not split words at physical page boundaries and does not claim to identify an intermediate language.

Executable: [skip_drift_period.cjs](../sims/skip_drift_period.cjs); manual [workflow](../.github/workflows/skip-drift-period.yml); [corpus](../resources/liber-primus/lp2-corpus.json). For a complementary exact finite-state test of linear 29-position keys, see [skip-aware-ramp-hmm.md](skip-aware-ramp-hmm.md).
