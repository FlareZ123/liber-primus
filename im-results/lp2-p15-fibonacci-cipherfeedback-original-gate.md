# p15 Fibonacci spiral: direct ciphertext-feedback autokey on original LP2 (bounded negative)

## Source clue and discriminating alternative

The original physical p15 red-centered sixteen-integer Fibonacci-prime spiral contains the adjacent highlighted values **3299** and **3298**. Reducing them modulo the 29-symbol Gematria Primus alphabet supplies an independently visible pair of initial states, **[22, 21]**. Fibonacci's two-term recurrence is an observable, human-teachable next action. The specific feedback architecture below is a **research hypothesis**, not an authenticated creator instruction. Its causal alternative to the separate Director [#2374](https://github.com/FlareZ123/liber-primus/issues/2374) is **ciphertext feedback** rather than plaintext feedback, so it has no dependence on an unknown plaintext while evolving its key.

Tested *exactly* the reversible GP29 law

```text
C[i] = (P[i] + sign*K[i]) mod 29,  sign in {+1, -1}
K[i+2] = (K[i] + K[i+1] + C[i]) mod 29
K[0] = 3299 mod29 = 22
K[1] = 3298 mod29 = 21
```

The sole source clock is **one continuous physical LP2 p16–p55 rune stream** (9,194 original runes), retaining original intra-page order and cross-page continuity, skipping the runeless p50 table, with no word or page resets, unprinted symbols, new source alphabet, fitted coefficients, or key phase shifts. The two printed center values specify the first IV; as an adversarial **all-IV** diagnostic the experiment exhausts all **29² = 841** starting pairs for *each* sign.

The prespecified training interval is original **p16–p21, 1,613 runes**; the independently withheld original holdout is **p40–p53, 3,008 runes**. The decision criterion is the ordinary/native GP29 plaintext distribution, with an independent exact encoder and original-source forward replay for every IV.

## Actual Windows/Node22 original-source outcome

| Orientation | Source-selected [22,21] training IoC | Source-selected holdout IoC | Highest training IoC among all 841 IVs | Highest holdout IoC among all 841 IVs |
|---|---:|---:|---:|---:|
| `sign=+1` | 0.03437409 | 0.03456629 | 0.03519173 (IV 0,24) | 0.03485639 (IV 9,11) |
| `sign=-1` | 0.03443486 | 0.03449266 | 0.03531557 (IV 27,27) | 0.03487364 (IV 20,13) |

Independent complete native GP29 encoding controls use fixed contiguous **9,194-rune** text windows from the repository's Shakespeare, Gibran and Emerson witnesses. Their training IoCs are respectively **0.06355465, 0.05932567, 0.06191244**; holdout IoCs **0.06041533, 0.06233107, 0.06135219**. They therefore lie far beyond the entire exhausted original candidate range. Exact full-length forward/reverse planted recoveries pass for all three controls, both signs. The **95** original known-clear p57 runes also recover **95/95** under three independently planted IVs per orientation. Every original-p16–55 candidate correctly re-encrypts the complete 9,194-rune original stream; this is an implementation invariant of the bijective rule and does not authenticate a key.

An additional *structural* conclusion applies to this entire particular recurrence: for two IV pairs `(K0,K1)` and `(K0',K1')`, the difference in evolving key follows the homogeneous Fibonacci law because the ciphertext feedback cancels. Modulo 29 it has exact period dividing **14** (`F14 = 377 = 13×29`, `F15 = 610 ≡ 1 mod29`, and `F16 = 987 ≡ 1 mod29`; the Fibonacci state at offsets14/15 equals that at0/1). Thus every wrong-IV output differs from any other by a **14-periodic rune-wise offset**; all 9,194 original offsets were checked. More IV search within this fixed law cannot escape that two-degree-of-freedom periodic relation.

## Decision and limits

**This direct ciphertext-feedback Fibonacci-autokey transfer fails to recover any authentic unknown-page plaintext or historical key and should be retired as an immediate LP2 p16–55 decoder.** Neither 841-key range provides ordinary native-GP plaintext on training or independent holdout. The experiment does **not** rule out a different Fibonacci-like cipher-state update, plaintext feedback ([#2374](https://github.com/FlareZ123/liber-primus/issues/2374)), independently keyed page resets, transformed source input, an externally supplied key, an atypical plaintext, or operation instructions still unrecovered. The original p15 spiral's numerical construction remains real without licensing this proposed cipher operation.

**Exact reproducer:** [`sims/lp2_p15_fibonacci_cipherfeedback_original_sft.cjs`](../sims/lp2_p15_fibonacci_cipherfeedback_original_sft.cjs). **Actual Microsoft Windows Node22 PASS:** [GitHub Actions run 45122082689](https://github.com/FlareZ123/liber-primus/actions/runs/45122082689). Original GP29 source: [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json), native controls: `resources/control/{shakespeare_first300k,gibran_prophet_58585,emerson_essays_2944}.txt`.
