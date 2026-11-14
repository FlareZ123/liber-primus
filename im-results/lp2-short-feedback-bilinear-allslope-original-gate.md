# Original LP2 short-bilinear ciphertext feedback: all-secret GP29 inverse

**Agent 41, 14 November 2026. Status:** complete, source-original negative for one compact reversible cipher family. **No unknown LP2 plaintext, historical cipher key, author-selected algorithm or destination was recovered.** The new decision is the bilinear two-cipher-predecessor extension. Earlier exhaustive *linear* predecessor families were already tested in [affine feedback through three lags](affine-feedback-through-three-lags.md); their repeat screening here is a regression/control, not a new discovery.

## Original source cue and missing premise

Gematria Primus has 29 symbols. The authenticated 2013 BASE29 example and the original p39 red triad supply quadratic GF29 polynomials `H=3+26X+24X²` and `G=27+5X+15X²`; their degree-four product divides the original p50 numeric-grid polynomial, as shown in [the original source factor derivation](2013-base29-gf29-grid-factor.md). A simple human-readable candidate inverse is therefore a three-tap finite-field feedback filter on *actual preceding ciphertext runes*. Adding the single bilinear term `C[i-1]*C[i-2]` is the smallest genuinely nonlinear extension with the same two-rune memory.

This is an exploratory operation. **No Cicada source prescribes filtering the ciphertext through H or G, using predecessor products, or reading the output as direct GP-English.** Test the whole secret-coefficient family rather than fitting a new message key or claiming that a factorization alone identifies the cipher.

## Exact family and original-input result

For every unknown original page independently, discard the first two runes, where no two in-page predecessors exist, and hypothesize a direct plaintext rune:

```
P[i] = u*C[i] + a*C[i-1] + b*C[i-2]
       + d*C[i-1]*C[i-2] + e             (mod 29)
u != 0, a,b,d,e in GF(29)
```

An arbitrary fixed 29-symbol output relabeling is also allowed. Since multiplication by nonzero `u`, adding `e`, or permuting symbols cannot change the index of coincidence, divide through by `u` and search only the **29³=24,389** triples of normalised predecessor coefficients. This grants *every secret coefficient, constant, leading multiplier and fixed rune alphabet permutation* in the defined family. There is no guessed key phase.

Original input: all **55 rune-bearing physical LP2 pp0–55**, **12,956 runes**, **12,846 eligible three-rune windows**. All runes, original page boundaries and the canonical GP29 ordinal labels are held fixed.

| Exact inverse family | Original models | Highest whole-book GP IoC | Native benchmark |
| --- | ---: | ---: | ---: |
| Existing linear two-predecessor subfamily, rechecked | 841 | **0.0353262988383** | Independently solved p57 cleartext **0.0627099664054** |
| **New bilinear predecessor-product family** | **24,389** | **0.0353262988383** | Independently encoded native Shakespeare heldout **0.0605496691054** |

**The bilinear family adds no stronger candidate whatsoever.** In both cases the maximum occurs at normalized coefficients `(a,b,d)=(28,0,0)`, the familiar predecessor-difference cipher. **Zero of 24,389** original bilinear candidates reaches IoC **0.04**, let alone the independent native-GP English range. No unknown source symbols were decoded into readable text.

For the source-linked H, G and product polynomials applied *literally* as FIR filters in both coefficient directions, the six complete original readouts have IoCs between **0.03446 and 0.03452**. Neither source-polynomial direction exposes plain GP English. These finite readouts do not require selecting any coefficients from the unknown ciphertext. The same independent-corpus code also rechecks the previously reported all-coefficient linear two-tap failure in **each of nine physical red-headed sections**, where the highest sectionwise candidate is only **0.0379727847423**. Those linear checks are context for the bilinear extension.

## Positive original-layout blinded-key recovery

Use the previously source-calibrated native GP29 spelling converter, which independently matches the 181 known LP1 plaintext words and all 95 original clear p57 runes. Take a **fresh 12,956-rune Shakespeare source-native excerpt** beginning at GP offset 50,000, and split it into the **exact 55 original physical page lengths**. Encrypt each page with the genuinely secret bilinear coefficients `(a,b,d)=(7,11,3)`, carrying the previous *ciphertext* runes in the recurrence and copying the first two page symbols as explicit IVs.

Run the exact same **24,389-model blind IoC search** against this planted ciphertext, without informing the optimizer of its key. The true `(7,11,3)` is **the unique highest-IoC candidate**, scoring **0.0605275647008**. Direct inversion recovers **12,956/12,956** source-native GP symbols and re-encrypts every planted symbol. A fixed outer affine rune permutation preserves that IoC exactly.

The winning planted key is the **only one** of 24,389 models exceeding IoC 0.04. This checks a complete, reversibly encrypted, original-length English source under the same family. A planted cipher is an implementation control, not evidence for the original historical algorithm.

## Research decision

**Retire a direct, stationary GF29 polynomial-feedback inverse with two preceding ciphertext states and one bilinear cross-term, including all secret coefficients and fixed outer symbol labels, under the direct source-native GP-English register.** Its entire secret family remains random-like on all original unknown pages, while the exact same search identifies and inverts a true source-native planted cipher.

The result does **not** exclude nonlinear evolving state, multiple changing keys, output-dependent skips, longer or nonlocal memory, non-GP binary transport, transposition or a different plaintext language. Another local polynomial term would need an **independent original selector and plaintext prediction**, rather than merely extending the polynomial degree after the negative result. The source H/G factors remain original mathematical material but have no demonstrated causal decoding route.

**Reproduction:** [standalone Node.js 22 CommonJS original-input SFT](../sims/lp2_short_feedback_bilinear_allslope_sft.cjs). It verifies the two original exhaustive searches, all nine section-linear controls, literal H/G filters, independently clear p57 and the exact blind recovery of native-English plaintext. The script reads pinned project resources and writes no files. The [successful Windows Node.js 22 original-input workflow run 43532262892](https://github.com/FlareZ123/liber-primus/actions/runs/43532262892) confirms the original 24,389-model negative, source controls and exact 12,956-rune blind positive. A later assertion addition also makes its unique native-like planted winner mandatory.
