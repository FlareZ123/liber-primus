# Source-indexed five-fragment square: full original GP29 Hill receiver

**Agent 4, 22 November 2026. Original full-source negative.** This is a new bounded use of the already discovered 2016-signed-message-indexed five-fragment matrix as a *direct reversible cryptographic key*. It yields no authentic unknown LP2 plaintext, source-selected cipher operator or continuation. It does not re-establish the earlier instruction-like row sums or select a later cipher.

## Why this was worth one direct inverse

The independently preserved [five-fragment source route](lp2-five-source-indexed-fragments-row-sum-readout.md) selects the original p9/f10, p12/f13, p15/f16, p36/f37 and p40/f41 five-rune fragments and arranges them as five columns in physical-page order. Their *original* 5×5 GP29 matrix is

```text
C = 15 28 10  2  0
    13  1 13 22 23
    14  0  8  4  4
    27 15 27  1 28
     6 20 17 20  6
```

The existing source observation is `rowSum(C) mod43=[12,29,30,12,26]`, pointing to **THE DIRECTION SEEK THE NUMBERS** in the authenticated signed 2016 source. The independently authentic historical 2014 magic-square matrix `M` has its already documented entrywise `φ(S) mod29` construction. Both `C` and `MC` are invertible modulo29. Consequently the matrices provide **literal five-symbol lossless enciphers** which a technically literate historical player could test without guessing a password. The source does not state that either is an LP2 Hill key, and the 2016 index map itself remains inferred.

## Frozen actual-cipher experiment

Use the original GP29 rune stream on each whole independent input, split into consecutive five-rune column vectors with no fitted offsets, no inferred plaintext words and no language optimization. Evaluate exactly three source matrices, `C`, `MC`, and `C Mᵀ`, each directly, inversely, transposed and inverse-transposed. Under each candidate, compute `P_j=K C_j mod29`. All twelve operations are bijective, so exact forward re-encryption is a necessary check, not evidence of decoding.

The four original inputs are source-visible p0–p2 (first **725** of 729 runes), p3–p7 (all **1,145** runes), p40–p53 (first **3,005** of 3,008 runes) and the **75-rune p55 suffix after the genuine p54→p55 carried word**. The suffix length is exactly divisible by five, making p55 an independent *terminal* receiver without inventing a pad rune. The small original tails on the other two nonmultiples of five are excluded from cipher scoring only; they are never claimed as recovered or decoded.

| Tested unchanged section | Rune sample | Input GP29 IoC | Lowest of twelve candidate IoCs | Highest of twelve candidate IoCs |
| --- | ---: | ---: | ---: | ---: |
| pp0–2 | 725 | ≈0.03408 | ≈0.03398 | ≈0.03477 |
| pp3–7 | 1,145 | ≈0.03463 | ≈0.03412 | ≈0.03487 |
| pp40–53 | 3,005 | ≈0.03454 | ≈0.03436 | ≈0.03465 |
| p55 post-carry | 75 | ≈0.03856 | ≈0.03135 | ≈0.04468 |

All original outputs are nonlinguistic GP29 streams, with long-section IoCs near the uniform 29-symbol baseline; independently solved original p57 has IoC **0.0627099664**. The p55 outputs likewise have no full original paragraph or coherent terminal instruction. One selected short five-rune-looking English stretch in a p55 transformed output crosses *real printed word boundaries*, and cannot be treated as recovered plaintext. In particular, no individual short substring supplies the missing source-authored operator or verifies a second region.

Every one of the twelve inverse/forward pairs re-encrypts all original inputs exactly. As an independent true-plaintext positive, each pair also maps the **95 authentic clear LP2 p57 runes** to a synthetic source-format input and decodes them back **95/95**. This confirms correctness of the finite-field inverse but says nothing about the source's choice of key.

## Decision

The five-fragment correspondence, as currently specified, **does not function as a direct constant 5×5 Hill decoder for the three large unknown regions or the 75-rune terminal suffix**. This rules out the twelve tested operators under the actual block starts; evolving keys, independently defined routing, alternate plaintext alphabets, and clue-selected source boundaries are outside the test. The original row-sum instruction-like observations remain *intermediate* and must not be promoted to recovered ciphertext.

**Reproduce:** [Single complete Windows/Node22 CommonJS source test](../sims/lp2_fivefragment_source_hill_original_sft.cjs), deriving the original fragments and historical totient matrix directly from their source files, enforcing original data lengths and synthetic positives. [Successful GitHub Actions Windows run 45083886026](https://github.com/FlareZ123/liber-primus/actions/runs/45083886026).
