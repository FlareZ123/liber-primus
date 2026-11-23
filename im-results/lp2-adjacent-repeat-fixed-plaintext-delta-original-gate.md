# Fixed GP29 plaintext-neighbor difference: original-input negative gate

**Prior-work reconciliation, Agent40, 23 November 2026:** This is a **bounded extension** of the already implemented predecessor-plaintext marker hypothesis in [Agent26's all-secret f(Pprev) gate](lp2-plaintext-history-echo-marker-allsecret-original-gate.md) and [Director #2273](https://github.com/FlareZ123/liber-primus/issues/2273). That earlier report tested six source-motivated f functions (including identity and +1) against far more exhaustive native windows. Our narrower contribution exhausts all **29 translations** `f(Pprev)=Pprev+D (mod 29)` across 384 exact-word-layout native books and includes a reversible positive. This **does not identify a new author-selected cipher** and cannot justify another translation-parameter sweep without a new original clue.


**Decision, 23 November 2026 (Agent 40).** A reversible first-difference-feedback cipher with one fixed, distinguished plaintext rune difference cannot explain the unusually few adjacent equal runes in all 55 unknown rune-bearing LP2 pages under a native-English GP29 register. The exact original ciphertext has **86 equal adjacent rune pairs in 12,901 within-page positions**. Among all 29 fixed GP29 plaintext-difference classes in each of **384** source-layout-matched native books, the least frequent class still occurs **169** times. This is an original-data, conditional cipher-architecture exclusion. No authentic plaintext or key follows.

## Clue, mechanism, and all-key consequence

LP2 cipher glyphs repeat immediately 86 times, versus 439.17 expected from independent within-page rune shuffles, while lags 2–5 resemble uniform shuffles. One natural clue-motivated response is to operate on GP29 *neighbor differences*. Let P be the unknown plaintext rune index and C the original ciphertext index, each modulo 29. Suppose the author chose one global difference D and at each position uses a secret, potentially time-varying bijection from 29 plaintext differences to 29 ciphertext increments, with precisely the plaintext step `P_i-P_(i-1)=D` mapped to the zero ciphertext increment. All other plaintext steps map bijectively to nonzero cipher increments, in arbitrarily private order. The inverse is available given the key and starting plaintext rune.

No secret key choice affects its **exact invariant**:

```
C[i] === C[i-1]  <=>  ((P[i]-P[i-1]) mod 29) === D.
```

Thus **one** delta D must occur **exactly 86 times** in the unknown plain, on those 86 specific positions. Page seams reset, but ordinary word gaps do not. This model is distinct from the previously excluded *fixed plaintext rune* sentinel; here the trigger depends on consecutive plaintext symbols. An independently source-selected changing-state D_i or plaintext resegmentation escapes this test.

## Source, original controls, and output

The [single-file original-input CJS](../sims/lp2_adjacent_repeat_fixed_plain_delta_original_sft.cjs) checks all **12,956 original unknown rune indices** against the printed rune transcription and asserts 12,901 within-page differences. It uses the documented GP29 rune spellings with longest-match transliteration and explicit `V→U, K/Q→C, Z→S` normalization on three source-preserved English donors. Their **best over all 29 possible D** is:

| Native donor | Eligible GP29 pairs | Best D | Minimum repeats |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | 48,033 | 7 | 666 (1.3865%) |
| Emerson, *Essays* | 309,938 | 7 | 4,988 (1.6094%) |
| Shakespeare, first 300k source text | 218,799 | 18 | 3,706 (1.6938%) |
| **Original LP2 cipher target** | **12,901** | Unknown | **86 (0.6666%)** |

To preserve the complete source layout, the executable SFT also constructs **384** deterministic native-GP pseudo-books by choosing donor words with **exactly the 2,928 original page-local printed word-fragment lengths**. Every book has 12,956 runes and all 55 original source page boundaries, with 12,901 eligible comparisons. Each seed is scored over all 29 D values. The best of the entire **384×29** family is **169** matches for **D=18** at seed249. The ten best controls have **169–181** events, all D18. These are original-word-shape English controls rather than independently composed fluent prose.

**Fully reversible positive plant:** for one 12,956-rune native book the SFT encodes a changing-state wheel via

```text
C_i = C_(i-1) + a(i,page) * (P_i - P_(i-1) - D) mod 29
a(i,page) = 1 + ((11*i+5*page) mod 28)
```

and decrypts with the modular inverse of each nonzero `a`. Full-page plaintext recovery is exact at **all 12,956 rune positions**; every repeated cipher rune corresponds to one source delta D18, totaling **169**, as predicted. Nonzero rotations vary across positions; the repeat-trigger invariant does not. The standalone Windows Node22 run [45120950745](https://github.com/FlareZ123/liber-primus/actions/runs/45120950745) passed.

## Cryptanalytic decision

**The fixed-delta event-trigger mechanism is strongly disfavored for ordinary GP29 English with the manuscript's actual word positions**, even when the other 28 cipher increments have unrestricted time-varying secret assignments. The result is not an information-theoretic impossibility for unusual language, a source-generated intermediate code, arbitrary resegmentation, or a source-selected *changing* delta. Finite native donors are neither an unrestricted corpus nor a p-value for the author's unknown text.

Alongside the [fixed plaintext-rune trigger test](lp2-adjacent-repeat-fixed-plaintext-symbol-original-gate.md), this localizes the next original-input search to an independently indicated changing-state exception or authentic source-recovered key, instead of further static escape-symbol remappings. The zero-increment deficit is strong evidence of an immediate-neighbor cipher feature; it has **not** yet become a source-selected decrypting operation, plaintext, or destination.
