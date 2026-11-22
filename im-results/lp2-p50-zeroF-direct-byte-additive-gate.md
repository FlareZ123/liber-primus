# Fixed zero→F surface inverse + direct p50 byte-mod29 additive gate

**Agent18, 18 November 2026. Classification: bounded source-derived layered negative under Director issue #1422. No unknown plaintext or key was recovered.**

## Frozen composite

The model was [predeclared before evaluation](https://github.com/FlareZ123/liber-primus/issues/1422#issuecomment-6989893911).

First apply the already frozen p50 zero→F moving-exception inverse once to the untouched p0–55 ciphertext. Then use the same row-major p50 table on the same continuous phase-zero 256-cell clock as the direct GP29 value key:

`K[i] = byte[i mod256] mod29`.

Exactly two inverses are tested:

`P=M-K mod29` and `P=M+K mod29`.

The historical motivation is deliberately narrow. The table is independently implicated in the outer repeat anomaly, and Cicada material authenticates BASE29 as an operation. The full byte remainder is the smallest value-changing consumer of the same table cell after the outer state rule uses its visible leading-zero class and low three bits. The older direct Vigenere gate tested this key on the **original** ciphertext; this test uses the prospectively fixed 549-position intermediate.

No phase fitting, reversal, row or column permutation, reset, alternate radix, fitted offset or extra layer is allowed.

## Original result

Both outputs remain at the uniform GP29 regime:

| Inner inverse | Full-stream IoC | Exact native dictionary words | GP length ≥5 dictionary words | Longest dictionary run |
| --- | ---: | ---: | ---: | ---: |
| `M-K` | **0.03446046465** | 182 | **0** | 4 runes |
| `M+K` | **0.03444633256** | 198 | **0** | 7 runes |

The few dictionary hits are entirely length1–4. Neither sign has a single registered native-English word at GP length 5–14. Both opening streams are visibly nonprose and the full-stream IoCs remain essentially 1/29.

## Positive

For each sign, a complete 12,956-rune source-shaped GP stream is encrypted by the inverse byte-mod29 operation, wrapped by the fixed zero→F surface encoder, then recovered through both layers exactly. This verifies the clock, signs, modulo arithmetic and outer state reconstruction.

## Decision

Retire this exact composite. The fixed zero→F surface normalization cannot be completed into plaintext by the simplest phase-zero row-major p50 byte remainder Vigenere layer. The failure does not justify fitting another phase or table permutation.

Together with the all-secret word-Caesar exclusion and the exact authenticated-p56 prime/F exclusion, this leaves a clear #1422 gap: the outer rule has a prospective structural effect, while every tested low-description value layer beneath it remains nonlinguistic or algebraically impossible.

The complete reproducer is [`sims/lp2_p50_zeroF_direct_byte_additive_sft.cjs`](../sims/lp2_p50_zeroF_direct_byte_additive_sft.cjs). [Windows Node22 run 44386183948](https://github.com/FlareZ123/liber-primus/actions/runs/44386183948) passed; the job log identifies this SFT explicitly and reproduces both signs plus the exact layered positive.
