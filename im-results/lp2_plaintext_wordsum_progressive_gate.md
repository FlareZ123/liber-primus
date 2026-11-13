# Plaintext-self-summed GP29 progressive word cipher: exact original and all-secret affine exclusions

**Decision (13 November 2026):** All **12** source-shaped, fixed plaintext-word-self-keyed progressive GP29 shifts have mathematically impossible original words. A stronger, independent exact extension excludes **every one of 47,096 secret affine GP-prime word-slope configurations** within the first 27 original printed words of physical p0, even when the global starting phase is unknown. This is a complete word-preimage obstruction under the specified cipher equations and does not depend on English frequency scoring. No unknown LP2 plaintext or authentic cipher key has been recovered.

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

## Secret-affine GP-prime slope extension (13 November)

The original 2013 \`761.MP3\` ID3 title confirms that GP-prime word-number sums were author-visible arithmetic. This motivates a strictly broader consumer of the 2016 “numbers are the direction” wording. The cipher hypothesizes that the *unknown plaintext word* determines its own slope, allowing every globally secret invertible affine reduction of the sum:

\`\`\`text
S_word = sum_j(GPprime[P[j]]) mod 29
K_word = a * S_word + b mod 29
C[j] = P[j] + direction * (j + phase) * K_word mod 29

a = 1..28; b = 0..28; phase = 0..28; direction = -1 or +1
\`\`\`

The word-local position starts at zero; \`phase\` is an unconstrained global offset. There are **2×29×28×29 = 47,096** complete parameter combinations. For each possible \`K\` among the 29 residues, invert the progressive shift and recompute the GP-prime sum. The candidate is valid only when its own plaintext sum satisfies the displayed affine equation. The **existence of at least one key per printed word** is necessary, regardless of its language.

Enumerating all secret \`a,b,phase,direction\` combinations against the original **first 27 complete words of physical p0** leaves **zero** complete models. The most persistent candidates satisfy exactly 26 consecutive words before failing on word 27. Since these words fit inside the 262-rune p0, this obstruction also holds if the proposed parameters independently reset at every original page or chapter, provided they remain fixed within p0.

For the directly specified reduction \`a=1,b=0\`, zero-key counts among all 2,896 original complete printed words are **999, 1,046, 964 and 972** for (direction, phase) = (+,0), (+,1), (−,0), (−,1), respectively. These values agree with the four older fixed GP-prime rows in the table above. The exact strong conclusion comes from exhaustive secret affine parameters, rather than another isolated key guess.

An actual **95-rune solved p57 PARABLE** ciphertext plant was generated using hidden parameters \`a=13,b=7,phase=17,direction=+\`. The enumerated inverse contains the **exact original GP29 plaintext word** for every authentic p57 word and round-trips all 95 runes. The original rejection and solved control passed [manual GitHub Actions run 43393930390](https://github.com/FlareZ123/liber-primus/actions/runs/43393930390), including a dedicated original-input SFT:

- [All-secret affine word-slope reproducer](../sims/lp2_word_prime_self_slope_sft.cjs)
- [Original 12 fixed self-sum models](../sims/lp2_plaintext_wordsum_progressive_sft.cjs)

This test expands the earlier fixed-sum results using authentic, immutable original text. **No source instruction uniquely selects a word-local affine slope.** The rejection applies to that entire exact family, leaving untested prior-word state, secret parameters changing after every word, non-affine/non-GP intermediate encodings, or altered word breaks.

## What this changes

This closes the direct/plaintext-word GP ordinal, prime, or totient self-sum progressive shift under the original 12 fixed clocks and signs, and exhausts **every nonzero secret affine GP-prime sum, phase and sign** in the broader extension. It is stronger than a language score because model-generated ciphertext must pass this wordwise congruence exactly. It does not exclude ciphertext-derived sums, hidden preceding-word state, variable-rate encoding, non-GP intermediate alphabets, altered word segmentation, or a genuinely historical external key.

**Reproducers:** [`sims/lp2_plaintext_wordsum_progressive_sft.cjs`](../sims/lp2_plaintext_wordsum_progressive_sft.cjs) covers the 12 fixed variants, while [`sims/lp2_word_prime_self_slope_sft.cjs`](../sims/lp2_word_prime_self_slope_sft.cjs) exhausts the secret affine extension with the solved p57 positive plant. Both read unchanged repository resources. The existing manual `word-selfkey.yml` workflow contains the new run.
