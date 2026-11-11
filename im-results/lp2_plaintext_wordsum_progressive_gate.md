# Plaintext-self-summed GP29 progressive word cipher: exact original exclusion

**Decision (11 November 2026):** All **12** narrowly defined, plaintext-word-self-keyed progressive GP29 shifts are **impossible on the unmodified 2,896 original printed words**. Their minimum conflict is 82 words, and 11 models have at least 152 longer or 433 two-rune conflicts, or hundreds of failures. This is an exact arithmetic obstruction under the specified plaintext/ciphertext relationship, not a statistical English rejection. No unknown LP2 plaintext or authentic key was recovered.

## Motivation and frozen original mechanism

The authenticated 2016 signed continuation says the book's “words are the map, their meaning is the road, and their numbers are the direction”; the earlier Cicada instructions also emphasize primes and Euler's totient. One concrete possible reversible interpretation is that every GP29 plaintext word determines its own progressive Caesar direction/step from a fixed word sum, without any unknown external key.

For a printed word of length *L*, GP29 plaintext ordinals `P[j]`, ciphertext `C[j]`, and a weighted index `j+δ` (zero-based `j`, `δ∈{0,1}`), freeze the family

```text
K = sum(f(P[j])) mod 29
C[j] = P[j] − sign × (j+delta) × K mod 29
```

with `sign∈{−1,+1}` and three prescribed `f` functions: GP rune ordinal, GP prime weight, or prime totient `phi(prime)=prime−1`. Every unprinted shift/key is removed by deriving `K` from the word plaintext itself. The source does **not** authenticate this proposed cipher: it is one clue-motivated, finite, fully explicit family.

For **each original ciphertext word independently**, enumerate all 29 candidates `K`, calculate `P[j] = C[j] + sign×(j+δ)×K mod29`, and retain only candidates whose recomputed plaintext word-sum equals `K`. A **zero-candidate word disproves that exact model**, irrespective of language, dictionary, unknown keys, or subjective scores. The original `resources/lp2-transcription.txt` and shared `sims/lp2_word_pages.cjs` parser supply 2,896 printed words over all 12,956 unsolved runes, continuing words across physical page wraps.

## Exhaustive key-free gate on the original cipher

| Plaintext sum `f` | δ | sign | 0 candidates | 0 candidates among length ≥2 | Exactly 1 candidate | Multiple candidates |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| GP ordinal | 0 | − | **152** | 152 | 2740 | 4 |
| GP ordinal | 0 | + | **433** | 433 | 2448 | 15 |
| GP ordinal | 1 | − | **211** | 211 | 2680 | 5 |
| GP ordinal | 1 | + | **82** | 0 | 2813 | 1 |
| GP prime | 0 | − | **999** | 999 | 1208 | 689 |
| GP prime | 0 | + | **964** | 964 | 1150 | 782 |
| GP prime | 1 | − | **1046** | 1022 | 1127 | 723 |
| GP prime | 1 | + | **972** | 942 | 1150 | 774 |
| GP prime totient | 0 | − | **917** | 917 | 1225 | 754 |
| GP prime totient | 0 | + | **968** | 968 | 1221 | 707 |
| GP prime totient | 1 | − | **1015** | 990 | 1103 | 778 |
| GP prime totient | 1 | + | **1020** | 1000 | 1121 | 755 |

The four ordinal variants have an additional exact algebraic shortcut. Let `S_C=sum C[j]` and `A=sum(j+δ)`. Then `K(1 − sign×A)=S_C mod29`. Whenever the coefficient vanishes, only original words having `S_C=0 mod29` could be generated. Such forbidden lengths explain the concentrated ordinal failures: δ=0/sign− fails at length 8; δ=0/sign+ fails at length 2; δ=1/sign− fails at length 7; δ=1/sign+ fails at length 1. In contrast, the prime/totient functions introduce nonlinearity in the unknown plaintext indices and have failures distributed across word lengths, including many of length ≥5.

The test also constructs native GP29 words directly from authenticated 2016 Cicada signed English, encrypts each using its **actual planted self-sum key**, and exhaustively recovers that exact key and word in all 12 model variants. Thus the obstruction on the original corpus is not a broken inverse.

## What this changes

This closes the specific hypothesis that the 2016 “numbers are the direction” wording directly specifies **the plaintext word's own GP ordinal/prime/totient sum as a progressive in-word shift key with these two clocks and signs**. It is stronger than a language score because model-generated ciphertext must pass this wordwise congruence exactly. It does not exclude ciphertext-derived sums, hidden preceding-word state, variable-rate encoding, non-GP intermediate alphabets, altered word segmentation, or a genuinely historical external key.

**Reproducer:** [`sims/lp2_plaintext_wordsum_progressive_sft.cjs`](../sims/lp2_plaintext_wordsum_progressive_sft.cjs), deterministic no-dependency CommonJS against unchanged repository resources, with assertions for all 12 original conflict counts and native English positive plants. No new workflow or broad scan is warranted.
