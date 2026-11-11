# Label-free GP29 shared-pad hypothesis: consolidated original-cipher test

**11 November 2026. Classification: source-blind, statistical original-input constraint.** No unknown LP2 plaintext, actual key, cipher mechanism, or final destination is recovered. Two tests now assess a common page-aligned secret GP29 additive pad, permitting **an entirely arbitrary, independently chosen 29-rune output permutation on every physical page**. The newer spectral test is substantially more sensitive to realistic planted examples, although the original source remains compatible with its matched null.

## Explicit candidate and invariant

The hypothetical forward model is \(C_{p,t}=\sigma_p((P_{p,t}+K_t)\bmod29)\), with the same unknown \(K_t\) on each original page \(p\), and a *different unrestricted unknown* page permutation \(\sigma_p\). No Cicada clue presently establishes that pages share such a register. Per-page label permutations cancel exactly from the within-page equality \(E_p(t,u)=1[C_{p,t}=C_{p,u}]\). If plaintext is natively GP-encoded English and a nonuniform shared pad is reused, the matrix of those equality indicators can contain a low-rank across-page alignment signal. Excluding all \(|t-u|<8\) avoids domination by the unusually low original adjacent-repeat rate.

### Higher-powered label-free spectral experiment (Agent 1)

Take the **47** rune-bearing original pages of length **at least192** and the first192 physical-page-local GP indices from each. For each page calculate its observed glyph-pair collision rate \(\rho_p=\sum_a n_{p,a}(n_{p,a}-1)/(192\cdot191)\). Form a symmetric \(192\times192\) matrix with entries \(M_{tu}=\sum_p(E_p(t,u)-\rho_p)/\sqrt{47}\) for \(|t-u|\ge8\) and zero elsewhere. The statistic is the signed leading eigenvalue approximated with 75 seeded power iterations. This retains cross-position structure lost by the original scalar coincidence test. It is a detector and does not identify \(K\).

The fixed-seed matched null **circularly rotates each original entire page** independently, then repeats the complete calculation, 120 times. Each null preserves page inventories, full local ordering, and near-neighbor repeat properties. The positive control uses 100 independent encryptions of 47 contiguous Shakespeare-native GP passages, with one **fresh common 192-position GP29 pad**, an *independent arbitrary 29-way output bijection per page*, and an **81% probability of changing an immediately repeated output rune**. The last operation makes synthetic repeat frequency comparable with the printed original, although it is not a known reversible Cicada operation.

| Measure | Observed result |
| --- | ---: |
| Original source spectral score | **5.66387508500531** |
| 120 original-page rotation nulls, min / median / max | **5.166000 / 5.491927 / 5.817223** |
| Null scores at least as high as original | **9 of 120** |
| Empirical one-sided plus-one upper tail | **10/121 = 0.0826446** |
| 100 native shared-pad plants, min / median / max | **5.935303 / 6.635430 / 7.222342** |
| Plants above the maximum of all120 null scores | **100/100** |
| Median planted adjacent-equality rate | **0.00646096** |
| Original adjacent-equality rate, same 47×192 positions | **0.00657235** |

The spectral window 192 was fixed after an initial exploratory short-screen, before the 120-null/100-plant follow-up; the empirical upper tail is conditional on this window and is not discovery-wide multiplicity corrected. A conventional one-sided 5% finding is **absent**. The strong planted sensitivity is specific to native GP-English, 47 shared pages, fixed page alignment and the declared repeat repair, and should not be generalized to arbitrary hidden-register languages, key skips, missing glyphs, cross-page shifts or independent per-page pads.

**Reproduction:** [standalone Node22 source/input/power SFT](../sims/lp2_label_free_sharedpad_spectral_sft.cjs), fixed seed \`0x52f17e3a\`; independently executed and passing [GitHub Actions run 42978052050](https://github.com/FlareZ123/liber-primus/actions/runs/42978052050). Select \`attack=spectral\` in [existing manual-only workflow](../.github/workflows/label-free-reuse.yml).

### Earlier scalar coincidence benchmark (Agent 3)

Using all **55** original rune-bearing pages and all **34,980** eligible page-local pairs supported by at least ten pages, the earlier [source-blind scalar test](../sims/label_free_reuse.js) formed \(T=\sum_{t,u}\binom{\sum_pE_p(t,u)}{2}\). Original \(T=39,012\); 250 seeded circularly rotated source controls mean **38,937.872**, SD **192.416**, \(z=+0.385\), one-sided plus-one \(p=0.33466\). A single common-key planted 46-page, 200-rune control yielded \(T=22,368\) versus its 120-null mean **22,127.867**, \(z=1.848\), empirical \(p=0.04959\), illustrating modest detection. The SFT and [passing manual CI 42738776184](https://github.com/FlareZ123/liber-primus/actions/runs/42738776184) are preserved; select \`attack=original\` in the updated existing workflow.

## Interpretation and next decision

The new test answers the earlier request for a genuinely more powerful, alphabet-free common-pad detection method: the original remains in the null range, while **all 100** explicitly shared-pad native plants exceed even the largest matched null. Neither test constitutes a key-recovery algorithm, plaintext recovery or a proof of impossibility for all common keys. For this specific fixed physical-page-aligned common-pad hypothesis, there is no compelling positive evidence meriting additional source-blind sweeps. The next research gate is **an independently source-selected original key, reset rule or lossless non-GP register that produces an actual frozen-page plaintext prediction**; different source-selected pad architectures remain open.
