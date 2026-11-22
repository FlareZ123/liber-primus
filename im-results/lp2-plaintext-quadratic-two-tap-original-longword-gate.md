# Two-tap nonlinear **plaintext** feedback under all independent word keys

**22 November 2026, Agent 2. Bounded exact negative; no unknown LP2 plaintext recovered.** This test considers a mathematically different source-native cipher class from the previously exhausted *ciphertext*-feedback quadratic sweep. The only physical motivation is native GP29 prime-field arithmetic and authentic long intact printed rune words; the manuscript does **not** explicitly prescribe a two-plaintext-tap quadratic cipher.

## Cipher family and exact test

For every candidate plaintext long word `P` of length `n`, compare its **original unmodified** printed cipher word `C` against this lossless, forward-replayable recurrence after two unconstrained starting cipher symbols:

```text
C[i] = P[i] + a*P[i-1] + b*P[i-2] + c*Q(P[i-1],P[i-2]) + d (mod 29)
```

Test the three distinct quadratic kernels `Q(x,y)=xy`, `x²`, `y²`. Grant **four unknown GF29 coefficients a,b,c,d separately to each whole word**. Each model is algebraically reversible for fixed key and known previous plaintext, and every candidate can be checked without searching 29⁴ keys: consecutive original runes give **11** equations for a 13-rune word or **12** for a 14-rune word, linear in the four hidden parameters. Exact GF29 Gaussian elimination decides existence, including deficient-rank cases. Unconstrained independent per-word coefficients are a deliberately generous superset of chapter-global keys and all fixed-key models within the specified polynomial shape.

The parsed original source is the exact printed punctuation in `resources/liber-primus/lp2-transcription.txt` and GP rune indices in `lp2-corpus.json`, including every legitimate midline and cross-page continuation. The reproducer asserts **12,956 physical unknown ciphertext runes and 2,896 whole printed words**; the runeless p50 is skipped, and p56/p57 are excluded from the negative test.

The independent source-native control lexicon `sims/lp2_source_native_longword_lexicon.cjs` contains **175** GP29 14-rune word candidates, including actually attested solved p57 **CIRCUMFERENCES**, and **426** GP29 13-rune candidates. It derives from pinned Shakespeare, Emerson, Gibran, Blake, verified LP1/p56/p57 prose and TextBlob, never from unknown LP2 text.

## Original-input outcome

The **three original 14-rune printed words** occur on p13 global rune offset3405, p25 offset6035 and p43 offset10453. The **four 13-rune words** are on p11 offset2886, p16 offset3762, p52 offset12284 and p55 offset12903.

| Kernel | 4 original ×426 GP13 comparisons | 3 original ×175 GP14 comparisons | Compatible original words |
| --- | ---: | ---: | ---: |
| `x*y` | 1,704 | 525 | **0/7** |
| `x*x` | 1,704 | 525 | **0/7** |
| `y*y` | 1,704 | 525 | **0/7** |

The script performs **6,687** independent exact original-versus-source-word consistency tests, and accepts **none**. Every one of the seven whole words therefore excludes each corresponding quadratic plaintext-autokey family under the measured native GP long-word vocabulary, even with a distinct hidden key on every word. This does **not** rule out other languages/word lists, hidden word permutation or word-length changes, nonlinear key evolution, unknown symbol relabeling, or higher-degree/additional-tap models.

To verify the method has power against a real eligible cipher, it encrypts **30 distinct genuine native-source long words for each length/kernel**, with independently fixed per-word IV symbols and coefficients `(a,b,c,d)=(4,11,16,7)`, then recovers compatible coefficients by the same GF29 solver and **forward-replays all ciphertext runes from the third onward**. All **180** source-native planted test words pass. The initial two ciphertext symbols are explicitly unconstrained, so no positive is credited for their contents.

## Decision

The original cipher gives no evidence of this entire **three-kernel, four-parameter, two-plaintext-tap** family, even with independent secret keys and native-English long-word source freedom. This is a more appropriate negative than sampling key/password guesses; it cannot be rescued by different a,b,c,d seeds or initial phases. A genuinely distinct next step must come from an original clue selecting a *different operation*, a verifiable non-English plaintext register, or a demonstrable reordering of printed word boundaries.

**Reproduction:** [Node22 standalone all-secret original test](../sims/lp2_plaintext_quadratic_two_tap_source_native_allsecret_sft.cjs) · [Windows CI PASS 44993726842](https://github.com/FlareZ123/liber-primus/actions/runs/44993726842). The earlier [ciphertext-feedback quadratic family](quadratic-feedback.md) was independent and cannot be used as evidence for this plaintext-feedback conclusion.
