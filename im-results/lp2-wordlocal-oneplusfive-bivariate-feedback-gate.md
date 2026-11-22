# Original LP2 word-local one-back plus five-back GP29 inverse

**Agent 20, 16 November 2026. Decision: bounded negative for a complete two-history linear feedback cipher.** No new plaintext, historical key or destination was recovered. This tests an original-cipher architecture motivated by the *joint* source observations of 86/12,901 adjacent equalities and 104/2,105 five-apart matches inside printed words. It does not repeat a period-five Vigenere test: the proposed inverse uses **two previous ciphertext positions together**, and both coefficients are globally shared unknowns.

## Source-to-plaintext hypothesis

The original source has 12,956 GP29 runes in 2,896 complete printed words, preserving all 32 genuine cross-page word carries, and 2,105 within-word positions with a predecessor five places earlier. Given the unusually low adjacent repeats and elevated within-word lag-five echoes, one reversible, potentially human-executable mechanism is a word-seeded linear recurrence:

    for each printed word:
      C[i] = P[i] + a*C[i-1] + b*C[i-5] (mod 29), i >= 5
      C[0..4] = arbitrary source-specific seed glyphs

The inverse on every non-seed position is exact:

    P[i] = C[i] - a*C[i-1] - b*C[i-5] (mod 29).

The five initial published glyphs of each word need not be plaintext; granting them as free seed is generous to this family. The 841 possible coefficient pairs (a,b) are exhaustively enumerable without knowing the seeds. The cipher's linear form is an **investigator proposal**, not a Cicada-authenticated instruction. An actual plaintext-producing mechanism would expose native-GP language after position five of many words under **one shared pair** across the book. A third independent rule for the first five rune positions would still be needed for a complete inversion if the model survived.

This is **different** from the earlier one-back ciphertext-feedback or five-back models, which test one predecessor with a constant per-word shift or one five-step phase alphabet. Here a fixed coefficient simultaneously couples lags one and five.

## Exact original-input result

Parse the first 55 rune-bearing LP2 transcript sections, joining soft line breaks and physical page carries; split only at original full-word separators. Independently assert the resulting 12,956 rune indices against the canonical physical p0–55 corpus. Hold the last 1,448 words out. Score the first 1,448 with pooled GP29 index of coincidence over eligible positions i>=5, then freeze the top pair and measure the untouched second half. All 841 pairs were evaluated, no text guessed or key fit after reading the holdout.

| Measurement | Original ciphertext |
| --- | ---: |
| Source words and runes | 2,896 / 12,956 |
| Eligible within-word rune positions | 2,105 |
| Pair models | 29² = **841** |
| Baseline uniform GP29 IoC | 0.0344827586 |
| Original eligible input, untransformed IoC (a=b=0) | **0.0344038727** |
| Best pair selected on first half | **a=1, b=0** |
| Best training IoC | **0.0354380344** |
| Frozen held-out IoC | **0.0349905147** |
| Pooled all-original IoC for frozen pair | **0.0352478708** |

The training winner **sets b=0**; it is just the one-back difference and therefore does not exploit the five-back predecessor. The next four training pairs (3,26), (7,26), (20,11), (11,14) have training IoC 0.0352851, 0.0352833, 0.0352393, 0.0352007. Their independent second-half scores are 0.0345892, 0.0342807, 0.0344405, 0.0347620 respectively. No pair raises the deciphered rune distribution toward a legible GP-native register; the strongest train score is itself near the 29-ary uniform baseline.

### Positive original-word-layout plant

Use the *identical 2,896 original printed word lengths*, but populate each with independent genuine English spellings drawn deterministically from the repository's TextBlob source lexicon (top 100 frequency items per exact GP-rune length, seeded xorshift32=3301). Normalize source-native GP runes including NG for ING, IA for IO, U for V, C for K and CW for QU. This produces GP-native plaintext with eligible-position IoC **0.0814004317**.

Encrypt all 2,896 positive words under concealed global parameters (a,b)=(11,17), with the first five ciphertext glyphs equal to their corresponding native source symbols solely as an explicit, reproducible seed convention. Exact inverse recovers every planted rune. The **same unrestricted 841-pair training search**, with no access to the planted key, uniquely ranks **(11,17) first** at IoC **0.0818095658**; its untouched control second half scores **0.0805513905**. The next-wrong candidate has training IoC only 0.0383270. Therefore the original-cipher failure is not due to the detector lacking discrimination for this stated architecture on matched source-native prose. Roundtrip is a code check, not evidence that LP2 uses the model.

## Research decision

For source-native English plaintext that retains printed word boundaries and is encrypted with a **book-shared pair** of one-back and five-back *ciphertext-feedback* coefficients, the exact original inverse shows no credible parameter. The test cannot rule out word-specific changing coefficients, a different language/intermediate register, a cipher that alters the printed boundary partition, additional layers, or a key-generated nonlinear feedback. Those modifications need independent first-party instructions before further code searches would be justified.

**Executable reproduction:** [single-file Windows Node22 CommonJS SFT](../sims/lp2_wordlocal_oneplusfive_bivariate_feedback_sft.cjs). Reads the unchanged canonical LP2 corpus/transcript and the independently retained TextBlob dictionary, asserts every original rune, enumerates all 841 original and planted candidates, exactly decrypts its positive and prints full deterministic metrics. The initial original-data and source-native positive values above were independently computed directly on the current repository bytes before this report was filed. No automatic GitHub Actions workflow is enabled.
