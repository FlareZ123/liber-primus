# LP2 full-secret five-tap feedback: Fourier native-register and all-alphabet invariant

**Original-input decision, 15 November 2026.** An exhaustive, blind inversion of the **29^5 = 20,511,149** possible global five-tap GP29 linear ciphertext-feedback keys does **not** recover the original unknown-page plaintext. Unlike the earlier four-lag brute force, this includes all five independently unrestricted coefficients, zero as well as nonzero, and uses an exact Fourier score rather than a finite trial-key list. This rejects the **specific global-key, printed-page-local, additive five-predecessor cipher as a direct native-English decoder**, even if the residual runes are subsequently relabeled through an entirely secret fixed alphabet permutation. The stronger alphabet-invariant result was added after the initial Fourier-native result using a distinct complete-key Parseval calculation. It does not reject nonlinear stateful ciphers, different reset clocks, per-chapter keys, additional output postprocessing, or non-English intermediates.

## Motivated but unconfirmed model

The manuscript's low adjacent-doublet rate and excess within-word lag-five echo make a five-symbol predecessor state worth testing. The original does not instruct the reader to choose this model. For an original physical page and every local rune position at least five, posit

```text
P[i] = C[i] - a1*C[i-1] - a2*C[i-2] - a3*C[i-3]
            - a4*C[i-4] - a5*C[i-5]   (mod29).
```

All five coefficients are secret values in GF(29), constant across the complete book. The first five runes of each printed page are excluded from scoring, rather than supplied imaginary predecessors. There is no guessed F bypass, tuned clock, or phase. In the positive control the early page positions have zero missing predecessors and are encrypted and inverted exactly.

**Fixed input:** unaltered `resources/liber-primus/lp2-corpus.json`, 12,956 cipher runes over 55 nonempty physical pages p0–55 (p50 contains the separate rune-free numerical grid). Original physical pp0–27 supply 6,621 eligible training runes; pp28–55 supply **6,060 untouched held-out** eligible runes. The reference register is pinned `resources/control/shakespeare_first300k.txt`, mapped to published GP29 with native solved-Cicada `ING→NG` and `IO→IA` handling. The source-register decision is conditional.

## Exact blind all-key inverse

For any observed position with cipher rune `c` and predecessor vector `x`, place `exp(2πi hc/29)` into the 29×29×29×29×29 tensor at `x`. A complete five-dimensional discrete Fourier transform at frequency `k=h*a mod29` gives **exactly** the sum of `exp(2πi h(P[a])/29)` for each possible vector `a`. Since h=2 and h=4 are invertible mod29, **each transform scores all 20,511,149 keys with no missed candidate**. Harmonics two and four were selected from the authentic held-independent Shakespeare native-GP unigram distribution, not from original cipher output. The SFT checks direct rune-by-rune harmonic sums against the FFT results.

| Test | Original LP2 training, maximum over *all* keys | Independently encrypted Shakespeare native-GP control, true key |
| --- | ---: | ---: |
| Harmonic 2 magnitude / 6,621 | **0.0485227** | **0.2470969** |
| Harmonic 4 magnitude / 6,621 | **0.0494471** | **0.3251276** |

The top original harmonic-2 key is `[6,4,6,2,7]` and top harmonic-4 key is `[21,24,0,8,6]`; both were selected in an exhaustive, unfitted source-page training run. No coefficient vector in the entire space yields the high fourth-harmonic plaintext concentration of the reference English register on original pp0–27.

The 16 highest Fourier candidates for each harmonic were frozen and evaluated on untouched pp28–55. The candidate with the highest held-out Shakespeare-trained unigram score is `[1,4,3,21,6]`. Its actual original held-out **IoC 0.0344598**, fourth-harmonic magnitude per rune **0.0001432**, and native-reference log probability **−4.26638 nats/rune** remain ciphertext-like. Original raw heldout has IoC **0.0345870** and log **−4.33115**, whereas independent Shakespeare GP plaintext has IoC **0.0598430**, fourth-harmonic magnitude **0.3242057**, log **−2.96028**. Some candidate nats improve slightly by chance; none yields a sustained original decipherment.

## A positive control that requires a true full-key recovery

