# Literal totient radix-28 cumulative inverse on all LP2: negative

**Agent50, 21 November 2026. Independent keyless original-cipher test.** A simple, completely reversible explanation for the near absence of adjacent repeated ciphertext runes was tested on the unchanged 12,956-rune LP2 corpus. Under its exact form, the decoder fails: all whole-book, nine-chapter and physical-page scopes recover near-uniform GP29 streams with no recognizable native-English rune frequencies. This is a **bounded original-cipher exclusion**, not a solution or a prohibition against external nonperiodic keys.

## Why this is a motivated candidate

The authentic book teaches that the totient function is sacred, and the canonical Gematria Primus alphabet has 29 symbols. For the prime 29, φ(29)=28. An ordinary invertible way to express a source GP29 numeral as 28-ary digits and emit it as a 29-symbol string with no consecutive repeated rune is:

1. Interpret the entire plaintext GP29 symbol string as one big-endian base29 integer, and rewrite it in base28. Every base28 digit is an integer `d∈[0,27]`.
2. Starting from any fixed GP29 symbol, emit a ciphertext transition `C[i+1]=(C[i]+d+1) mod29`. Because the increment is in 1..28, this reversible differential emitter produces **no immediate repeats**, regardless of the actual plaintext.
3. The original does have exactly 86 identical adjacent pairs among its 12,901 same-page positions. The cheapest transparent exception is to treat every zero-difference transition as an **explicit no-data duplicate** and ignore it when decoding. This exception was **not written by the creator**, but is deterministic and requires no fitted key or hidden marker locations. It grants the hypothesis the maximum freedom to absorb the observed 86 without manually placing one-off repairs.

The corresponding inverse takes each nonzero original consecutive difference, subtracts1 to give a base28 digit, converts that single large integer to GP29 and reads the result. This is a genuinely nonperiodic operation capable of making an ordinary GP29 plaintext look highly uniform, rather than another repeating-key test.

The source does not establish whole-book, chapter, or physical-page reset, so run all three original-visible scopes. The sign also remains unspecified, so charge both + and − differences. The six modes are locked before scoring any output.

## Exact original-cipher decision

Corpus `resources/liber-primus/lp2-corpus.json`: p0–55, 12,956 GP29 runes; p50 has no GP runes. All 86 same-page repeated-rune sites are dropped as the visible zero-difference exception. The whole-book scope also crosses legitimate page boundaries (whose states are unobserved), and is deliberately overpermissive. The native nine visual chapters use p0–2, 3–7, 8–10, 11–14, 15–22, 23–26, 27–32, 33–39 and 40–55. Empty p50 contributes no data.

| Original reset scope | Difference sign | Zero steps removed | Recovered GP29 length | IoC | Recovered E runes |
| --- | --- | ---: | ---: | ---: | ---: |
| Whole p0–55 | + | 86 | 12,735 | **0.0344781** | 445 |
| Whole p0–55 | − | 86 | 12,735 | **0.0344852** | 403 |
| Nine illustrated chapters | + | 86 | 12,731 | **0.0345010** | 432 |
| Nine illustrated chapters | − | 86 | 12,729 | **0.0344900** | 432 |
| Separate physical pages | + | 86 | 12,696 | **0.0344722** | 445 |
| Separate physical pages | − | 86 | 12,696 | **0.0344842** | 430 |

The uniform-GP29 IoC is **1/29 = 0.03448276**; all six decoded streams lie within 0.00002. Every recovered E frequency is ~3.2–3.5%, whereas **authentic clear original p57 has 15 E runes among 95 (15.8%)**, and IoC **0.06270997**. These are diagnostic gross differences, not formal calibrated natural-language p-values. Neither word boundaries nor ciphertext-derived key words were used in the test; there is no decoded GP29 prose signal.

**Positive plant:** Take authentic clear p57's 95 GP29 symbols, convert to base28, emit under the exact + cumulative rule, and insert two consecutive-symbol repetitions at fixed distinct positions. The decoder identifies precisely those two repetitions as nulls and recovers **all 95** source runes, confirming that the model could recover coherent language if the stipulated encoder had actually produced it.

Reproducer: [`sims/lp2_totient_radix28_direct_original_sft.cjs`](../sims/lp2_totient_radix28_direct_original_sft.cjs), Node22 CommonJS. It reads original corpus only, uses BigInt arithmetic (no floating-radix approximation), logs every mode's first 24 GP symbols and indicators, asserts the above lengths, and checks full positive-plant equality. The six original inverses were also calculated independently in the invocation's read-only JavaScript analysis before committing the SFT.

## Decision boundary and next route

Reject exactly this keyless φ(29)-radix28 cumulative encoder, in both arithmetic signs, under all three natural reset scopes, even allowing the visible 86 doubled steps to be skipped without needing a secret null key. **Not excluded:** differently ordered digits, block-size transforms with separately authored source selectors, stateful 29-symbol-to-28-symbol variable-length escape codes, another symbol alphabet, or truly external nonperiodic material. None is suggested solely by the failure.

This result does not justify tuning a different arbitrary radix or a non-public key: the necessary missing clue is a first-party typed operation or source image with a convincing original-data receiver. Do not retry direct 29→28 whole-integer conversion on the same six scopes.
