# LP2 predecessor-excluding base28 to byte triples: complete original-cipher gate

**Agent31, 16 November 2026. Result: a specific reversible, clue-motivated decoder is rejected on untouched original ciphertext.** No authentic unknown-page plaintext, original author key, file signature or continuation was recovered.

## Why a human might attempt this exact mechanism

The 29-symbol Gematria Primus alphabet and p57's first-party cleartext instruction “shed our own circumferences” invite, as one *hypothesis*, removing the previous symbol from a cyclic rune wheel before choosing the next output. The original ciphertext's unusually suppressed adjacent equalities give the idea an independent signal: only **86 of 12,901 within-page** rune transitions repeat, while two-back matches (**435 of 12,846**) are at the ordinary 1/29 level. The physical source also contains five-dot clusters; these supply a possible *five-symbol grouping*, although none of these clues explicitly authorizes this codec.

For a ciphertext predecessor `C[i-1]` and next rune `C[i]`, define a rank among the **28 GP runes other than the previous**:

```text
d[i] = (C[i] - C[i-1]) mod 29
rank28[i] = d[i] - 1   when d[i] ∈ {1, ..., 28}
rank28[i] = ESCAPE     when d[i] = 0.
```

Five rank28 digits have exactly `28^5 = 17,210,368` possible values. Three bytes have `256^3 = 2^24 = 16,777,216`, so the economical, reversible, unambiguous conventional fixed-radix byte interpretation is: group **five base28 digits into one unsigned 24-bit integer**, then emit its three bytes. This conversion requires every such original five-digit codeword to satisfy **value < 16,777,216**. Values above that bound cannot represent a 3-byte block. Under independent uniform ranks the forbidden fraction is `433,152 / 17,210,368 = 2.5168085%`. That gives a sharply discriminatory *invariant*, independent of any prospective English language score or key fit.

## Exact source experiment

Original input: untouched `resources/liber-primus/lp2-corpus.json`, 55 rune-bearing pp0–55, **12,956 runes**, with **86** predecessor-equality escapes. No guessed plaintext, substituted title, byte table, retrospective key or changed rune is used. Freeze five possible starting phases and both directions of interpreting each five-digit radix number, then test four natural synchronizations:

| Five-digit grouping | Best case of 10 (phase, digit order) | Fully valid groups | Impossible >24-bit groups | Skipped escape groups |
| --- | --- | ---: | ---: | ---: |
| One continuous book | phase 2, reverse | 2,457 | **47** | 86 |
| Nine original visibly marked chapters | phase 0, printed | 2,450 | **49** | 86 |
| 55 original rune-bearing physical pages | phase 0, reverse | 2,433 | **43** | 85 |
| Original book with 86 zero-difference escapes omitted before grouping | phase 4, printed | 2,519 | **54** | 0 |

Every one of the **40 original source-scoped candidates** contains at least 43 codewords that cannot represent a 3-byte integer. Their invalid counts are near the random-rank expectation. None contains a full exact byte stream under the specified codec. Even among individually legal groups, the emitted byte printability remains close to random (~36–38% across fixed cases), with no recovered readable prose.

**Code-validity positive:** The same test builds 24 known raw bytes, writes them as eight unsigned 24-bit values, encodes each as five base28 digits, emits a chain of 41 GP29 runes through the exact predecessor-excluding transform, then recovers **all 24 source bytes exactly** with zero invalid groups. The original run and this plant passed together on **Windows GitHub Actions Node 22**, [run 43906523734](https://github.com/FlareZ123/liber-primus/actions/runs/43906523734). [Exact executable CommonJS SFT](../sims/lp2_base28_no_repeat_five_digit_source_sft.cjs).

## Decision, bounds and next research choice

**Retire the narrow source-motivated 5×base28 → 3-byte *fixed-width direct packing* interpretation.** The book's adjacent-repeat suppression does not provide sufficient evidence for a radix-28 byte stream, and supplying a one-off byte-correction for every impossible group would defeat the test by silently adding another encryption or error-coding layer. More elaborate explicit escape coding, arithmetic-coding carry, variable-length serialization, different grouping, an independently acquired secret key or non-byte plaintext register remain outside this experiment. Those extensions require a genuinely new source-selected instruction or testable prediction rather than tuning around the 43–54 failures.

No original selected byte-packing instruction or recoverable plaintext exists in this result. Keep the finding in supporting research, rather than promoting an unverified cipher to `results/`.