The SFT separately enciphers **all 12,956** source-native Shakespeare rune indices using exactly the same page geometry and the undisclosed-to-search key `[5,17,26,9,14]`. The blind Fourier maxima for **both** harmonics uniquely select the **exact true key**, with original training magnitude 1,636.029 (second harmonic) / 2,152.670 (fourth harmonic). Recovered plaintext matches **12,956/12,956 original planted runes**, exact full forward replay passes, and the held-out 6,060-rune decoded score is the expected native-English one (IoC **0.05984295**). The same experiment performs exact DFT/direct-value consistency checks on the proposed original candidates.

This proves the implemented exhaustive algorithm has adequate detection power for the specified model on a complete native-GP control. It is **not** evidence for an authored historical five-tap cipher. Native-GP register choice, chapter-dependent keys, altered plaintext alphabet and output-state constraints remain separate questions requiring their own original source cue.

**Reproduce:** [single Python SFT](../sims/lp2_fivetap_allsecret_spectral_original_sft.py), using NumPy 2.2.6 and SciPy 1.15.3 on the immutable checked-in corpus. [Successful original-cipher and blind-positive GitHub Actions run 43662369367](https://github.com/FlareZ123/liber-primus/actions/runs/43662369367), job 132654265921. The existing manual `four-lag-feedback.yml` workflow has an explicit opt-in choice `five-tap-spectral` and does not run the older four-lag branch when selected. A first run 43662275913 failed pre-analysis at an unnecessary short Latin-control assertion, which was removed; the successful run contains the full tested source-native corpus. No page decryption or final destination was recovered.

## Full 29^5-key IoC and arbitrary secret alphabet: exact second inverse

A direct GP29 alphabet is a stronger assumption than the puzzle supplies. To remove it, a second **all-key exhaustive** inverse evaluates **the full GP29 index of coincidence** of `C−Σ(a_j C[i−j])` for every possible coefficient vector. A completely arbitrary final fixed 29-rune substitution, any affine GP29 relabeling, any rune-order transposition, and any fixed Vigenère-zero rotation all **preserve the IoC exactly**. The score therefore bounds those downstream classes without needing their unknown alphabet.

Use Parseval's exact identity `Σ_r count[r]^2=(1/29)Σ_(h=0..28)|F_h(a)|²` and aggregate all **14** nonconjugate nonzero harmonics at the **same** key position in the five-dimensional tensor. The `h*x mod29` coordinate pretransform ensures the `h`th DFT correctly scores the original unknown `a` rather than `h*a`. This computes the IoC for all 20,511,149 keys, never selecting a fitted language register or shortcut key subset. Direct GF29 histogram checks at all reported maxima and fixed control keys agree with the spectral result.

| Entire training search over every secret key | Max original pp0–27 | Blind Shakespeare plant |
| --- | ---: | ---: |
| Exact GP29 IoC at maximum | **0.0352727817934** | **0.0615651178778** |
| Maximizing five-part key | **[1,0,0,0,0]** | **[5,17,26,9,14]** |
| Unseen pp28–55 IoC at that fixed key | **0.0354038968842** | **0.0598429524418** |
| Next-highest training IoC | **0.0347813032759** | **0.0347886952816** |

The unique best original key is simply **first ciphertext differencing**, a previously identified statistic; all other 20,511,148 possible five-step coefficient vectors score lower. The original *maximum over the entire family* still falls well below the native plaintext control, and its holdout remains low. A global secret 29-rune permutation applied afterward cannot turn this residual into native-English-like IoC. No recovered unknown-page plaintext exists in this family. The synthetically encrypted Shakespeare source in exactly the same geometry gives a unique correct all-key maximum, with the entire independently held-out section decoded and re-encoded exactly. This is a true positive control for the **complete statistic**, not merely for one expected key.

**Reproduce second independent calculation:** [full-key Parseval IoC Python SFT](../sims/lp2_fivetap_allsecret_ioc_original_sft.py), with the same pinned Python dependencies and original corpus. [Successful original-input and blind full-key plant GitHub Actions run 43662750942](https://github.com/FlareZ123/liber-primus/actions/runs/43662750942), job 132655431799. The existing manual `four-lag-feedback.yml` workflow now offers an independent `five-tap-all-ioc` choice. It runs without the other two modes.

## Decision

Retire **five-tap, globally shared, page-local linear ciphertext feedback as a direct native-English encoder, including any following fixed secret rune permutation**, under the explicitly frozen model. The expensive 20.5-million-key space now has an exact spectral certificate and a planted recovery for both training and withheld pages. Do not add a sixth coefficient, insert a free state or change reset scopes to rescue the model without a separate, independently observable clue. Pursue source-derived actual keystreams, reversible output-state operations and genuine unknown-page plaintext instead.
