# Source-derived p3 quotient Q does not deconvolve p15's black body

**Agent15, 28 November 2026. Prospective original-input negative for the direct polynomial cipher operation, not unknown plaintext recovery.**

## Intended operation and original receiver

The doubly red-13-bracketed physical p3 triad `[13,23,2]` defines the GF29 polynomial `f(x)=13+23x+2x²`. The p15 second red11 minus the solved p57 red7 divides exactly by `f`, giving the **already source-derived** nine-coefficient quotient `Q=[5,5,14,9,10,4,27,17,25]`. A previous experiment tested Q as a period-nine repeating *additive* key. It did not test the polynomial product/division operation actually used to construct Q.

Before opening the source receiver under this new operation, [the pretarget lock](../workplace/lp2-p3-q9-formal-series-p15-body-pretarget.md) fixed the only attached black target: physical **p15 rune offsets20–158 (139 runes)**, directly after red9+red11, read in printed ascending GP0 coefficient order. The lock was independently pushed in [commit `b7d3c29`](https://github.com/FlareZ123/liber-primus/commit/b7d3c29be04c1e1c0978367cc175699af7d49b84).

Treat the original ciphertext as `C(x)` in `GF(29)[x]/(x^139)`. As `Q(0)=5`, inverse6 mod29, the only two source-natural options were:

- **Divide:** `P=C/Q`, with `P_i=6(C_i−Σ_{j=1..min(8,i)}Q_j P_{i−j}) mod29`.
- **Multiply:** `P=C*Q`, with `P_i=Σ_{j=0..min(8,i)}Q_j C_{i−j} mod29`.

Both are exact length-preserving invertible finite-field maps with no fitted key, phase, reversal, skip, or per-word reset.

## Actual 139-rune original-input outcome

| Exact source/candidate | IoC numerator `Σ n(n−1)` | IoC |
| --- | ---: | ---: |
| Original p15 black ciphertext | 670 | 0.03492858 |
| Deconvolution `C/Q` | **636** | **0.03315608** |
| Convolution `C*Q` | **672** | **0.03503284** |
| Least concentrated of **1,882** same-length original solved-GP plaintext windows | **980** | **0.05108956** |

All IoCs have the same denominator `139×138=19,182`. Thus both source-fixed candidate inverses have fewer repeated plaintext-symbol collisions than *every* matched genuine solved native-GP passage. Their full canonical GP transliterations are nonprose (division begins `THRROEEPEAMFBEAXHLNAEHTHWSDOEABCBPI`; multiplication begins `NGYNGXTEOUNEGGWCNGOERYNGIFWDPCA`).

The [CommonJS SFT](../sims/lp2_p3_q9_formal_series_p15_body_sft.cjs) derives Q afresh from the three original source ranges by exact GF29 polynomial division, verifies all 11 remainders vanish, runs both unchanged inverses, confirms complete original forward-reencryption, and performs two full-length synthetic known-solved GP29 plants. Its nine independent solved-text records provide all 1,882 matching 139-rune windows. Both plants recover **139/139**, confirming the algorithm can invert genuine output of the proposed construction; original negative is not an inverse bug.

## Cryptanalytic decision

The literal **Q product/division as a one-step native GP29 body cipher** is now retired for its natural original p15 black receiver. This does not disprove arbitrary higher-stage transforms or source-local Q as a page-navigation/state object; the independently exact P3 polynomial factorization, solved-p56 prefix, Q multiplication matrix spelling THE MAP / AND PATH, and local red-state links remain intact. No new provenance or field-role coincidence is being counted as plaintext.

Do not post-hoc rescue these two frozen original outputs by flipping coefficient direction, adding secret shifts, resegmenting original words, or assigning an unidentified extra cipher. Reopen only if independent first-party source cues choose a different recipient/operation that makes a locked, discriminating plaintext prediction.