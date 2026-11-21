# P39 red quadratic as a reversible GP29 filter: original-ciphertext inverse

**21 November 2026, Agent10. Evidence class: bounded cryptanalytic rejection; no unknown plaintext, creator key or solution.**

## Hypothesis and human trigger

The original p39 red triple is `[27,5,15]`. As established in the source analysis, the triple can be interpreted as the polynomial `G(X)=27+5X+15X²`, with a repeated root in GF29. The source-visible quadratic suggests a compact *direct signal-filter operation* distinct from treating `G` as a pseudorandom generator or as a word-number navigation checksum.

A human solver might apply its three coefficients to successive runes, then reverse the process. The two natural coefficient orientations are `(a,b,d)=(27,5,15)` and `(15,5,27)`. Both constant terms are invertible modulo 29. This yields a complete local decryptor after only two secret starting runes:

```text
C[i] = (a*P[i] + b*P[i-1] + d*P[i-2]) mod 29
P[i] = inverse(a)*(C[i] - b*P[i-1] - d*P[i-2]) mod 29
```

This is a **candidate operation**, not an authenticated instruction to use the red polynomial as a cipher. It is motivated by the actual original quadratic, has only `29²=841` possible starts, and supports an exact forward replay that distinguishes a solution from a numerical label.

## Complete finite inverse and original results

The [standalone Windows CommonJS test](../sims/lp2_p39_red_polynomial_fir_inverse_sft.cjs) reads the canonical original GP29 runes from `resources/liber-primus/lp2-corpus.json`. On each named source interval it enumerates every one of the 841 starting pairs, both original/reversed reading directions and both red-coefficient orders. There are no fitted internal transforms or plaintext cribs.

To detect actual prose, a fixed smoothed GP29 trigram model is trained on native-orthography Shakespeare plus Emerson (**538,433** runes). The separate withheld Gibran source contains **62,492** encoded runes. It is not in the training model. A 250-rune excerpt beginning at withheld rune offset 5,000 is deliberately encrypted under coefficients `(27,5,15)`, seed `(3,21)`. Exhaustive key-blind inversion identifies **exactly that seed**, returns **all 250 authentic original plaintext runes**, and re-encrypts them byte-for-byte. Its held-out log-likelihood score is **−2.210972** nats per trigram transition.

| Untouched LP2 receiver | Original runes | Best of four source modes and 841 starts, nats/transition |
| --- | ---: | ---: |
| p0 black body after original 13 red runes | 249 | −4.380713 |
| p1 | 266 | −4.415221 |
| p29 | 277 | −4.371758 |
| p34 | 261 | −4.418248 |
| p35 | 271 | −4.366577 |
| p36 | 238 | −4.276461 |
| p37 | 228 | −4.345690 |
| p38 | 228 | −4.333455 |
| p39, containing the red polynomial | 240 | −4.353146 |
| p34–39, whole original cuneiform chapter, one continuous clock | 1,466 | −4.572684 |
| p55 terminal cipher | 76 | −4.126046 |

The eleven original winners are nonlinguistic. All 44 independently charged inverse families' best scores remain below the fixed −3.8 native-prose gate; complete printed GP29-language control scores much higher. Every original candidate passes its own exact forward replay because the operation is formally reversible, so replay alone cannot turn a non-prose output into a solution.

A **13-rune-only** p0 red-title window can produce an English-looking partial syllable with all 841 starts available. This undersized window is deliberately excluded from the evidence claim; it has no convincing continuation through the 249-rune body.

## Decision

The exact, simple quadratic FIR inverse **does not recover native GP29 English on the original p0, p1, p29, p34–p39, complete cuneiform chapter or p55 intervals**, despite recovering a fully independent planted Gibran passage and the correct secret starting state. Retire this finite direct interpretation for those receivers, preserving the original red polynomial as a possible navigation or other operator clue.

This does not exclude a different coefficient clock, a convolution over a transformed alphabet, ciphertext-driven feedback, nonlinear equations, nonlocal rune order, or plaintext outside the tested native-orthography register. Such added mechanisms need a new source clue before more parameter searches.

**Reproduction:** [`sims/lp2_p39_red_polynomial_fir_inverse_sft.cjs`](../sims/lp2_p39_red_polynomial_fir_inverse_sft.cjs), runs with local repository resources on Windows Node22. Exact original input, both coefficient interpretations, initial states, forward replay, reference-language training split and positive control are specified in the script. **Actual execution:** [Windows-portable Node22 SFT, GitHub Actions 44942169635](https://github.com/FlareZ123/liber-primus/actions/runs/44942169635), status **success** against the original repository inputs. The source-scoped p34–39 local and whole-chapter tests were additionally computed against the canonical original source data, and are included in the current standalone SFT. The expanded test also [passed actual Node22 CI 44943214574](https://github.com/FlareZ123/liber-primus/actions/runs/44943214574) on the unchanged source corpus, including the exact withheld-English plant and all eleven original receivers.
