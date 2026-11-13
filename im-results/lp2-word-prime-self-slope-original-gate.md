# GP-prime self-keyed word-slope cipher: an original-cipher impossibility

**Decision (13 November 2026):** The original first 27 complete words on physical LP2 p0 refute a specific word-by-word self-key cipher under **all 47,096 global secret affine prime-sum directions and phases**. This supplies a reproducible rejection of one genuinely plaintext-dependent cipher family. **No unknown LP2 plaintext, historical secret, algorithm, or endpoint was recovered.**

## Source premise and proposed inverse

The authenticated 2016 message says that Liber Primus's words are the map and their numbers are the direction. Independently, the original 2013 `AUDIO/761.MP3` title demonstrates GP-prime word-number arithmetic by giving `THE INSTAR EMERGENCE` the sum 761. A literal possible consumer is a word-local running alphabet shift whose slope is selected by the **candidate plaintext word's** GP-prime sum, rather than by its visible ciphertext. This possibility was specifically tested because its self-consistency can falsify it without a linguistic model or a guessed plaintext.

For each printed whole word `w`, GP29 indices `p_i,c_i`, the 29 canonical GP primes `q[p_i]`, and an integer key `k_w`:

```
S_w = sum_i q[p_i] mod 29
k_w = a*S_w + b mod 29
c_i = p_i + direction*(i+phase)*k_w mod 29
a in 1..28, b in 0..28, phase in 0..28, direction in {-1,+1}
```

The nonzero `a` represents every reversible secret affine reading of a GP-prime word sum. The source words keep their original printed boundaries, including 32 words carried across pages. The phase may be any global constant; each word's position counter resets at its start. Both directions are included.

A proposed ciphertext word has a plaintext preimage **only if** at least one of the 29 possible slope keys `k` satisfies

```
p_i(k) = c_i - direction*(i+phase)*k mod 29
k = a*sum_i(q[p_i(k)]) + b mod 29.
```

All factors are integers in GF29, so checking 29 values of `k` is exhaustive. This test never requires a GP-English dictionary, frequency fitting, or punctuation interpretation beyond the printed word separators.

## Original-cipher decision

The source-derived 55 nonempty unknown-page records contain 12,956 runes in exactly 2,896 complete printed words. Physical p0 alone has 262 runes. Exhausting 2 directions × 29 phases × 28 nonzero affine multipliers × 29 offsets, **not one model yields internally consistent keys for even the first 27 printed p0 words**. The most persistent models survive exactly 26 consecutive complete words and fail on word 27. This excludes every version of the stated model even if the secret affine parameters could restart at each page or visual chapter: p0 has a contradiction before any page boundary.

As a separate directly specified control, `a=1,b=0` gives these numbers of whole-book original words with **zero** self-consistent slope keys:

| Encoding direction | Word phase | Impossible words out of 2,896 |
|---|---:|---:|
| + | 0 | 999 |
| + | 1 | 1,046 |
| − | 0 | 964 |
| − | 1 | 972 |

**Positive control:** Encrypting the actual solved 95-rune GP29 p57 `PARABLE` word sequence with `a=13,b=7,phase=17,direction=+` gives a valid inverse on every original solved word. Each word's planted plaintext occurs among the 29 candidate inverses, and all 95 rune identities round-trip exactly. Nonuniqueness among possible keys for some words is allowed; the first-27-word impossibility on original p0 is decisive regardless.

Reproduce from the canonical original ciphertext mapping and rune primes:

- [Complete Node.js 22 SFT](../sims/lp2_word_prime_self_slope_sft.cjs)
- [Canonical GP29, prime weights, and page lengths](../resources/liber-primus/lp2-corpus.json)
- [Printed complete-word boundaries](../resources/liber-primus/lp2-transcription.txt)

## Scope and next decision

The author has not authenticated this slope equation, and the signed 2016 wording does not uniquely prescribe the shift or prime-sum reduction. The bounded rejection is mathematically exact **conditional on this proposed equation**. It leaves open keys derived from previous words, changing `a,b,phase` on every word, per-rune nonlinear state, a different input alphabet or register, and independent word-boundary transformation. The preceding project [ciphertext-derived self-key experiment](../sims/word_selfkey_scan.cjs) and [fixed checksum word models](lp2-word-checksum-affine-original-gate.md) cover different equations.

A successor would require an original instruction that chooses a different full inverse, with independently sourced state and a correct held-out original ciphertext prediction. More arbitrary coefficients of this eliminated affine slope are not warranted.
