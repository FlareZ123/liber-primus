# Original LP2 differential plaintext-feedback inverse and all-secret output-alphabet obstruction

**Agent 24, 13 November 2026. Classification: bounded original-cipher exclusion, including every fixed secret 29-symbol substitution for the specified prime/totient step family.** No unknown LP2 plaintext, authentic secret, decoder or continuation destination was recovered. The research question is whether adjacent ciphertext differences are generated from a preceding-plaintext GP prime law.

## Causal model, with a concrete original-source motivation

The original LP2 pp0–55 contain **12,956 unchanged GP29 runes**, with **86** unchanged adjacent pairs among 12,901 page-internal transitions. The solved *Wisdom* text says the primes and totient function are sacred; the separately solved p56 actually uses consecutive prime totients as its key. A simple related hypothesis is that an LP2 unknown page is a running cipher in which the previous *plaintext* rune's printed Gematria prime gives a step:

```text
D[i] = (C[i] - C[i-1]) mod 29
D[i] = (P[i] + sign * f(P[i-1])) mod 29
f(x) = GPprime(x), GPprime(x)-1, or GPprime(x)+1
sign = +1 or -1
P[i] = (D[i] - sign * f(P[i-1])) mod 29
```

For a selected function and sign, only the initial plaintext rune on a page is unknown; all subsequent plaintext is uniquely determined. **Every one of the 29 possible initial GP symbols** is therefore tested independently on every original rune-bearing physical page. The best seed for each page is allowed to maximize its *own* GP29 coincidence. This gives the proposal much more freedom than requiring a common unknown seed for all chapters. The author has **not** supplied an instruction selecting this recurrence; its value is the possibility of an immediate key-free original inverse.

The `GPprime+1` variant is included because earlier tests of a **different** running-key equation found that this lookalike can suppress doublets in authentic GP prose. Here it is applied to the full **ciphertext-difference** stream, with a first-order *plaintext* rather than *ciphertext* state. This is not the earlier direct `C[i]=P[i]+K[i]` GP-prime running-key scheme and not the GP28 discrete-log predecessor-exclusion model.

## Actual original-cipher inversions

The exact standalone implementation [`sims/lp2_delta_plainfeedback_source_gate_sft.cjs`](../sims/lp2_delta_plainfeedback_source_gate_sft.cjs) reads [the unchanged original rune indices](../resources/liber-primus/lp2-corpus.json). For each of the six independently specified operators, it fully decodes **29×55** original-page candidates, selects the highest-IoC initial plaintext per page, and pools those already-optimized outputs. A true direct native-GP decoder would yield strong GP-English coincidence in the reconstructed long text. All the original pooled values remain close to the random 29-rune reference **1/29 ≈ 0.03448276**.

| Increment function | Sign | Pooled GP29 IoC with a separate best secret starting rune on each page |
| --- | :---: | ---: |
| GP prime | + | **0.034527884003** |
| GP prime | − | **0.034562963992** |
| Euler totient of GP prime | + | **0.034522164440** |
| Euler totient of GP prime | − | **0.034528003161** |
| GP prime + 1 | + | **0.034523546667** |
| GP prime + 1 | − | **0.034563059318** |

The page-local IoC maximum on short **p55 (76 runes)** can exceed 0.04 by selection among 29 seeds, but its displayed GP transliterations remain incoherent; these short-page maxima do not transfer to the original book. The six families have **no credible original plaintext opening** and no seed that creates a native-GP full-book output.

A source-native positive plant takes the independently solved p57 **95-rune PARABLE** plaintext, tiles it over the exact original 55 page sizes with page-dependent known offsets, and encrypts every page under **all six** proposed recurrences, with independently chosen original ciphertext initial values. With the correct hidden plaintext initialization, **every symbol decrypts and forward re-encrypts exactly**, and the pooled native-GP sample has **IoC greater than 0.055** in all six variants. The original negative therefore cannot be explained by an incorrect inverse implementation.

## Wider affine differential recursion

Without selecting prime weights, ask whether a *fixed unknown affine coefficient* in the immediately previous recovered-plaintext register could decode the observed ciphertext steps:

```text
D[i] = P[i] - b*P[i-1] - a  (mod29)
P[i] = D[i] + b*P[i-1] + a (mod29)
```

A constant plaintext shift leaves IoC unchanged. For `b != 1`, the combination of arbitrary intercept and initial state can be written as `X[i] + k*b^i + constant`, where `X[i]` is the unique zero-seeded recursion with `a=0`. For `b=1`, it reduces to `X[i] + k*i + constant`. Thus **813 affine-equivalence classes** exhaust all 29 multipliers and 29 variable amplitudes under one shared affine schedule, with state reinitializing at every original physical page. The script exhausts them without selecting a wordlist or key phase.

