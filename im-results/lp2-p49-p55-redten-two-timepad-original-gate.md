# Corrected: p49 and p55 have different red punctuation; shared-pad test has no source selector

**Agent28, 15 November 2026. Explicit source-correction and retired exploratory candidate.** This report retracts its original premise that p49 and p55 share a red ten-dot terminal. The original p49 red marker is **10 dots** and the original p55 marker is **13 dots**, as independently established by the preexisting all-75-JPEG [source stencil census](lp1-lp2-red-stencil-cross-release.md) and source-image inspection. Both pages have matching decorative floral side borders, which are reused broadly across the book. These pages therefore offer **no independently source-authenticated same-marker key reuse cue**. There is no recovered unknown-page plaintext, key, decryptor or destination.

## Why this correction matters

Physical p49 (source JPEG `66.jpg`) contains 66 runes and a red **10-dot** stencil before the numbered table. The same 3-column × 7-row stencil occurs at physical pp36,38,49,56, where it marks transitions to separate blocks of prose/numeric material. Physical p55 (source JPEG `72.jpg`) contains 76 runes and the **ordinary 13-dot** stencil, a different 3-column × 9-row glyph repeated about 30 times on LP2. The p49 10-dot stencil was previously confirmed to remain transparent to the solved p56 prime-totient clock. A prior source study explicitly rejected the p49/p55 same-nine-state-mark reading; this invocation initially overlooked that documented result. Thus, the putative visual premise is invalid and the suggested p49↔p55 common-key operation must not be treated as a creator-motivated route.

## Retained bounded cryptographic computation

The exploratory script nevertheless implements an exact, testable claim: if two specific ciphertext passages use the **same additive GP29 pad at an aligned offset** and both plaintexts are ordinary source-native GP29 English, the unknown pad cancels from their difference. It measures the original ciphertext difference log-likelihood ratio against a GP-native English difference distribution learned from 100,000 Shakespeare training runes, with native Shakespeare/Gibran/Emerson positive controls. The candidate page pairing was **not source selected**, so its score is descriptive screening evidence only.

The actual complete 138-rune sentence preceding the table contains the final 72 original p48 runes plus all 66 original p49 runes. The four frozen comparisons below were all made without changing any of their original GP29 ciphertext symbols.

| Ad hoc original alignment | Paired rune count | GP-native English-pair LLR (nats) | GP equalities | Rank among p55's 76 cyclic shifts |
| --- | ---: | ---: | ---: | ---: |
| p49 all66 → p55 first66 | 66 | -1.93409 | 3 | 44/76 |
| p49 all66 → p55 last66 | 66 | -1.30430 | 1 | 33/76 |
| 138-rune pretable first76 → p55 all76 | 76 | -2.07144 | 2 | 47/76 |
| 138-rune pretable last76 → p55 all76 | 76 | -1.62551 | 1 | 35/76 |

All four ciphertext differences have negative GP-native English-pair LLRs, whereas held-out same-key encrypted native source controls have predominantly positive scores. The controls at or below the four original scores were, respectively, **[14,8,7]**, **[21,21,13]**, **[16,9,9]**, **[26,17,13]** out of 250 Shakespeare/Gibran/Emerson positive source pairs per alignment. In every planted control, applying the same additive key to each of two known plaintext streams preserves the computed ciphertext difference exactly. This validates only the hypothetical algebra and the original measurements, with no privileged p49/p55 clock, language-register guarantee or original plaintext.

**Decision:** Do not seed new shared-pad attacks from the false p49/p55 same-ten-dot claim. The real **10-dot p49 versus 13-dot p55** source difference defeats the causal route before cryptanalysis. The old apparent pair cannot be supported by these markings. This correction preserves the original measurement as an unselected negative control and actively withdraws the former source-led hypothesis. A future paired-page operation requires its own independent original author clue.

Code: [read-only original-source Node22 CommonJS SFT](../sims/lp2_p49_p55_sharedred10_twotime_sft.cjs). Verified successful Windows execution [Actions 43774640354](https://github.com/FlareZ123/liber-primus/actions/runs/43774640354). Original authoritative stencil comparison: [cross-release red markers](lp1-lp2-red-stencil-cross-release.md).