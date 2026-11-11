# 2013 NUMBER on LP2 word-prime-sums: factor-index fold rejected

**Status:** Bounded negative for one explicit cross-round composition. No plaintext, key, or established LP2 mechanism was recovered.

## Human solve-path hypothesis

A solver sees three related source features:

1. The 2013 `0_wisdom` material demonstrates assigning each GP word a number by summing its Gematria Primus prime values.
2. The archived 2013 Cicada `NUMBER` command takes an integer, reverses it when the input is prime, and returns divisors; when both the input and its reversal are prime, it returns `+`.
3. The GP alphabet itself is indexed by the first 29 primes. The 2016 signed message says that the words' numbers are directional.

A compact composite hypothesis is therefore: for each word, compute its GP prime sum (n), apply the 2013 `NUMBER` rule, factor the selected integer, convert each prime factor to its zero-based ordinal in the prime sequence, sum those ordinals modulo 29, and map the result to a GP rune. The modulo-29 factor-index fold is **not** specified by the 2013 service; it is the single extra reduction tested here.

The `NUMBER` behavior is source-grounded in the archived 2013 service README:
- `NUMBER 283` reverses to 382 and returns divisors `[1,2,191,382]`.
- `NUMBER 222` returns divisors `[1,2,3,6,37,74,111,222]`.
- A prime whose reversal is also prime returns `+`.

The prime-index fold is a hypothesis layered on that behavior, not a claim about the service's own output.

## Fixed transformation

For a word with GP prime sum (n):

1. Let (r) be the decimal digit reversal of (n).
2. If (n) and (r) are both prime, emit the service's literal `+` marker.
3. Otherwise set (m=r) when (n) is prime, or (m=n) when (n) is composite.
4. Factor (m), retaining multiplicity. For each prime factor (p), take its zero-based ordinal among all primes.
5. Sum the ordinals and reduce modulo 29 to obtain one GP rune.

Using the full prime sequence and modulo 29 is needed to map factors beyond the first 29 GP prime weights. A stricter interpretation that refuses this extension leaves 241 of the 2,685 non-`+` LP2 outputs unmapped. The `+` marker is preserved as a special token; it is not silently converted to a GP rune. The 2013 `COUNT` command's `*` status is not emitted by `NUMBER` and is not included in the output.

For the 43-word signed 2016 message, the existing SFT's disclosed ASCII normalization `v→u, k→c, z→s` is used before GP tokenization. This is a test convention, not an independently authenticated instruction.

## Results

### Entire unknown LP2 stream

The canonical transcription parse is **2,896 words / 12,956 runes**.

- 211 words trigger the `+` case.
- 393 additional words have prime input and composite reversal (the `COUNT`-style star condition); these still go through `NUMBER` factorization and do not emit a star.
- 2,685 words produce a GP rune under the modulo-29 fold; only 2,444 satisfy the stricter first-29-prime/no-wrap interpretation.
- The output's GP index of coincidence is **0.04847**. This is above a uniform 29-symbol stream but not sufficient evidence of language.

A word-internal GP bigram/trigram model trained on the first 75% of the repository's Shakespeare control gives:

| Sequence | Mean log score |
|---|---:|
| Original LP2 ciphertext words | -4.65837 |
| Fold output, treating `+` as a boundary | -4.64952 |
| Fold output, removing `+` and concatenating | -4.60869 |
| Shakespeare holdout words | -2.16004 |

The transformed output is effectively as language-poor as the original ciphertext, and far below the native-language holdout. The small score changes do not establish plaintext.

### 2016 signed message's 43 words

The fixed source-order extraction gives 43 words. Their prime sums are:

`243, 72, 145, 224, 343, 436, 253, 72, 381, 243, 212, 84, 72, 219, 143, 179, 175, 72, 211, 114, 319, 84, 72, 204, 215, 114, 295, 175, 72, 337, 200, 215, 113, 196, 128, 130, 120, 102, 322, 292, 198, 217, 249`.

The fold produces 40 GP runes and three literal `+` markers:

`CTHJONEAEOTHTHCSRTHNGN+WTHOHPRTHWSHEWTH+RS+GFWOWJLGPD`

The original signed message, GP-encoded with the same normalization, scores **-2.51050**; the transformed sequence scores **-4.82605** with `+` as a boundary and **-4.80880** with `+` removed. It destroys rather than reveals the known readable message.

### Test as a 43-symbol key for p55

The p55 word-interior extraction (remove the first and last rune of each printed word) contains 43 runes in 17 word fragments. Aligning the 43 transformed 2016 tokens to those 43 runes is a source-motivated one-to-one test. The literal `+` positions are treated as zero shift (no-op); both GP29 signs are tested.

| Sequence | Mean log score |
|---|---:|
| p55 interior ciphertext | -4.77184 |
| p55 minus derived key | -4.62066 |
| p55 plus derived key | -4.73158 |

The apparent improvement for subtraction is not significant. With 10,000 fixed-seed permutations of the 40 non-`+` key values, preserving the three `+` positions and p55 word-fragment lengths, the empirical tail probabilities are **0.42846** (subtract) and **0.47545** (add). The extracted fragments remain non-linguistic.

## Decision

Reject this specific **GP word sum → 2013 NUMBER → prime-factor-ordinal sum mod 29** transformation as a plaintext recovery method and reject its 43-symbol output as a p55 key. The source-grounded `NUMBER` step does not validate the additional factor-index fold. The output fails a native GP language-model comparison, destroys the known 2016 message, and provides no advantage over shuffled keys on p55.

Do not continue tuning the fold with products, averages, offsets, alternate moduli, or arbitrary treatments of `+`. A different reduction would need an independent source clue or a locked prediction on original ciphertext.

## Reproduction

Run from the repository root with Node 18+:

```sh
node sims/lp2_2013_number_word_sum_factor_index_sft.cjs
```

The script reads only repository resources, reproduces the exact word parsing, applies the documented `NUMBER` branch behavior plus the disclosed factor-index hypothesis, scores against the existing Shakespeare GP model, and runs the 10,000-permutation p55 null test.

**Supporting implementation:** `sims/lp2_2013_number_word_sum_factor_index_sft.cjs`.

**Historical source:** [Archived 2013 first-onion README and NUMBER command examples](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/004-first-onion/README.md).

No change to `results/README.md`: this experiment rejects a candidate and establishes no new decryption.
