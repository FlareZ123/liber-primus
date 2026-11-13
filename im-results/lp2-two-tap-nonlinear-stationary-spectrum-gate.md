# Original LP2 two-tap nonlinear ciphertext-feedback: all-secret rank obstruction

**Result (13 November 2026, Agent 49): bounded negative on original unknown ciphertext, with a complete nonlinear planted control.** This is a stricter original-register decision than the earlier affine two-tap study and a distinct extension of the stationary one-tap arbitrary-alphabet study. No unknown Liber Primus plaintext, authentic key, authorized cipher, or destination was recovered.

## Human-visible premise, explicit limit

Physical LP2 p15 displays a 4×4 Fibonacci-indexed-prime construction. A solver could reasonably hypothesize a two-term recurrence, with Fibonacci coefficients `a=b=1` as the narrowest example. Model a possible reversible 29-rune ciphertext-feedback encoder as

```
C[i] = a*C[i-1] + b*C[i-2] + h(P[i]) (mod 29).
```

Here `a` and `b` are unknown elements of the prime field GF(29), and **`h` is any bijection of all 29 original GP rune labels**, including completely nonlinear secret alphabets. The original manuscript supplies no evidence that its Fibonacci square actually specifies this cipher, identifies `h`, or chooses an initialization. We grant the first two runes of **each physical page** as arbitrary IV symbols, so no initial-state constraint is imposed.

For fixed coefficients, the observable residual `R[i]=(C[i]-a*C[i-1]-b*C[i-2]) mod29` must be exactly `h(P[i])`. Therefore **the sorted 29-bin relative-frequency spectrum of `R` is invariant under all 29! secret choices of `h`**. For any reference plaintext GP-rune frequency vector, sorting both vectors and pairing corresponding ranks gives the **minimum possible total-variation distance over every such secret alphabet**; it does not rely on guessing `h`, solving for keys, searching English cribs, or selecting output examples. This is a necessary-condition test for source-native GP English, not a proof about every possible plaintext register.

## Original-source experiment

The [original GP29 corpus](../resources/liber-primus/lp2-corpus.json) supplies all unknown physical pp0–55, comprising **12,956 GP runes on 55 nonempty rune-bearing pages**. Removing the first two symbols of each page leaves **12,846 original residuals**. The [printed transcript](../resources/liber-primus/lp2-transcription.txt) supplies **2,896 joined complete words**. Fixed [Shakespeare](../resources/control/shakespeare_first300k.txt), [Gibran](../resources/control/gibran_prophet_58585.txt) and [Emerson](../resources/control/emerson_essays_2944.txt) controls yield **149,072** independently sampled reference English words, encoded with the established source-native 29-rune orthography including single-rune ING and IO. Weight their reference unigram frequencies by every original printed rune-word length. This pins the comparison distribution without plaintext fitting.

Exhaust **all 841 coefficient pairs** `a,b=0..28` globally, and minimize across the entire unlimited secret `h` family analytically. The original-input readouts are:

| Feedback coefficients (a,b) | Minimum TV under any hidden stationary GP29 alphabet |
| --- | ---: |
| **Best of all 841: (1,0)**, the already-tested one-tap difference | **0.327740420080** |
| Next-best genuine two-tap: (19,25) | 0.334980027740 |
| Direct Fibonacci (1,1) | 0.341752563938 |
| No feedback (0,0), monoalphabetic substitution | 0.345956207096 |

All original candidate residuals are substantially flatter than the native-English register. In particular, **allowing a nonzero second tap fails to improve on the one-tap solution**, even with unlimited nonlinear stationary secret alphabets.

**More permissive independent chapter rekeying.** The nine original red-heading sections have runic sizes 729/1145/1729/1903/1021/1433/1680/3008/308. Grant each section its **own independent coefficients `a,b` and arbitrary `h`**, retaining free two-rune IVs at every physical page. Exhaust 841 choices separately in every section:

| Visual chapter (runes) | Best (a,b) | Absolute minimum TV |
| --- | --- | ---: |
| 0 (729) | (18,2) | 0.2442528951 |
| 1 (1,145) | (5,25) | 0.2707355879 |
| 2 (1,729) | (26,3) | 0.2919668814 |
| 3 (1,903) | (14,26) | 0.2885306936 |
| 4 (1,021) | (22,18) | 0.2622263857 |
| 5 (1,433) | (2,13) | 0.2743845528 |
| 6 (1,680) | (19,11) | 0.2812904642 |
| 7 (3,008) | (6,4) | 0.3047309788 |
| 8 (308) | (13,21) | 0.1947847058 |

Even rekeying the entire 29-symbol permutation separately at every visual section cannot restore a native GP-English frequency spectrum in this stationary model. The smallest terminal-section result is descriptive for a short 304-symbol residual, and should not be interpreted as a calibrated p-value.

## Independent invertibility and power control

The same complete single-file implementation constructs a **fresh 12,956-rune GP-native English plant** using fixed-seed word-length-matched sampling from the same control corpus. Encrypt its 55 physical pages with an **actual nonlinear bijection `h(p)=p^5+7 mod29`** and two genuinely nonzero feedback taps **`a=17,b=9`**, with explicit per-page IVs 7 and 11. Its exact inverse recovers **12,846/12,846** encrypted planted plaintext runes, and its alphabet-agnostic residual spectrum has TV **0.013263133576** against the pinned English reference. The positive case therefore passes the identical histogram and algorithm used to reject the original unknown book.

**[Standalone CommonJS SFT](../sims/lp2_two_tap_nonlinear_allsecret_rank_sft.cjs)** runs without external packages or writes, using the intact source files. It asserts the original-runic, printed-word, chapter and coefficient counts, all reported TV readouts, and the full invertible nonlinear plant. The original-input test passed on **Windows Node.js 22** in the manual-only [GitHub Actions run 43468464674](https://github.com/FlareZ123/liber-primus/actions/runs/43468464674); [workflow](../.github/workflows/lp2-two-tap-nonlinear-allsecret-manual.yml).

## Research decision

The exact direct family `C[i]=a*C[i-1]+b*C[i-2]+h(P[i]) mod29` with **stationary secret GP29 bijection** is disfavored as native-GP ordinary-English ciphertext, even when all field coefficients are exhaustively granted and all alphabets may differ by red-heading section. The literal Fibonacci two-tap rule is specifically unsupported. This statement is **conditional on the GP-native English control distribution and fixed source rune/word register**; it does not exclude word-dependent or dynamic `h`, arbitrary per-position pads, a hidden non-GP register, plaintext-dependent evolution, per-word restarting, block mixing, transpositions or a different operation. The manuscript does not authenticate this model in the first place.

The exact negative decision prevents repeated coefficient optimization, stationarity-preserving alphabet hunting, or tweaking the Fibonacci pair to chase original English scores. A productive alternative needs an independently visible source selecting a real key schedule, reversible operation and an untouched original ciphertext prediction. This report does not alter the established positive original-source rune mapping or any solved-page plaintext.
