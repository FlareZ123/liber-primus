# Original LP2 two-plaintext-lag all-secret output-alphabet test

**Agent9, 14 November 2026. Evidence: bounded finite-English control negative, with exact original-input and full-length reversible positive control. No new plaintext/key/cipher/destination.**

## Mechanism and the intended-human objection

LP2's 55 rune-bearing unknown physical pages (pp0–55) contain **12,956 GP29 symbols**, and only **86 same-page adjacent-equal pairs**, motivating a stateful emission model. This test specifically considers a reversible **second-order plaintext-feedback differential cipher**:

`(C[i]−C[i−1]) mod29 = π((P[i]+a·P[i−1]+b·P[i−2]) mod29)`, for within-page i≥2.

The coefficients `a,b` may be **any elements of GF29** and the shared secret output alphabet `π` may be **any unknown permutation of 29 symbols**. Two independently invertible page-header runes define each page's initialization. Neither historical Cicada evidence nor an original LP2 clue has been found selecting this model, so the analysis challenges an explicit conjecture rather than establishing creator intent. It is distinct from previously audited two-**ciphertext**-tap, one-plaintext-feedback, and page/word-shape secret-substitution gates.

An unknown permutation `π` preserves the **sorted output-frequency histogram exactly**. For any given `a,b`, the sorted frequencies of plaintext expressions must equal the sorted frequencies of the observed ciphertext differences. This allows an **all-key test without searching any of the 29! alphabet permutations**.

## Source and full original-layout controls

The SFT parses unchanged `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt` to establish exactly **2,896 printed words** and **12,956 runes**, equal to the canonical page indices. It evaluates the **12,846 original transitions** at i≥2 over all 55 rune-bearing pages. The observed frequency bins range from **85** to **508**.

Independent English controls come from Shakespeare, Gibran and Emerson in `resources/control/`. Every control reconstructs all 2,896 original printed-word lengths, keeping physical page seams; it uses the repository's `encodeSourceNativeGP` for historically attested GP spellings **ING→ᛝ** and **IO→ᛡ**. Three independently sampled full-length native GP controls per corpus give **nine** source-shaped test texts. Deterministic xorshift32 seeds are `0x33015637`, `0x33015638`, `0x33015639`. For each control the test enumerates **all 29²=841** choices of `a,b`.

| Control source | Smallest rarest-bin counts over the 840 **nonzero-feedback** coefficient pairs (three complete controls) |
| --- | --- |
| Shakespeare | **152, 162, 157** |
| Gibran | **161, 176, 176** |
| Emerson | **162, 166, 174** |

All nontrivial matched-English models have a least-common-symbol count **at least 152**, whereas the original ciphertext transition histogram has a bin of **85**. No shared secret permutation `π` can repair this discrepancy. The trivial `a=b=0` candidate is also included in the entire 841-key distribution scan; it has a radically non-flat native-letter histogram and cannot match the ciphertext's full profile. The SFT reports each model's best total-variation distance as a second diagnostic rather than relying only on one bin.

**Scope:** this is a finite-language-register exclusion, rather than a mathematical proof for all possible English text. A different plaintext corpus, independently changing output alphabet, hidden state, nonlinearity inside the feedback expression, and an explicit exception channel remain outside this gate.

## Complete invertible plant

On a deliberately encrypted native GP text of all **12,956 original-shaped runes**, choose `a=10,b=20`, `π(z)=7z+5 mod29` and two independent page header rules `C0=11P0+2·page`, `C1=13P1+3·page`. The decoder uses inverse multipliers 8, 9, 25 for 11,13,7 respectively and recovers **all 12,956 / 12,956 original plant runes**, including the 110 page-header runes, then re-encrypts them **exactly**. The planted cipher's sorted difference histogram equals the planted plaintext feedback-expression histogram. This proves the SFT can invert the model when it is genuinely present and that the measured histogram is a valid permutation-invariant obstruction.

**Reproducer:** [`sims/lp2_two_plain_lag_feedback_allkey_sft.cjs`](../sims/lp2_two_plain_lag_feedback_allkey_sft.cjs), Windows-compatible Node 22 CommonJS. [Successful, read-only manual GitHub Actions run 43564455300](https://github.com/FlareZ123/liber-primus/actions/runs/43564455300) via [workflow](../.github/workflows/agent9-two-plain-feedback-manual.yml).

## Decision

**Retire this fixed-shared-alphabet two-plaintext-lag family on the tested native-English register.** The failure is not rescued by guessing secret substitution alphabets or optimizing the 841 coefficients: all have been granted. Continuing with per-rune evolving secret functions would require an independent player-visible clock or key and a prediction of actual unknown LP2 plaintext. No original unknown words have been decrypted.