The highest within-page coincidence in all **813** classes is **0.035405878181**, at **b=0**, where the transform is simply the already-known `D=C[i]-C[i-1]` anti-doublet fingerprint. For every **b≠0** model, the maximum original within-page coincidence is only **0.034981010165**; its long pooled readout is near uniform. All genuine feedback choices fail to uncover an LP1-like plaintext register. This does not exhaust every independent per-page secret amplitude, multiple lags, non-affine extra key stream, different language or alphabet, or resegmentation.

## All-secret 29-symbol difference-alphabet obstruction

The direct inverse above assumes that each plaintext-generated increment is written as its ordinary numeric value. A larger and more defensible original mechanism would output that increment through a **completely secret permutation** of all 29 GP symbols:

```text
U[i] = (P[i] + sign*GPprime(P[i-1])) mod29
D[i] = secretPermutation[U[i]]
```

The secretPermutation may be **any** of the **29!** one-to-one tables, with no affine assumption, source-grid derivation, known key, or recoverable starting plaintext seed. The key-free necessary condition is exact: a permutation only relabels the 29 observed symbol bins, so its **sorted 29-bin frequency vector is invariant**. The `GPprime−1` and `GPprime+1` variants also only shift this intermediate alphabet by a constant for a fixed sign, hence have **the same sorted vectors**. The original source's 12,901 page-interior increments, without fitted word-boundary phase, have sorted minimum **86**, maximum **510**, median **457**.

Using the native GP word transliterator already employed in previous Shakespeare/Emerson/Gibran controls (normalize V→U, K→C, QU→CW, Z→S, greedily contract published GP digraph symbols), we formed 12,956-rune contiguous control windows and computed the same 12,901 within-page increments using the **exact original page lengths**. For each fixed sign and control, the first window starts at offset0 and following windows advance by **1,301 GP runes**. We then minimize the total-variation distance between the sorted original and control histograms across every tested window. This already grants the **best possible secret permutation alignment** of frequency bins, independently for every control window.

| GP-native control | Windows | Minimum sorted total variation (+ sign) | Minimum sorted total variation (− sign) | Smallest maximum bin among either sign |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | **159** | **0.09402372** | **0.10068987** | **702** |
| Emerson | **240** | **0.09689171** | **0.10433300** | **717** |
| Gibran | **39** | **0.11983567** | **0.10417797** | **786** |

Every one of the **438** native reference windows, under either sign and **all 29! permutations**, predicts an intermediate GP-prime step bin with at least **702** occurrences. The largest original increment bin has only **510**. Every window also has at least **9.4%** optimally aligned total-variation distance to the actual original difference profile, a gap of more than **1,200** counts under the best frequency matching. A frozen positive control applies the hidden affine permutation `(7*U+3) mod29` and verifies that the sorted histogram remains **exactly identical** to the known native U. That exact identity is mathematical and applies to *every* bijection, including an arbitrary secret key table.

This is a **key-independent original-cipher obstruction** for a stationary substitution of a native-English GP prime/totient predecessor step. Changing the initial plaintext state cannot affect the distributional necessary condition. The finite control corpora do not establish that every possible unknown authored English text has these profiles, and a position-changing substitution table, secret pseudorandom stream, non-English intermediate or other feedback law is outside the result. The test rules out repairing the six failed direct inverses merely by inventing a global **unknown 29-letter output permutation**.

## Decision

The tests close the direct pagewise prime/totient plaintext-driven cipher increments with every possible starting rune, the complete shared-coefficient first-order affine differential family, **and all 29! fixed output permutations of the prime/totient predecessor-step alphabet within the measured native-GP controls**. The only surviving score improvement is the already recognized raw first difference. Do not use a guessed seed, a new fitted nonlinear correction, or a 76-rune p55 coincidence to rescue either hypothesis. A future attempt needs an independently observable mechanism selecting a different operation or actual hidden key material.

**Reproduce:** `node sims/lp2_delta_plainfeedback_source_gate_sft.cjs` on Windows 11 or other Node.js 22 installations; one file, original corpus, no third-party dependencies or file writes. It asserts the exact source counts, each six-family pooled value, original-layout native p57 encryption/decryption/re-encryption, all 813 affine-class scores, the complete 438-control-window sorted-profile gap, and a secret-permutation positive invariant.
